import { createClient } from "@supabase/supabase-js"
import questionsData from "../user_read_only_context/text_attachments/questions-b4P0C.json"
import correctAnswersData from "../user_read_only_context/text_attachments/correct_answers-Z3Tvh.json"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importQuestions() {
  console.log("[v0] Starting import of 500 questions...")
  console.log(`[v0] Found ${questionsData.length} questions in JSON`)

  // First, delete all existing questions
  console.log("[v0] Deleting existing questions...")
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")

  if (deleteError) {
    console.error("[v0] Error deleting questions:", deleteError)
  } else {
    console.log("[v0] Existing questions deleted")
  }

  // Prepare questions for insert
  const questionsToInsert = questionsData.map((q: any) => {
    const key = `${q.chapter}-${q.number}`
    const correctAnswer = correctAnswersData[key as keyof typeof correctAnswersData]

    if (!correctAnswer) {
      console.warn(`[v0] Warning: No correct answer found for question ${key}`)
    }

    return {
      question_text: q.question,
      category: `פרק ${q.chapter}`,
      option_a: q.answers?.א || "",
      option_b: q.answers?.ב || "",
      option_c: q.answers?.ג || "",
      option_d: q.answers?.ד || "",
      correct_answer: correctAnswer || "א",
      question_image_url: null,
      explanation: null,
    }
  })

  console.log(`[v0] Prepared ${questionsToInsert.length} questions for insert`)

  // Insert in batches of 100
  const batchSize = 100
  let insertedCount = 0

  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize)
    console.log(
      `[v0] Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questionsToInsert.length / batchSize)}...`,
    )

    const { data, error } = await supabase.from("questions").insert(batch).select()

    if (error) {
      console.error(`[v0] Error inserting batch:`, error)
    } else {
      insertedCount += data?.length || 0
      console.log(`[v0] Batch inserted successfully. Total: ${insertedCount}`)
    }
  }

  console.log(`[v0] ✅ Import complete! Inserted ${insertedCount} questions`)

  // Verify counts per chapter
  const { data: counts } = await supabase.from("questions").select("category").order("category")

  if (counts) {
    const categoryCount: Record<string, number> = {}
    counts.forEach((c) => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
    })
    console.log("[v0] Questions per chapter:")
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} questions`)
    })
  }
}

importQuestions()
  .then(() => {
    console.log("[v0] Script finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Script failed:", error)
    process.exit(1)
  })
