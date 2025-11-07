"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUser(formData: FormData) {
  const supabase = await createClient()

  // Verify admin user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== "dbm1000000@gmail.com") {
    throw new Error("Unauthorized")
  }

  const userId = formData.get("userId") as string

  if (!userId) {
    throw new Error("User ID is required")
  }

  // Don't allow deleting the admin user
  const { data: profileToDelete } = await supabase.from("profiles").select("email").eq("id", userId).single()

  if (profileToDelete?.email === "dbm1000000@gmail.com") {
    throw new Error("Cannot delete admin user")
  }

  // Delete user's exam sessions and answers (cascade should handle this via foreign keys)
  // But we'll do it explicitly to be safe
  const { error: answersError } = await supabase
    .from("user_answers")
    .delete()
    .in("session_id", supabase.from("exam_sessions").select("id").eq("user_id", userId))

  const { error: sessionsError } = await supabase.from("exam_sessions").delete().eq("user_id", userId)

  // Delete user profile
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

  if (profileError) {
    throw new Error(`Failed to delete user: ${profileError.message}`)
  }

  revalidatePath("/admin")
  return { success: true }
}
