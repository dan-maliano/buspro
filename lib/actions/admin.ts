"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

  const adminClient = createAdminClient()
  const { data: userToDelete, error: fetchError } = await adminClient.auth.admin.getUserById(userId)

  if (fetchError) {
    throw new Error(`Failed to fetch user: ${fetchError.message}`)
  }

  // Don't allow deleting the admin user
  if (userToDelete.user?.email === "dbm1000000@gmail.com") {
    throw new Error("Cannot delete admin user")
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).single()

  if (profile) {
    // Delete user answers first (foreign key constraint)
    const { data: sessions } = await supabase.from("exam_sessions").select("id").eq("user_id", userId)

    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id)
      await supabase.from("user_answers").delete().in("session_id", sessionIds)
    }

    // Delete exam sessions
    await supabase.from("exam_sessions").delete().eq("user_id", userId)

    // Delete user profile
    await supabase.from("profiles").delete().eq("id", userId)
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

  if (deleteError) {
    throw new Error(`Failed to delete user from auth: ${deleteError.message}`)
  }

  revalidatePath("/admin")
  return { success: true }
}
