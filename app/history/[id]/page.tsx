import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ExamResults from "@/components/exam/exam-results"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Verify session belongs to user
  const { data: session } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!session) {
    redirect("/history")
  }

  return <ExamResults sessionId={id} />
}
