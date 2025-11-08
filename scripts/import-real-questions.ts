import { createClient } from "@supabase/supabase-js"
import questionsData from "../data/questions.json"
import correctAnswersData from "../data/correct_answers.json"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface QuestionData {
  chapter: number
  number: number
  question: string
  answers: {
    א: string
    ב: string
    ג: string
    ד: string
  }
}

interface CorrectAnswersData {
  [key: string]: string
}

const questions: QuestionData[] = questionsData as QuestionData[]
const correctAnswers: CorrectAnswersData = correctAnswersData as CorrectAnswersData

async function importQuestions() {
  console.log("[v0] Starting import of questions...")

  // First, delete all existing questions
  const { error: deleteError } = await supabase.from("questions").delete().neq("id", 0) // Delete all rows

  if (deleteError) {
    console.error("[v0] Error deleting existing questions:", deleteError)
    throw deleteError
  }

  console.log("[v0] Deleted existing questions")

  let importedCount = 0
  let skippedCount = 0

  for (const q of questions) {
    // Skip empty questions
    if (!q.question || q.question.trim() === "") {
      skippedCount++
      continue
    }

    // Skip questions with empty answers
    if (!q.answers.א && !q.answers.ב && !q.answers.ג && !q.answers.ד) {
      skippedCount++
      continue
    }

    const key = `${q.chapter}-${q.number}`
    const correctAnswer = correctAnswers[key]

    if (!correctAnswer) {
      console.warn(`[v0] No correct answer found for question ${key}`)
      skippedCount++
      continue
    }

    // Category mapping based on chapter
    const categoryMap: { [key: number]: string } = {
      1: "מערכות הרכב הציבורי (טכנולוגיה)",
      2: "עמדת הנהג ותאי הנוסעים",
      3: "אמצעי הפעלה ובקרה",
      4: "הציוד ברכב ומהומת המנוע",
      5: "תפעול מערכות הרכב",
      6: "הוראות בטיחות ואיכות הסביבה",
      7: "מערכות בטיחות חדישות",
      8: "נהיגה נכונה ונסיעה בטוחה",
      9: "ציוד בטיחות ואמצעי חירום",
      10: "תחזוקה מונעת ובדיקה תקופתית",
      11: "תקלות טכניות",
      12: "מידע טכני ומפרטים",
      13: "עצות מעשיות",
    }

    const category = categoryMap[q.chapter] || `פרק ${q.chapter}`

    try {
      const { error: insertError } = await supabase.from("questions").insert({
        question_text: q.question,
        option_a: q.answers.א || "",
        option_b: q.answers.ב || "",
        option_c: q.answers.ג || "",
        option_d: q.answers.ד || "",
        correct_answer: correctAnswer,
        category: category,
        chapter: q.chapter,
      })

      if (insertError) {
        console.error(`[v0] Error inserting question ${key}:`, insertError)
        skippedCount++
      } else {
        importedCount++
        if (importedCount % 50 === 0) {
          console.log(`[v0] Imported ${importedCount} questions...`)
        }
      }
    } catch (error) {
      console.error(`[v0] Exception inserting question ${key}:`, error)
      skippedCount++
    }
  }

  console.log(`[v0] Import complete!`)
  console.log(`[v0] Successfully imported: ${importedCount} questions`)
  console.log(`[v0] Skipped: ${skippedCount} questions`)
}

// Run the import
importQuestions()
  .then(() => {
    console.log("[v0] Import script finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Import script failed:", error)
    process.exit(1)
  })
