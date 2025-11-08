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

  const { error: answersError } = await supabase.from("user_answers").delete().eq("session_id", sessionId)

  if (answersError) {
    console.error("[v0] Error deleting answers:", answersError)
    return { success: false, error: "Failed to delete answers: " + answersError.message }
  }

  console.log("[v0] Deleted answers for session")

  const { error: sessionError } = await supabase
    .from("exam_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id)

  if (sessionError) {
    console.error("[v0] Error deleting session:", sessionError)
    return { success: false, error: "Failed to delete session: " + sessionError.message }
  }

  console.log("[v0] Delete successful, revalidating paths")

  revalidatePath("/history")
  revalidatePath("/profile")
  revalidatePath("/")

  return { success: true }
}
