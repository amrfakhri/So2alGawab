import categoriesData from '../../../data/categories.json';
import questionsData from '../../../data/questions.json';
import { shuffle } from '../../../shared/utils/shuffle';
import { Category, Question, Subcategory } from '../types/game';

const SUBCATEGORIES_PER_MATCH = 2;

export const availableCategories = categoriesData as Category[];
const allQuestions = questionsData as Question[];

export function getAllSubcategories(categories: Category[]): Subcategory[] {
  return categories.flatMap((category) => category.subcategories);
}

export const availableSubcategories = getAllSubcategories(availableCategories);

export function findSubcategoryById(subcategoryId: string): Subcategory | undefined {
  return availableSubcategories.find(
    (subcategory) => subcategory.id === subcategoryId,
  );
}

export function getQuestionCountBySubcategory(subcategoryId: string): number {
  return allQuestions.filter((question) => question.subcategoryId === subcategoryId).length;
}

export function isPresenterQuestion(question: Question): boolean {
  const subcategory = findSubcategoryById(question.subcategoryId);
  return subcategory?.type === 'image' || subcategory?.type === 'mixed';
}

export function buildQuestionDeck(selectedSubcategoryIds: string[]): Question[] {
  if (selectedSubcategoryIds.length !== SUBCATEGORIES_PER_MATCH) {
    throw new Error(`A match requires exactly ${SUBCATEGORIES_PER_MATCH} subcategories.`);
  }

  const selectedQuestions = selectedSubcategoryIds.flatMap((subcategoryId) => {
    const subcategoryQuestions = allQuestions.filter(
      (question) => question.subcategoryId === subcategoryId,
    );

    if (subcategoryQuestions.length === 0) {
      throw new Error(`Subcategory ${subcategoryId} does not have any questions.`);
    }

    return shuffle(subcategoryQuestions);
  });

  return shuffle(selectedQuestions);
}
