import { QUESTIONS, type Answers } from "@/survey/questions";

/** A complete, valid answer set; `likert` sets every core item. */
export function makeAnswers(likert = 3, activity = "curious"): Answers {
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    if (q.type === "single") answers[q.id] = q.options[0];
    if (q.type === "country") answers[q.id] = "DE";
    if (q.type === "likert") answers[q.id] = q.attentionCheck ?? likert;
    if (q.type === "activity") answers[q.id] = activity;
    if (q.type === "scale5") answers[q.id] = 3;
  }
  return answers;
}
