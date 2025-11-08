import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ExamInterface from "@/components/exam/exam-interface"
import { EXAM_CONFIGS } from "@/lib/types"
import { SIMULATION_DISTRIBUTION } from "@/lib/utils/exam-distribution"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
    console.log("[v0] Loading simulation exam questions...")

    for (const dist of SIMULATION_DISTRIBUTION) {
      const { data: chapterQuestions, error } = await supabase
        .from("questions")
        .select("*")
        .ilike("category", `%פרק ${dist.chapter}%`)
        .limit(dist.count * 3)

      if (error) {
        console.error(`[v0] Error fetching questions for chapter ${dist.chapter}:`, error)
      }

      if (chapterQuestions && chapterQuestions.length > 0) {
        const shuffled = chapterQuestions.sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, Math.min(dist.count, chapterQuestions.length))
        questionsToUse.push(...selected)
        console.log(`[v0] Loaded ${selected.length}/${dist.count} questions for chapter ${dist.chapter}`)
      } else {
        console.warn(`[v0] No questions found for chapter ${dist.chapter}`)
      }
    }

    if (questionsToUse.length < 30) {
      console.log(`[v0] Only ${questionsToUse.length} questions loaded, fetching additional questions...`)
      const { data: additionalQuestions } = await supabase
        .from("questions")
        .select("*")
        .limit(30 - questionsToUse.length)

      if (additionalQuestions) {
        questionsToUse.push(...additionalQuestions)
      }
    }

    questionsToUse = questionsToUse.sort(() => Math.random() - 0.5)

    console.log(`[v0] Total loaded: ${questionsToUse.length} questions for simulation exam`)
  } else {
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

    if (questionsToUse.length === 0) {
      const { data: randomQuestions } = await supabase.from("questions").select("*").limit(10)

      if (randomQuestions) {
        questionsToUse = randomQuestions
      }
    }
  }

  if (questionsToUse.length === 0) {
    console.error("[v0] No questions loaded - database may be empty")
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">שגיאה בטעינת השאלות</h1>
          <p className="text-muted-foreground mb-4">לא נמצאו שאלות במערכת. אנא צור קשר עם התמיכה.</p>
          <Button asChild>
            <Link href="/">חזרה לדף הבית</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <ExamInterface questions={questionsToUse} examConfig={examConfig} userId={user?.id || null} />
}
