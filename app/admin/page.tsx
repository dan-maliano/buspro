import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

  if (!user || user.email !== "dbm1000000@gmail.com") {
    redirect("/")
  }

  const adminClient = createAdminClient()
  const { data: authData, error: usersError } = await adminClient.auth.admin.listUsers()

  console.log("[v0] Admin query - Fetching from auth.users")
  console.log("[v0] Admin query - Results:", {
    success: !usersError,
    count: authData?.users?.length || 0,
    error: usersError,
  })

  const users = authData?.users || []
  const totalUsers = users.length

  // Get recent sessions (last 30 minutes) to estimate active users
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: recentSessions } = await supabase
    .from("exam_sessions")
    .select("user_id")
    .gte("created_at", thirtyMinutesAgo)

  // Count unique users
  const activeUsers = new Set(recentSessions?.map((s) => s.user_id) || []).size

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
                <div className="text-2xl font-bold">{totalUsers}</div>
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
                  {totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0}%
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
              {usersError ? (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 font-semibold">שגיאה בטעינת המשתמשים</p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>הודעה:</strong> {usersError.message}
                    </p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="space-y-4 p-6 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-lg font-semibold">לא נמצאו משתמשים</p>
                  <p className="text-sm text-muted-foreground">אין משתמשים רשומים במערכת</p>
                </div>
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
                      {users.map((userItem) => (
                        <tr key={userItem.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{userItem.user_metadata?.full_name || "לא צוין"}</td>
                          <td className="p-2 font-mono text-sm">{userItem.email}</td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(userItem.created_at).toLocaleDateString("he-IL")}
                          </td>
                          <td className="p-2">
                            {userItem.email === "dbm1000000@gmail.com" ? (
                              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                                אדמין
                              </span>
                            ) : (
                              <form action={deleteUser}>
                                <input type="hidden" name="userId" value={userItem.id} />
                                <Button type="submit" variant="destructive" size="sm" className="gap-2">
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
