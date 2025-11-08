import { createClient } from "@supabase/supabase-js"
import questionsData from "../data/questions.json"
import correctAnswersData from "../data/correct_answers.json"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("[v0] Missing Supabase credentials!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedQuestions() {
  console.log("[v0] ===== STARTING QUESTION IMPORT =====")
  console.log(`[v0] Found ${questionsData.length} questions in JSON file`)

  // Step 1: Delete existing questions
  console.log("[v0] Step 1: Deleting existing questions...")
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000")

  if (deleteError) {
    console.error("[v0] Error deleting old questions:", deleteError)
  } else {
    console.log("[v0] ✓ Old questions deleted successfully")
  }

  // Step 2: Prepare questions for insertion
  console.log("[v0] Step 2: Preparing questions for insertion...")
  const questionsToInsert = questionsData.map((q: any) => {
    const key = `${q.chapter}-${q.number}`
    const correctAnswer = (correctAnswersData as any)[key]

    if (!correctAnswer) {
      console.warn(`[v0] Warning: No correct answer found for question ${key}`)
    }

    return {
      question_text: q.question,
      option_a: q.answers.א,
      option_b: q.answers.ב,
      option_c: q.answers.ג,
      option_d: q.answers.ד,
      correct_answer: correctAnswer || "א",
      category: `פרק ${q.chapter}`,
      explanation: null,
      question_image_url: null,
    }
  })

  console.log(`[v0] ✓ Prepared ${questionsToInsert.length} questions`)

  // Step 3: Insert in batches
  console.log("[v0] Step 3: Inserting questions in batches...")
  const batchSize = 100
  let totalInserted = 0

  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize)
    const { error, data } = await supabase.from("questions").insert(batch).select()

    if (error) {
      console.error(`[v0] ✗ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
    } else {
      totalInserted += batch.length
      console.log(
        `[v0] ✓ Batch ${Math.floor(i / batchSize) + 1}: Inserted ${batch.length} questions (${totalInserted}/${questionsToInsert.length})`,
      )
    }
  }

  // Step 4: Verify insertion
  console.log("[v0] Step 4: Verifying insertion...")
  const { count, error: countError } = await supabase.from("questions").select("*", { count: "exact", head: true })

  if (countError) {
    console.error("[v0] Error counting questions:", countError)
  } else {
    console.log(`[v0] ✓ Total questions in database: ${count}`)
  }

  // Step 5: Verify chapter distribution
  console.log("[v0] Step 5: Checking chapter distribution...")
  for (let chapter = 1; chapter <= 13; chapter++) {
    const { count: chapterCount } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("category", `פרק ${chapter}`)

    console.log(`[v0]   פרק ${chapter}: ${chapterCount} שאלות`)
  }

  console.log("[v0] ===== IMPORT COMPLETE =====")
}

seedQuestions().catch((error) => {
  console.error("[v0] Fatal error:", error)
  process.exit(1)
})
