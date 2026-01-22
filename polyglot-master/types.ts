
export type TargetLanguage = 'Finnish' | 'German' | 'Japanese' | 'Swedish' | 'Korean' | 'English';

export interface WordToken {
  text: string;
  def: string;
  pos: string;
  grammar: string;
}

export interface DictionaryResult {
  term: string;
  definition: string;
  pos: string;
  related_grammar: string;
  related_vocab: string[];
  example: string;
}

export interface VocabItem {
  id: string;
  word: string;
  translation: string;
  definition: string;
  pronunciation: string;
  collocations: string[];
  context: string;
  example: string;
  language: TargetLanguage;
  isMistake: boolean;
  isImportant: boolean;
  createdAt: number;
}

export interface SentenceItem {
  id: string;
  original: string;
  translation: string;
  analysis: string;
  language: TargetLanguage;
  createdAt: number;
}

export interface GrammarItem {
  id: string;
  rule: string;
  explanation: string;
  examples: string[];
  language: TargetLanguage;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: WordToken[];
  translation?: string;
  correction?: {
    original: string;
    suggested: string;
    explanation: string;
  };
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  description: string;
  cheatSheet: string[];
  isCustom?: boolean;
}

export interface JournalEntry {
  id: string;
  original: string;
  optimized: string;
  analysis: string;
  vocabSuggestions: any[];
  createdAt: number;
}
