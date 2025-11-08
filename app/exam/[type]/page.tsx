import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ExamInterface from "@/components/exam/exam-interface"
import { EXAM_CONFIGS } from "@/lib/types"
import { SIMULATION_DISTRIBUTION } from "@/lib/utils/exam-distribution"

export default async function ExamPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Guest users (user = null) are now allowed to take exams without saving data

  if (!["simulation", "errors"].includes(type)) {
    redirect("/")
  }

  if (type === "errors" && !user) {
    redirect("/auth/login")
  }

  const examConfig = EXAM_CONFIGS[type]

  let questionsToUse = []

  if (type === "simulation") {
    // Fetch questions per chapter according to the distribution
    for (const dist of SIMULATION_DISTRIBUTION) {
      const { data: chapterQuestions, error } = await supabase
        .from("questions")
        .select("*")
        .ilike("category", `%פרק ${dist.chapter}%`)
        .limit(dist.count * 3) // Get 3x to have random selection

      if (chapterQuestions && chapterQuestions.length > 0) {
        // Randomly select the required count from available questions
        const shuffled = chapterQuestions.sort(() => Math.random() - 0.5)
        questionsToUse.push(...shuffled.slice(0, dist.count))
      } else {
        console.error(`[v0] No questions found for chapter ${dist.chapter}`)
      }
    }

    // Shuffle all questions to mix chapters
    questionsToUse = questionsToUse.sort(() => Math.random() - 0.5)

    console.log(`[v0] Loaded ${questionsToUse.length} questions for simulation exam`)
  } else {
    // For 'errors' mode, fetch user's previously incorrect answers
    if (user) {
      const { data: incorrectAnswers } = await supabase
        .from("user_answers")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("is_correct", false)
        .limit(10)

      if (incorrectAnswers && incorrectAnswers.length > 0) {
        const questionIds = incorrectAnswers.map((a) => a.question_id)
        const { data: errorQuestions } = await supabase.from("questions").select("*").in("id", questionIds)

        if (errorQuestions && errorQuestions.length > 0) {
          questionsToUse = errorQuestions
        }
      }
    }

    // If no error questions found, fetch random 10 questions
    if (questionsToUse.length === 0) {
      const { data: randomQuestions } = await supabase.from("questions").select("*").limit(10)

      if (randomQuestions) {
        questionsToUse = randomQuestions
      }
    }
  }

  if (questionsToUse.length === 0) {
    console.error("[v0] No questions loaded")
    redirect("/")
  }

  return <ExamInterface questions={questionsToUse} examConfig={examConfig} userId={user?.id || null} />
}
