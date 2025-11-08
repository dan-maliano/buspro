import type { Question } from "@/lib/types"

export interface ShuffledQuestion extends Omit<Question, "option_a" | "option_b" | "option_c" | "option_d"> {
  options: Array<{
    letter: "א" | "ב" | "ג" | "ד"
    text: string
    originalLetter: string
  }>
}

export function shuffleQuestionAnswers(question: Question): ShuffledQuestion {
  // Create array of options with their original letters
  const options = [
    { letter: "א" as const, text: question.option_a, originalLetter: "א" },
    { letter: "ב" as const, text: question.option_b, originalLetter: "ב" },
    { letter: "ג" as const, text: question.option_c, originalLetter: "ג" },
    { letter: "ד" as const, text: question.option_d, originalLetter: "ד" },
  ]

  // Shuffle the options using Fisher-Yates algorithm
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  // Reassign letters based on new positions
  const shuffledOptions = options.map((opt, index) => ({
    letter: ["א", "ב", "ג", "ד"][index] as "א" | "ב" | "ג" | "ד",
    text: opt.text,
    originalLetter: opt.originalLetter,
  }))

  // Find what the correct answer letter is now after shuffling
  const correctOption = shuffledOptions.find((opt) => opt.originalLetter === question.correct_answer)
  const newCorrectAnswer = correctOption?.letter || question.correct_answer

  return {
    ...question,
    options: shuffledOptions,
    correct_answer: newCorrectAnswer,
    // Store original correct answer for reference
    _originalCorrectAnswer: question.correct_answer,
  }
}
