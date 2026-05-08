import { Category, Question } from '../../features/game/types/game';
import { shuffle } from '../../shared/utils/shuffle';
import { fetchQuestionsPage, normalizeQuestion } from './questionService';

export const SUBCATEGORIES_PER_MATCH = 2;
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
  if (selectedSubcategoryIds.length !== SUBCATEGORIES_PER_MATCH) {
    throw new Error(`A match requires exactly ${SUBCATEGORIES_PER_MATCH} subcategories.`);
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
