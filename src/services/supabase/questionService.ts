import { Question } from '../../features/game/types/game';
import { Json } from './database.types';
import { supabase } from './supabaseClient';

type MetadataRecord = Record<string, Json | undefined>;

type RawQuestionRow = {
  id: string;
  list_id: string;
  category_id: string | null;
  question: string;
  correct_answer: string | null;
  question_media: {
    media_type: 'image' | 'video' | 'audio';
    media_url: string;
    sort_order: number;
  }[];
  question_metadata: {
    hints: Json;
    notes: Json;
  } | null;
  game_settings: {
    class: string | null;
    layout_template: number | null;
    points: number;
    sort_order: number;
    status: 'active' | 'inactive';
  } | null;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getMetadataRecord(value: Json | null | undefined): MetadataRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as MetadataRecord;
}

function extractHint(hints: Json | null | undefined): string {
  const hintsRecord = getMetadataRecord(hints);
  const hintQuestion = getMetadataRecord((hintsRecord?.hintQuestion as Json) ?? null);

  if (!hintQuestion) {
    return '';
  }

  const keys = ['hint1', 'hint2', 'hint3', 'hint4', 'hint5'];
  for (const key of keys) {
    const value = hintQuestion[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function extractOptions(notes: Json | null | undefined, correctAnswer: string): string[] {
  if (!Array.isArray(notes)) {
    return [];
  }

  const options = notes
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);

  if (options.length < 2) {
    return [];
  }

  const normalizedCorrectAnswer = normalizeText(correctAnswer);
  const containsCorrectAnswer = options.some(
    (option) => normalizeText(option) === normalizedCorrectAnswer,
  );

  return containsCorrectAnswer ? options : [];
}

function getCorrectIndex(options: string[], correctAnswer: string): number {
  const normalizedCorrectAnswer = normalizeText(correctAnswer);

  return Math.max(
    0,
    options.findIndex((option) => normalizeText(option) === normalizedCorrectAnswer),
  );
}

export interface FetchQuestionsParams {
  page?: number;
  pageSize?: number;
  selectedSubcategoryIds: string[];
}

export async function fetchQuestionsPage({
  page = 0,
  pageSize = 50,
  selectedSubcategoryIds,
}: FetchQuestionsParams): Promise<RawQuestionRow[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('questions')
    .select(`
      id,
      list_id,
      category_id,
      question,
      correct_answer,
      question_media ( media_type, media_url, sort_order ),
      question_metadata ( hints, notes ),
      game_settings!inner ( class, layout_template, points, sort_order, status )
    `)
    .in('category_id', selectedSubcategoryIds)
    .is('deleted_at', null)
    .eq('game_settings.status', 'active')
    .range(from, to);

  if (error) {
    throw error;
  }

  return (data ?? []) as RawQuestionRow[];
}

export function normalizeQuestion(
  row: RawQuestionRow,
  lookups: {
    categoriesById: Map<string, string>;
    subcategoriesById: Map<string, { categoryId: string; name: string }>;
  },
): Question {
  const correctAnswerText = row.correct_answer?.trim() || 'لا توجد إجابة محفوظة';
  const notes = row.question_metadata?.notes ?? null;
  const options = extractOptions(notes, correctAnswerText);
  const media = [...(row.question_media ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
  const subcategoryId = row.category_id ?? '';
  const subcategoryLookup = lookups.subcategoriesById.get(subcategoryId);
  const categoryId = subcategoryLookup?.categoryId ?? row.list_id;

  return {
    id: row.id,
    categoryId,
    categoryName: lookups.categoriesById.get(categoryId) ?? 'الفئة',
    subcategoryId,
    subcategoryName: subcategoryLookup?.name ?? 'التصنيف',
    prompt: row.question,
    mediaType: media?.media_type,
    mediaUrl: media?.media_url,
    options: options.length > 0 ? options : [correctAnswerText],
    correctIndex: options.length > 0 ? getCorrectIndex(options, correctAnswerText) : 0,
    correctAnswerText,
    points: row.game_settings?.points ?? 200,
    hint: extractHint(row.question_metadata?.hints ?? null),
    answerMode: options.length > 1 ? 'mcq' : 'presenter',
  };
}
