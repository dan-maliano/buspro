"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, Clock, TrendingUp, Home } from "lucide-react"
import type { Question, UserAnswer, ExamSession } from "@/lib/types"

const convertToHebrew = (letter: string | undefined | null): string => {
  if (!letter) return ""

  const str = String(letter).trim().toUpperCase()

  if (str === "A" || str === "א") return "א"
  if (str === "B" || str === "ב") return "ב"
  if (str === "C" || str === "ג") return "ג"
  if (str === "D" || str === "ד") return "ד"

  return letter.toString()
}

export default function ExamResults({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<(UserAnswer & { question: Question })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const supabase = createClient()

      let retries = 0
      let sessionData = null

      while (retries < 3) {
        const { data, error } = await supabase.from("exam_sessions").select("*").eq("id", sessionId).single()

        if (error) {
          console.error("[v0] Error fetching session:", error)
          break
        }

        // If time_spent_seconds is 0 or null, wait and retry
        if (data && (data.time_spent_seconds === 0 || data.time_spent_seconds === null) && retries < 2) {
          console.log(`[v0] Time not ready, retry ${retries + 1}/3...`)
          await new Promise((resolve) => setTimeout(resolve, 500))
          retries++
          continue
        }

        sessionData = data
        break
      }

      const { data: answersData, error: answersError } = await supabase
        .from("user_answers")
        .select(`
          *,
          question:questions(*)
        `)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (answersError) {
        console.error("[v0] Error fetching answers:", answersError)
      }

      if (sessionData) {
        console.log("[v0] Final session data loaded:", {
          score: sessionData.score,
          time: sessionData.time_spent_seconds,
          passed: sessionData.passed,
        })
        setSession(sessionData)
      }

      if (answersData) {
        const validAnswers = answersData.filter((a: any) => a.question !== null)
        setAnswers(validAnswers as any)
      }

      setLoading(false)
    }

    fetchResults()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-lg">טוען תוצאות...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>שגיאה בטעינת תוצאות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">לא נמצאו תוצאות למבחן זה</p>
            <Button asChild className="w-full bg-[#124734]">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (answers.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>אין תוצאות זמינות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">לא נמצאו תשובות למבחן זה</p>
            <Button asChild className="w-full bg-[#124734]">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const correctAnswersCount = answers.filter((a) => a.is_correct).length
  const score = correctAnswersCount
  const totalQuestions = session.total_questions
  const percentage = Math.round((score / totalQuestions) * 100)
  const passed = session.passed
  const totalTime = session.time_spent_seconds || 0

  const getAnswerText = (question: Question, letter: string | null): string => {
    if (!letter) return ""

    const normalizedLetter = letter.trim()

    const optionMap: Record<string, string> = {
      א: question.option_a || "",
      ב: question.option_b || "",
      ג: question.option_c || "",
      ד: question.option_d || "",
    }

    return optionMap[normalizedLetter] || ""
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">תוצאות המבחן</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Summary Card */}
          <Card
            className={`mb-6 md:mb-8 ${passed === true ? "border-green-500 border-2" : passed === false ? "border-red-500 border-2" : ""}`}
          >
            <CardHeader>
              <div className="text-center">
                {passed === true && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-green-600">עברת בהצלחה!</h2>
                  </div>
                )}
                {passed === false && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <XCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-red-600">לא עברת הפעם</h2>
                    <p className="text-sm md:text-base text-muted-foreground">המשך להתאמן ותצליח בפעם הבאה!</p>
                  </div>
                )}
                {passed === null && (
                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#124734]">תרגול הושלם</h2>
                  </div>
                )}
              </div>
              <CardTitle className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-[#124734] mb-2">
                  {score}/{totalQuestions}
                </div>
                <div className="text-xl md:text-2xl text-muted-foreground">{percentage}% נכון</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                <div className="p-3 md:p-4 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-[#124734]" />
                  <p className="text-xs md:text-sm text-muted-foreground">זמן כולל</p>
                  <p className="text-base md:text-lg font-semibold">
                    {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs md:text-sm text-muted-foreground">תשובות נכונות</p>
                  <p className="text-base md:text-lg font-semibold text-green-600">{score}</p>
                </div>
                <div className="p-3 md:p-4 bg-muted rounded-lg">
                  <XCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-xs md:text-sm text-muted-foreground">תשובות שגויות</p>
                  <p className="text-base md:text-lg font-semibold text-red-600">{totalQuestions - score}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">סקירת שאלות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                {answers.map((answer, index) => {
                  const question = answer.question
                  const isCorrect = answer.is_correct

                  const userAnswerLetter = answer.user_answer || ""
                  const correctAnswerLetter = question.correct_answer || ""

                  const userAnswerText = getAnswerText(question, userAnswerLetter)
                  const correctAnswerText = getAnswerText(question, correctAnswerLetter)

                  return (
                    <div
                      key={answer.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold mb-3 text-sm md:text-base leading-relaxed">
                            {index + 1}. {question.question_text}
                          </p>
                          <div className="space-y-2 text-sm md:text-base">
                            {/* User's answer */}
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground text-xs md:text-sm">התשובה שלך:</span>
                              <div className={`${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                <span className="font-semibold">{userAnswerLetter}</span>
                                {userAnswerText && <span className="font-normal mr-1">- {userAnswerText}</span>}
                              </div>
                            </div>

                            {/* Correct answer (only if user was wrong) */}
                            {!isCorrect && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs md:text-sm">תשובה נכונה:</span>
                                <div className="text-green-600">
                                  <span className="font-semibold">{correctAnswerLetter}</span>
                                  {correctAnswerText && <span className="font-normal mr-1">- {correctAnswerText}</span>}
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <span className="font-semibold text-xs md:text-sm block mb-1">הסבר:</span>
                                <span className="text-xs md:text-sm leading-relaxed">{question.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-6 pb-6">
            <Button
              asChild
              className="w-full bg-[#124734] hover:bg-[#0d331f] min-h-[56px] h-auto py-4 text-base md:text-lg font-semibold touch-manipulation active:scale-95 transition-transform"
              size="lg"
            >
              <Link href="/" className="flex items-center justify-center">
                <Home className="ml-2 h-6 w-6 flex-shrink-0" />
                <span>חזור לדף הבית</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-[#124734] text-[#124734] hover:bg-[#124734] hover:text-white min-h-[56px] h-auto py-4 text-base md:text-lg font-semibold bg-transparent touch-manipulation active:scale-95 transition-transform"
              size="lg"
            >
              <Link href="/history" className="flex items-center justify-center">
                <TrendingUp className="ml-2 h-6 w-6 flex-shrink-0" />
                <span>צפה בהיסטוריה</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
