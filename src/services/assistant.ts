import { FALLBACK_ANSWER, KNOWLEDGE_BASE } from '@/data/assistant';

/** LOCAL SIMULATION — keyword-matched demo answers. Swap for an LLM endpoint later. */
export async function askAssistant(question: string): Promise<string> {
  const q = question.toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 700));

  let best: { score: number; answer: string } = { score: 0, answer: FALLBACK_ANSWER };
  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.reduce((s, k) => (q.includes(k) ? s + k.length : s), 0);
    if (score > best.score) best = { score, answer: entry.answer };
  }
  return best.answer;
}
