"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteExamSession(sessionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] Delete failed: User not authenticated")
    return { success: false, error: "User not authenticated" }
  }

  console.log("[v0] Deleting session:", sessionId, "for user:", user.id)

  // Verify session belongs to user
  const { data: session, error: sessionCheckError } = await supabase
    .from("exam_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single()

  if (sessionCheckError) {
    console.error("[v0] Error checking session:", sessionCheckError)
    return { success: false, error: "Session not found" }
  }

  if (!session) {
    console.error("[v0] Session not found")
    return { success: false, error: "Session not found" }
  }

  if (session.user_id !== user.id) {
    console.error("[v0] Unauthorized: session belongs to different user")
    return { success: false, error: "Unauthorized" }
  }

  const { error: answersError, count: answersCount } = await supabase
    .from("user_answers")
    .delete()
    .eq("session_id", sessionId)
    .select()

  if (answersError) {
    console.error("[v0] Error deleting answers:", answersError)
    return { success: false, error: "Failed to delete answers: " + answersError.message }
  }

  console.log("[v0] Deleted", answersCount, "answers")

  const { error: sessionError, count: sessionCount } = await supabase
    .from("exam_sessions")
    .delete()
    .eq("id", sessionId)
    .select()

  if (sessionError) {
    console.error("[v0] Error deleting session:", sessionError)
    return { success: false, error: "Failed to delete session: " + sessionError.message }
  }

  console.log("[v0] Deleted", sessionCount, "session(s)")

  revalidatePath("/history")
  revalidatePath("/profile")
  revalidatePath("/")

  console.log("[v0] Delete successful")
  return { success: true }
}
