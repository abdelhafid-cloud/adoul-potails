export type AssistantLang = "fr" | "darija";

export interface AssistantCategory {
  id: string;
  label_fr: string;
  label_darija: string;
}

export interface AssistantQAItem {
  id: string;
  category: string;
  keywords_fr: string[];
  keywords_darija: string[];
  question_fr: string;
  question_darija: string;
  answer_fr: string;
  answer_darija: string;
}

export interface AssistantQAData {
  version: string;
  description: string;
  categories: AssistantCategory[];
  items: AssistantQAItem[];
}

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  language?: AssistantLang;
  text: string;
  content?: string;
  matchedId?: string;
  timestamp?: number;
  created_at?: string;
  streaming?: boolean;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  preview?: string | null;
  message_count?: number;
  provider?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistantStatus {
  flowise_configured: boolean;
  provider: string;
}
