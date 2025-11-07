"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteExamSession(sessionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "User not authenticated" }
  }

  // Verify session belongs to user
  const { data: session } = await supabase.from("exam_sessions").select("user_id, passed").eq("id", sessionId).single()

  if (!session) {
    return { success: false, error: "Session not found" }
  }

  if (session.user_id !== user.id) {
    return { success: false, error: "Unauthorized" }
  }

  // Delete user_answers first (due to foreign key constraint)
  const { error: answersError } = await supabase.from("user_answers").delete().eq("session_id", sessionId)

  if (answersError) {
    return { success: false, error: answersError.message }
  }

  // Delete the exam session
  const { error: sessionError } = await supabase.from("exam_sessions").delete().eq("id", sessionId)

  if (sessionError) {
    return { success: false, error: sessionError.message }
  }

  // Revalidate pages to update statistics
  revalidatePath("/history")
  revalidatePath("/profile")

  return { success: true }
}
