import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Mail, Calendar, ArrowRight } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's exam statistics
  const { data: sessions } = await supabase.from("exam_sessions").select("*").eq("user_id", user.id)

  const totalExams = sessions?.length || 0
  const simulationExams = sessions?.filter((s) => s.exam_type === "simulation") || []
  const passedExams = simulationExams.filter((s) => s.passed === true).length

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
              <CardDescription>המידע שלך במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <User className="h-10 w-10 text-[#124734]" />
                  <div>
                    <p className="text-sm text-muted-foreground">שם מלא</p>
                    <p className="font-semibold">{user.user_metadata?.full_name || "לא הוגדר"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Mail className="h-10 w-10 text-[#124734]" />
                  <div>
                    <p className="text-sm text-muted-foreground">אימייל</p>
                    <p className="font-semibold" dir="ltr">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Calendar className="h-10 w-10 text-[#124734]" />
                  <div>
                    <p className="text-sm text-muted-foreground">תאריך הצטרפות</p>
                    <p className="font-semibold">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>סיכום ביצועים</CardTitle>
              <CardDescription>סטטיסטיקות כלליות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-[#124734] mb-1">{totalExams}</p>
                  <p className="text-sm text-muted-foreground">סה"כ מבחנים</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-green-600 mb-1">{passedExams}</p>
                  <p className="text-sm text-muted-foreground">מבחנים עברו</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-[#124734] mb-1">
                    {simulationExams.length > 0 ? Math.round((passedExams / simulationExams.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">אחוז הצלחה</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-between bg-transparent" size="lg">
                  <Link href="/history">
                    צפה בהיסטוריה מלאה
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <form action={signOut}>
                  <Button type="submit" variant="destructive" className="w-full" size="lg">
                    התנתק מהחשבון
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
