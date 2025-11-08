import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, TrendingUp, Calendar, ArrowRight, BarChart3, AlertTriangle } from "lucide-react"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"
import { DeleteExamButton } from "@/components/delete-exam-button"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: sessions } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("end_time", "is", null)
    .order("created_at", { ascending: false })

  // Calculate statistics only from completed exams
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

  const { data: wrongAnswers } = await supabase
    .from("user_answers")
    .select("question_id")
    .eq("is_correct", false)
    .in("session_id", sessions?.map((s) => s.id) || [])

  const uniqueWrongQuestions = new Set(wrongAnswers?.map((a) => a.question_id) || []).size

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
      case "errors":
        return "תרגול טעויות"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader user={user} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#124734] mb-8">היסטוריה וסטטיסטיקות</h1>

          {uniqueWrongQuestions > 0 && (
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-900">תרגול שאלות שגויות</CardTitle>
                    <CardDescription className="text-orange-700">
                      יש לך {uniqueWrongQuestions} שאלות שטעית בהן - תרגל אותן שוב!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/exam/errors">התחל תרגול טעויות</Link>
                </Button>
              </CardContent>
            </Card>
          )}

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
                      <div
                        key={session.id}
                        className="p-4 rounded-lg border-2 border-border hover:border-[#124734] transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <Link href={`/history/${session.id}`} className="flex-1 min-w-0">
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
                          </Link>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isPassed === false && <DeleteExamButton sessionId={session.id} />}
                            <Link href={`/history/${session.id}`}>
                              <Button variant="ghost" size="icon">
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
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

      <AppFooter />
    </div>
  )
}
