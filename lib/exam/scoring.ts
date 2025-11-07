import { PASSING_SCORE } from "./builder"

export interface ScoringResult {
  score: number
  passed: boolean
  correctCount: number
  totalCount: number
  wrongQuestions: Array<{
    questionId: string
    userAnswer: string | null
    correctAnswer: string
  }>
}

export function calculateScore(
  userAnswers: Record<string, string>,
  correctAnswers: Record<string, string>,
): ScoringResult {
  const totalCount = Object.keys(correctAnswers).length
  let correctCount = 0
  const wrongQuestions: ScoringResult["wrongQuestions"] = []

  for (const [questionId, correctAnswer] of Object.entries(correctAnswers)) {
    const userAnswer = userAnswers[questionId] || null
    const isCorrect = userAnswer === correctAnswer

    if (isCorrect) {
      correctCount++
    } else {
      wrongQuestions.push({
        questionId,
        userAnswer,
        correctAnswer,
      })
    }
  }

  const score = Math.round((correctCount / totalCount) * 100)
  const passed = score >= PASSING_SCORE

  return {
    score,
    passed,
    correctCount,
    totalCount,
    wrongQuestions,
  }
}
