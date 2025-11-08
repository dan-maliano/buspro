import questionsData from "../data/questions.json"
import correctAnswersData from "../data/correct_answers.json"

interface QuestionData {
  chapter: number
  number: number
  question: string
  answers: {
    א?: string
    ב?: string
    ג?: string
    ד?: string
  }
}

interface CorrectAnswersData {
  [key: string]: string
}

const questions = questionsData as QuestionData[]
const correctAnswers = correctAnswersData as CorrectAnswersData

// Category mapping based on chapters
const categoryMap: { [key: number]: string } = {
  1: "חוקי תנועה",
  2: "זיהוי סימנים",
  3: "בטיחות",
  4: "ביצועי רכב",
  5: "מערכות רכב",
  6: "תחזוקה",
  7: "ניהול נהיגה",
  8: "נהיגה בטוחה",
  9: "חירום",
  10: "תקנות",
  11: "סביבה",
  12: "שירות לקוחות",
  13: "מקרי קיצון",
}

// Generate SQL insert statements
console.log("-- Delete existing demo questions")
console.log("DELETE FROM user_answers;")
console.log("DELETE FROM questions;")
console.log("")

console.log("-- Insert real questions from JSON")

questions.forEach((q) => {
  if (!q.question || Object.keys(q.answers).length === 0) {
    // Skip empty questions
    return
  }

  const key = `${q.chapter}-${q.number}`
  const correctAnswer = correctAnswers[key]

  if (!correctAnswer) {
    console.error(`-- Missing correct answer for ${key}`)
    return
  }

  const category = categoryMap[q.chapter] || "כללי"

  // Escape single quotes for SQL
  const escapeSQL = (str: string) => str.replace(/'/g, "''")

  const questionText = escapeSQL(q.question)
  const optionA = escapeSQL(q.answers.א || "")
  const optionB = escapeSQL(q.answers.ב || "")
  const optionC = escapeSQL(q.answers.ג || "")
  const optionD = escapeSQL(q.answers.ד || "")

  console.log(
    `INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, explanation, chapter_number, question_number)`,
  )
  console.log(
    `VALUES ('${questionText}', '${optionA}', '${optionB}', '${optionC}', '${optionD}', '${correctAnswer}', '${category}', NULL, ${q.chapter}, ${q.number});`,
  )
  console.log("")
})

console.log("-- Questions import complete")
