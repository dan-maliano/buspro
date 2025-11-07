"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Users, UserCheck } from "lucide-react"
import { deleteUser } from "@/lib/actions/admin"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || user.email !== "dbm1000000@gmail.com") {
    redirect("/")
  }

  // Get all users from profiles table
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  // Get exam sessions count for online/active users estimation
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get recent sessions (last 30 minutes) to estimate active users
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { count: activeUsers } = await supabase
    .from("exam_sessions")
    .select("user_id", { count: "exact", head: true })
    .gte("created_at", thirtyMinutesAgo)

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-right">פאנל ניהול</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סך המשתמשים</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">משתמשים פעילים (30 דק׳)</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">שיעור פעילות</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalUsers ? Math.round(((activeUsers || 0) / totalUsers) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>משתמשים רשומים</CardTitle>
              <CardDescription>רשימת כל המשתמשים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-red-500">שגיאה בטעינת המשתמשים: {error.message}</p>
              ) : !profiles || profiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">אין משתמשים במערכת</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-right">
                        <th className="p-2">שם מלא</th>
                        <th className="p-2">אימייל</th>
                        <th className="p-2">תאריך הצטרפות</th>
                        <th className="p-2">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr key={profile.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{profile.full_name || "לא צוין"}</td>
                          <td className="p-2 font-mono text-sm">{profile.email}</td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString("he-IL")}
                          </td>
                          <td className="p-2">
                            {profile.email !== "dbm1000000@gmail.com" && (
                              <form action={deleteUser}>
                                <input type="hidden" name="userId" value={profile.id} />
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                  onClick={(e) => {
                                    if (!confirm(`האם למחוק את המשתמש ${profile.full_name || profile.email}?`)) {
                                      e.preventDefault()
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  מחק
                                </Button>
                              </form>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
