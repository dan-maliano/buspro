import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import questionsData from "@/data/questions.json"
import correctAnswersData from "@/data/correct_answers.json"
import { randomUUID } from "crypto"

export async function POST() {
  try {
    const supabase = await createClient()

    console.log("[v0] Starting import of 500 questions...")

    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (deleteError) {
      console.error("[v0] Error deleting old questions:", deleteError)
    }

    console.log("[v0] Deleted old questions successfully")

    const questionsToInsert = questionsData.map((q: any) => {
      const answerKey = `${q.chapter}-${q.number}`
      const correctAnswer = correctAnswersData[answerKey as keyof typeof correctAnswersData]

      if (!correctAnswer) {
        console.warn(`[v0] Missing correct answer for ${answerKey}`)
      }

      return {
        id: randomUUID(), // Generate UUID for each question
        question_text: q.question,
        option_a: q.answers["א"],
        option_b: q.answers["ב"],
        option_c: q.answers["ג"],
        option_d: q.answers["ד"],
        correct_answer: correctAnswer || "א",
        category: `פרק ${q.chapter}`,
        explanation: null,
        question_image_url: null,
      }
    })

    console.log(`[v0] Prepared ${questionsToInsert.length} questions for import`)
    console.log(`[v0] Sample question:`, questionsToInsert[0])

    const batchSize = 50 // Reduced batch size for stability
    let importedCount = 0

    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize)

      const { data, error: insertError } = await supabase.from("questions").insert(batch).select()

      if (insertError) {
        console.error(`[v0] Error inserting batch ${i / batchSize + 1}:`, insertError)
        console.error(`[v0] Error details:`, JSON.stringify(insertError, null, 2))
        console.error(`[v0] Sample question from failed batch:`, batch[0])

        return NextResponse.json(
          {
            error: `Failed to insert batch ${i / batchSize + 1}`,
            details: insertError.message,
            hint: insertError.hint,
            code: insertError.code,
          },
          { status: 500 },
        )
      }

      importedCount += batch.length
      console.log(`[v0] Imported ${importedCount}/${questionsToInsert.length} questions`)
    }

    const { count, error: countError } = await supabase.from("questions").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("[v0] Error counting questions:", countError)
    }

    console.log(`[v0] Import complete! Total questions in DB: ${count}`)

    return NextResponse.json({
      success: true,
      imported: importedCount,
      total: count,
      message: `Successfully imported ${importedCount} questions. Total in database: ${count}`,
    })
  } catch (error: any) {
    console.error("[v0] Import error:", error)
    return NextResponse.json(
      {
        error: "Import failed",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
