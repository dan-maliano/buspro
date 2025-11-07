export type Question = {
  id: string
  question_text: string
  question_image_url: string | null
  category: string
  correct_answer: "A" | "B" | "C" | "D"
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  explanation: string | null
  created_at: string
}

export type ExamSession = {
  id: string
  user_id: string
  exam_type: "simulation" | "practice" | "errors"
  start_time: string
  end_time: string | null
  time_limit_seconds: number | null
  score: number | null
  total_questions: number
  passed: boolean | null
  created_at: string
}

export type UserAnswer = {
  id: string
  session_id: string
  question_id: string
  user_answer: "A" | "B" | "C" | "D"
  is_correct: boolean
  time_spent_seconds: number | null
  created_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export type ExamConfig = {
  type: "simulation" | "practice" | "errors"
  totalQuestions: number
  timeLimitSeconds: number | null
  passingScore: number
}

export const EXAM_CONFIGS: Record<string, ExamConfig> = {
  simulation: {
    type: "simulation",
    totalQuestions: 30,
    timeLimitSeconds: 40 * 60, // 40 minutes
    passingScore: 26, // Need 26/30 correct
  },
  practice: {
    type: "practice",
    totalQuestions: 15,
    timeLimitSeconds: null, // No time limit
    passingScore: 0, // No pass/fail
  },
  errors: {
    type: "errors",
    totalQuestions: 10,
    timeLimitSeconds: null,
    passingScore: 0,
  },
}
