"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteExamSession(sessionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] ❌ Delete failed: User not authenticated")
    return { success: false, error: "User not authenticated" }
  }

  console.log("[v0] 🗑️ Starting delete for session:", sessionId, "user:", user.id)

  const { data: existingSession, error: checkError } = await supabase
    .from("exam_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .single()

  if (checkError) {
    console.error("[v0] ❌ Session not found:", checkError)
    return { success: false, error: "Session not found: " + checkError.message }
  }

  if (existingSession.user_id !== user.id) {
    console.error("[v0] ❌ Permission denied: session belongs to different user")
    return { success: false, error: "Permission denied" }
  }

  console.log("[v0] ✓ Session exists and belongs to user")

  // Delete answers first
  const { error: answersError, count: deletedAnswers } = await supabase
    .from("user_answers")
    .delete({ count: "exact" })
    .eq("session_id", sessionId)

  if (answersError) {
    console.error("[v0] ❌ Error deleting answers:", answersError)
    return { success: false, error: "Failed to delete answers: " + answersError.message }
  }

  console.log("[v0] ✓ Deleted", deletedAnswers, "answers")

  // Delete session
  const { error: sessionError, count: deletedSessions } = await supabase
    .from("exam_sessions")
    .delete({ count: "exact" })
    .eq("id", sessionId)
    .eq("user_id", user.id)

  if (sessionError) {
    console.error("[v0] ❌ Error deleting session:", sessionError)
    return { success: false, error: "Failed to delete session: " + sessionError.message }
  }

  console.log("[v0] ✅ Delete successful! Deleted", deletedSessions, "session(s)")

  revalidatePath("/history")
  revalidatePath("/profile")
  revalidatePath("/")

  return { success: true }
}
