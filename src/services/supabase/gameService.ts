import { Category, Question } from '../../features/game/types/game';
import { shuffle } from '../../shared/utils/shuffle';
import { fetchQuestionsPage, normalizeQuestion } from './questionService';

export const MIN_SUBCATEGORIES_PER_MATCH = 2;
export const MAX_SUBCATEGORIES_PER_MATCH = 6;
const QUESTIONS_PAGE_SIZE = 50;

function buildCategoryLookups(categories: Category[]) {
  const categoriesById = new Map<string, string>();
  const subcategoriesById = new Map<string, { categoryId: string; name: string }>();

  for (const category of categories) {
    categoriesById.set(category.id, category.name);

    for (const subcategory of category.subcategories) {
      subcategoriesById.set(subcategory.id, {
        categoryId: category.id,
        name: subcategory.name,
      });
    }
  }

  return { categoriesById, subcategoriesById };
}

export async function buildQuestionDeckForMatch(
  selectedSubcategoryIds: string[],
  categories: Category[],
): Promise<Question[]> {
  if (
    selectedSubcategoryIds.length < MIN_SUBCATEGORIES_PER_MATCH ||
    selectedSubcategoryIds.length > MAX_SUBCATEGORIES_PER_MATCH
  ) {
    throw new Error(`اختر من ${MIN_SUBCATEGORIES_PER_MATCH} إلى ${MAX_SUBCATEGORIES_PER_MATCH} فئات.`);
  }

  const rawQuestions = await fetchQuestionsPage({
    selectedSubcategoryIds,
    pageSize: QUESTIONS_PAGE_SIZE,
  });
  const lookups = buildCategoryLookups(categories);
  const normalizedQuestions = rawQuestions.map((row) => normalizeQuestion(row, lookups));
  const questionsBySubcategory = new Map<string, Question[]>();

  for (const question of normalizedQuestions) {
    const current = questionsBySubcategory.get(question.subcategoryId) ?? [];
    current.push(question);
    questionsBySubcategory.set(question.subcategoryId, current);
  }

  for (const subcategoryId of selectedSubcategoryIds) {
    if ((questionsBySubcategory.get(subcategoryId) ?? []).length === 0) {
      throw new Error('أحد التصنيفات المختارة لا يحتوي على أسئلة متاحة حالياً.');
    }
  }

  const selectedQuestions = selectedSubcategoryIds.flatMap((subcategoryId) =>
    shuffle(questionsBySubcategory.get(subcategoryId) ?? []),
  );

  return shuffle(selectedQuestions);
}
