import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ExamInterface from "@/components/exam/exam-interface"
import { EXAM_CONFIGS } from "@/lib/types"

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

  // Fetch questions
  const { data: allQuestions, error } = await supabase.from("questions").select("*").limit(examConfig.totalQuestions)

  if (error || !allQuestions) {
    console.error("[v0] Failed to fetch questions:", error)
    redirect("/")
  }

  // For 'errors' mode, fetch user's previously incorrect answers
  let questionsToUse = allQuestions
  if (type === "errors" && user) {
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

  return <ExamInterface questions={questionsToUse} examConfig={examConfig} userId={user?.id || null} />
}
