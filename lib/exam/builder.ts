import type { Question } from "@/lib/db/schema"

export const EXAM_QUOTAS = {
  p1: 6,
  p2: 2,
  p3: 2,
  p4: 1,
  p5: 3,
  p6: 3,
  p7: 3,
  p8: 2,
  p9: 2,
  p10: 2,
  p11: 2,
  p12: 1,
}

export const EXAM_TIME_MINUTES = 45
export const PASSING_SCORE = 60

interface BuildExamOptions {
  questions: Question[]
  seed?: number
  mode?: "exam" | "errors"
  errorQuestionIds?: string[]
}

export function buildExam({
  questions,
  seed = Date.now(),
  mode = "exam",
  errorQuestionIds,
}: BuildExamOptions): Question[] {
  if (mode === "errors" && errorQuestionIds) {
    // Build exam from error questions only
    return questions.filter((q) => errorQuestionIds.includes(q.id))
  }

  // Build regular exam with quotas
  const selectedQuestions: Question[] = []
  const rng = seededRandom(seed)

  for (const [categoryId, quota] of Object.entries(EXAM_QUOTAS)) {
    const categoryQuestions = questions.filter((q) => q.categoryId === categoryId)
    const shuffled = shuffleArray([...categoryQuestions], rng)
    selectedQuestions.push(...shuffled.slice(0, quota))
  }

  return shuffleArray(selectedQuestions, rng)
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
