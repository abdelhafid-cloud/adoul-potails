import type { AssistantLang, AssistantQAItem } from "@/types/assistant";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s\u0600-\u06FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreItem(input: string, item: AssistantQAItem, lang: AssistantLang): number {
  const norm = normalize(input);
  if (!norm) return 0;

  const keywords = lang === "fr" ? item.keywords_fr : item.keywords_darija;
  const question = normalize(lang === "fr" ? item.question_fr : item.question_darija);

  let score = 0;
  for (const kw of keywords) {
    const nkw = normalize(kw);
    if (nkw && norm.includes(nkw)) score += 3;
  }

  const qWords = question.split(" ").filter((w) => w.length > 2);
  for (const w of qWords) {
    if (norm.includes(w)) score += 1;
  }

  if (norm === question) score += 10;
  if (question.includes(norm) || norm.includes(question)) score += 5;

  return score;
}

export function matchAssistantQuestion(
  input: string,
  items: AssistantQAItem[],
  lang: AssistantLang,
  minScore = 2,
): AssistantQAItem | null {
  let best: AssistantQAItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    const s = scoreItem(input, item, lang);
    if (s > bestScore) {
      bestScore = s;
      best = item;
    }
  }

  return bestScore >= minScore ? best : null;
}

export function getAnswer(item: AssistantQAItem, lang: AssistantLang): string {
  return lang === "fr" ? item.answer_fr : item.answer_darija;
}

export function getQuestion(item: AssistantQAItem, lang: AssistantLang): string {
  return lang === "fr" ? item.question_fr : item.question_darija;
}
