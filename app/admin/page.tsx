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
  const { data: allUsers, error: usersError } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  console.log("[v0] Admin query - User email:", user.email)
  console.log("[v0] Admin query - Results:", {
    success: !usersError,
    count: allUsers?.length || 0,
    error: usersError,
  })

  const users = allUsers || []
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
                    <div className="bg-white border p-3 rounded text-sm mt-3">
                      <p className="font-semibold mb-2">אנא צור קשר עם התמיכה הטכנית</p>
                    </div>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="space-y-4 p-6 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-lg font-semibold">לא נמצאו משתמשים</p>
                  <p className="text-sm text-muted-foreground">זה יכול לקרות אם המשתמשים נוצרו לפני שהטריגר הוגדר</p>
                  <div className="bg-white border p-4 rounded text-right text-sm mt-4">
                    <p className="font-semibold mb-2">פתרון:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>פתח את Supabase Dashboard</li>
                      <li>עבור ל-SQL Editor</li>
                      <li>
                        הרץ את הסקריפט:{" "}
                        <code className="bg-gray-100 px-2 py-0.5 rounded">scripts/003_create_profiles_trigger.sql</code>
                      </li>
                      <li>
                        לאחר מכן הרץ:{" "}
                        <code className="bg-gray-100 px-2 py-0.5 rounded">scripts/008_backfill_profiles.sql</code>
                      </li>
                      <li>רענן את הדף</li>
                    </ol>
                  </div>
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
                          <td className="p-2">{userItem.full_name || "לא צוין"}</td>
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
