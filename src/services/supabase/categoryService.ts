import { Category, Subcategory, SubcategoryType } from '../../features/game/types/game';
import { Json } from './database.types';
import { supabase } from './supabaseClient';

type ListRow = {
  created_at: string;
  id: string;
  title: string;
  categories: {
    id: string;
    list_id: string;
    name: string;
    image_path: string | null;
    sort_order: number;
  }[];
};

type QuestionSummaryRow = {
  category_id: string | null;
  question_media: { media_type: 'image' | 'video' | 'audio' }[];
  question_metadata: { hints: Json } | null;
};

function toQuestionType(
  summaries: QuestionSummaryRow[],
): SubcategoryType {
  const hasMedia = summaries.some((summary) => summary.question_media.length > 0);
  const hasFocusQuestion = summaries.some((summary) => {
    const hints = summary.question_metadata?.hints;
    return (
      hints &&
      typeof hints === 'object' &&
      !Array.isArray(hints) &&
      hints.questionTypeView === 'Focus_Before_The_Question'
    );
  });

  if (hasMedia && hasFocusQuestion) {
    return 'mixed';
  }

  if (hasMedia) {
    return 'image';
  }

  return 'text';
}

function buildDescription(type: SubcategoryType): string {
  if (type === 'image') {
    return 'أسئلة مدعومة بصورة أو وسائط من قاعدة البيانات.';
  }

  if (type === 'mixed') {
    return 'أسئلة متنوعة بين العرض البصري والإجابة المباشرة.';
  }

  return 'أسئلة نصية مباشرة من قاعدة البيانات.';
}

export async function fetchGameCategories(): Promise<Category[]> {
  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('id,title,created_at,categories(id,list_id,name,image_path,sort_order)')
    .order('created_at', { ascending: true })
    .order('sort_order', { ascending: true, foreignTable: 'categories' });

  if (listsError) {
    throw listsError;
  }

  const { data: questionSummaries, error: questionSummariesError } = await supabase
    .from('questions')
    .select('category_id,question_media(media_type),question_metadata(hints),game_settings!inner(status)')
    .is('deleted_at', null)
    .eq('game_settings.status', 'active')
    .not('category_id', 'is', null);

  if (questionSummariesError) {
    throw questionSummariesError;
  }

  const summariesByCategory = new Map<string, QuestionSummaryRow[]>();
  for (const summary of (questionSummaries ?? []) as QuestionSummaryRow[]) {
    if (!summary.category_id) {
      continue;
    }

    const current = summariesByCategory.get(summary.category_id) ?? [];
    current.push(summary);
    summariesByCategory.set(summary.category_id, current);
  }

  return ((lists ?? []) as ListRow[]).map((list) => ({
    id: list.id,
    name: list.title,
    subcategories: (list.categories ?? []).map((subcategory): Subcategory => {
      const summaries = summariesByCategory.get(subcategory.id) ?? [];
      const type = toQuestionType(summaries);

      return {
        id: subcategory.id,
        categoryId: list.id,
        name: subcategory.name,
        image:
          subcategory.image_path
            ? supabase
                .storage
                .from('question-media')
                .getPublicUrl(subcategory.image_path)
                .data.publicUrl
            : '',
        description: buildDescription(type),
        type,
        remainingQuestionCount: summaries.length,
      };
    }),
  }));
}
