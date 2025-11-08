import { createClient } from "@supabase/supabase-js"
import questionsData from "../data/questions.json"
import correctAnswersData from "../data/correct_answers.json"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map chapter numbers to category names
const categoryMap: Record<number, string> = {
  1: "טכנולוגיית הרכב",
  2: "מערכות הרכב",
  3: "בטיחות ותחזוקה",
  4: "חוקי תנועה",
  5: "נהיגה מעשית",
  6: "עזרה ראשונה",
  7: "מכניקה בסיסית",
  8: "מערכות בטיחות",
  9: "נהיגה מתקדמת",
  10: "חוקי רישוי",
  11: "מערכות אלקטרוניות",
  12: "תחזוקה מונעת",
  13: "כללי נהיגה",
}

async function importQuestions() {
  console.log("🚀 Starting questions import...")

  // First, delete all existing questions
  console.log("🗑️  Deleting existing questions...")
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

  if (deleteError) {
    console.error("❌ Error deleting questions:", deleteError)
    return
  }

  console.log("✅ Existing questions deleted")

  let successCount = 0
  let errorCount = 0

  for (const question of questionsData) {
    // Skip empty questions
    if (!question.question || !question.answers || Object.keys(question.answers).length === 0) {
      console.log(`⏭️  Skipping empty question ${question.chapter}-${question.number}`)
      continue
    }

    const key = `${question.chapter}-${question.number}`
    const correctAnswer = correctAnswersData[key as keyof typeof correctAnswersData]

    if (!correctAnswer) {
      console.log(`⚠️  No correct answer for ${key}`)
      errorCount++
      continue
    }

    // Get category name
    const category = categoryMap[question.chapter] || `פרק ${question.chapter}`

    // Insert question with fixed answer positions
    const { error } = await supabase.from("questions").insert({
      question_text: question.question,
      option_a: question.answers.א || "",
      option_b: question.answers.ב || "",
      option_c: question.answers.ג || "",
      option_d: question.answers.ד || "",
      correct_answer: correctAnswer,
      category: category,
      explanation: `התשובה הנכונה היא ${correctAnswer}`,
      question_image_url: null,
    })

    if (error) {
      console.error(`❌ Error inserting question ${key}:`, error)
      errorCount++
    } else {
      successCount++
      if (successCount % 50 === 0) {
        console.log(`✨ Imported ${successCount} questions...`)
      }
    }
  }

  console.log("\n🎉 Import completed!")
  console.log(`✅ Successfully imported: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
}

importQuestions()
