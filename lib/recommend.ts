// "Trova il tuo percorso": pure recommendation logic (no React, no I/O).
// Data is passed in, so the same function serves the UI and the unit tests.
import type { QuizExperience, QuizGoal, QuizPreference, Service, Trainer } from "../data/gym";

export type QuizAnswers = { goal: QuizGoal; experience: QuizExperience; preference: QuizPreference };

type QuizCopy = {
  serviceFor: Record<QuizPreference, string>;
  goalLabel: Record<QuizGoal, string>;
  experienceLabel: Record<QuizExperience, string>;
  preferenceLabel: Record<QuizPreference, string>;
  preferenceLine: Record<QuizPreference, string>;
  goalPhrase: Record<QuizGoal, string>;
  experienceLine: Record<QuizExperience, string>;
};

export type Recommendation = {
  service: Service;
  trainer: Trainer;
  /** two sentences explaining the choice */
  explanation: [string, string];
  /** prefilled WhatsApp text */
  message: string;
};

/**
 * Trainer = highest overlap between their tags and the three answers.
 * Ties: the one whose tags include the experience level wins; then list order
 * (stable, so the result is deterministic).
 */
export function pickTrainer(answers: QuizAnswers, team: Trainer[]): Trainer {
  const wanted = new Set<string>([answers.goal, answers.experience, answers.preference]);
  let best = team[0];
  let bestKey = -1;
  for (const t of team) {
    const overlap = t.tags.filter((tag) => wanted.has(tag)).length;
    const levelMatch = (t.tags as string[]).includes(answers.experience) ? 1 : 0;
    const key = overlap * 10 + levelMatch;
    if (key > bestKey) {
      best = t;
      bestKey = key;
    }
  }
  return best;
}

export function recommend(
  answers: QuizAnswers,
  data: { services: Service[]; team: Trainer[]; copy: QuizCopy },
): Recommendation {
  const { copy } = data;
  const serviceId = copy.serviceFor[answers.preference];
  const service = data.services.find((s) => s.id === serviceId);
  if (!service) throw new Error(`Unknown service for preference "${answers.preference}"`);
  const trainer = pickTrainer(answers, data.team);

  const line1 = copy.preferenceLine[answers.preference].replace("{goal}", copy.goalPhrase[answers.goal]);
  const line2 = copy.experienceLine[answers.experience];

  const message =
    `Ciao! Ho fatto il test sul sito: obiettivo ${copy.goalLabel[answers.goal]}, ` +
    `esperienza ${copy.experienceLabel[answers.experience]}, preferenza ${copy.preferenceLabel[answers.preference]}. ` +
    `Mi consigliate ${service.name} con ${trainer.name}. Vorrei prenotare una prova gratuita.`;

  return { service, trainer, explanation: [line1, line2], message };
}
