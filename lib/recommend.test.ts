// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { quiz, services, team, type QuizExperience, type QuizGoal, type QuizPreference } from "../data/gym.ts";
import { pickTrainer, recommend, type QuizAnswers } from "./recommend.ts";

const data = { services, team, copy: quiz };
const goals = quiz.questions[0].options.map((o) => o.value) as QuizGoal[];
const levels = quiz.questions[1].options.map((o) => o.value) as QuizExperience[];
const prefs = quiz.questions[2].options.map((o) => o.value) as QuizPreference[];

test("the quiz has 4 × 3 × 4 = 48 combinations", () => {
  assert.equal(goals.length * levels.length * prefs.length, 48);
});

test("every combination returns a valid service, trainer, explanation and message", () => {
  let n = 0;
  for (const goal of goals)
    for (const experience of levels)
      for (const preference of prefs) {
        const r = recommend({ goal, experience, preference }, data);
        const where = `${goal}/${experience}/${preference}`;
        assert.ok(services.includes(r.service), `service is one of services (${where})`);
        assert.equal(r.service.id, quiz.serviceFor[preference], `service follows preference (${where})`);
        assert.ok(team.includes(r.trainer), `trainer is in the team (${where})`);
        assert.equal(r.explanation.length, 2);
        for (const line of r.explanation) {
          assert.ok(line.length > 20 && !line.includes("{"), `explanation filled (${where}): ${line}`);
        }
        assert.match(r.message, /^Ciao! Ho fatto il test sul sito: obiettivo .+, esperienza .+, preferenza .+\. Mi consigliate .+ con .+\. Vorrei prenotare una prova gratuita\.$/);
        assert.ok(r.message.includes(r.service.name) && r.message.includes(r.trainer.name));
        n++;
      }
  assert.equal(n, 48);
});

test("highest tag overlap wins", () => {
  const t = (a: QuizAnswers) => pickTrainer(a, team).id;
  assert.equal(t({ goal: "forza", experience: "esperto", preference: "personal" }), "trainer-02"); // forza + esperto
  assert.equal(t({ goal: "dimagrimento", experience: "principiante", preference: "sala" }), "trainer-01"); // 2 tags
  assert.equal(t({ goal: "benessere", experience: "principiante", preference: "functional" }), "trainer-05"); // functional + benessere
});

test("2-tag tie: trainer-03 (functional+intermedio) beats trainer-05 (functional+dimagrimento) on level", () => {
  assert.equal(pickTrainer({ goal: "dimagrimento", experience: "intermedio", preference: "functional" }, team).id, "trainer-03");
});

test("ties are broken by experience level match", () => {
  // ipertrofia + intermedio: trainer-04 has both (2). trainer-02 has ipertrofia only (1).
  assert.equal(pickTrainer({ goal: "ipertrofia", experience: "intermedio", preference: "sala" }, team).id, "trainer-04");
  // forza + principiante + functional: trainer-02 (forza), trainer-01/04 (principiante), trainer-03/05 (functional)
  // all score 1; experience match picks the first trainer with "principiante" -> trainer-01.
  assert.equal(pickTrainer({ goal: "forza", experience: "principiante", preference: "functional" }, team).id, "trainer-01");
});

test("explanation reads naturally", () => {
  const r = recommend({ goal: "dimagrimento", experience: "principiante", preference: "functional" }, data);
  assert.equal(r.explanation[0], "Le lezioni di functional sono il modo più coinvolgente per perdere peso: allenamenti di gruppo, intensi e mai uguali.");
  assert.equal(r.explanation[1], "Si parte dalle basi: tecnica, carichi giusti e nessuna fretta.");
  assert.equal(r.service.name, "Functional Training");
});
