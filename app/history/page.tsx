import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, TrendingUp, Calendar, ArrowRight, BarChart3 } from "lucide-react"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all exam sessions
  const { data: sessions } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate statistics
  const totalExams = sessions?.length || 0
  const simulationExams = sessions?.filter((s) => s.exam_type === "simulation") || []
  const passedExams = simulationExams.filter((s) => s.passed === true).length
  const failedExams = simulationExams.filter((s) => s.passed === false).length

  const allScores = sessions?.filter((s) => s.score !== null).map((s) => s.score!) || []
  const averageScore =
    allScores.length > 0 ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length) : 0

  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0

  // Get category performance
  const { data: userAnswers } = await supabase
    .from("user_answers")
    .select(`
      is_correct,
      question:questions(category)
    `)
    .in("session_id", sessions?.map((s) => s.id) || [])

  const categoryStats: Record<string, { correct: number; total: number }> = {}
  userAnswers?.forEach((answer: any) => {
    const category = answer.question?.category || "אחר"
    if (!categoryStats[category]) {
      categoryStats[category] = { correct: 0, total: 0 }
    }
    categoryStats[category].total++
    if (answer.is_correct) {
      categoryStats[category].correct++
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getExamTypeLabel = (type: string) => {
    switch (type) {
      case "simulation":
        return "מבחן סימולציה"
      case "practice":
        return "תרגול חופשי"
      case "errors":
        return "תרגול טעויות"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">היסטוריה וסטטיסטיקות</h1>
              <p className="text-sm opacity-90">עקוב אחר ההתקדמות שלך</p>
            </div>
            <Button asChild variant="ghost" className="text-white hover:bg-[#1a5d47]">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Statistics Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>סה"כ מבחנים</CardDescription>
                <CardTitle className="text-4xl text-[#124734]">{totalExams}</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart3 className="h-8 w-8 text-[#124734] opacity-20" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>ציון ממוצע</CardDescription>
                <CardTitle className="text-4xl text-[#124734]">{averageScore}%</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-8 w-8 text-[#124734] opacity-20" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>מבחנים עברו</CardDescription>
                <CardTitle className="text-4xl text-green-600">{passedExams}</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>הציון הגבוה ביותר</CardDescription>
                <CardTitle className="text-4xl text-[#124734]">{bestScore}</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendingUp className="h-8 w-8 text-[#124734] opacity-20" />
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ביצועים לפי קטגוריה</CardTitle>
              <CardDescription>אחוזי הצלחה בכל נושא</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(categoryStats).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, stats]) => {
                    const percentage = Math.round((stats.correct / stats.total) * 100)
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.correct}/{stats.total} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[#124734] transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  אין נתונים עדיין. התחל להתאמן כדי לראות סטטיסטיקות!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Exams */}
          <Card>
            <CardHeader>
              <CardTitle>מבחנים אחרונים</CardTitle>
              <CardDescription>היסטוריית המבחנים שלך</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const score = session.score || 0
                    const total = session.total_questions
                    const percentage = Math.round((score / total) * 100)
                    const isPassed = session.passed

                    return (
                      <Link key={session.id} href={`/history/${session.id}`} className="block">
                        <div className="p-4 rounded-lg border-2 border-border hover:border-[#124734] transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-lg">{getExamTypeLabel(session.exam_type)}</span>
                                {isPassed === true && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    עבר
                                  </span>
                                )}
                                {isPassed === false && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                    נכשל
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(session.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  {isPassed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  {score}/{total} ({percentage}%)
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-lg font-semibold mb-2">עדיין לא ביצעת מבחנים</p>
                  <p className="text-muted-foreground mb-6">התחל להתאמן כדי לראות את ההתקדמות שלך כאן</p>
                  <Button asChild className="bg-[#124734] hover:bg-[#0d331f]">
                    <Link href="/">התחל מבחן</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
