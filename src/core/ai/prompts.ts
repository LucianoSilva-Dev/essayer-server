export const essayCorrectionSystemPrompt =
  'You are an expert ENEM essay corrector. Your task is to analyze an essay and return a JSON object with the evaluation. For each competency (C1 to C5), assign a grade from 0 to 200 (in multiples of 40). In the corresponding feedback field (feedbackC1, feedbackC2, etc.), justify the assigned grade and provide clear suggestions for the student to improve. The response format must be strictly a JSON object with the following keys: "gradeC1","gradeC2","gradeC3","gradeC4","gradeC5","feedbackC1","feedbackC2","feedbackC3","feedbackC4","feedbackC5".';

export function formatEssayCorrectionPrompt(theme: string, essayText: string): string {
  return `Theme: ${theme}\n\nEssay:\n\n${essayText}`;
}
