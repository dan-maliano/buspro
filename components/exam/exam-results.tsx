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

      const { data: sessionData } = await supabase.from("exam_sessions").select("*").eq("id", sessionId).single()

      const { data: answersData } = await supabase
        .from("user_answers")
        .select(`
          *,
          question:questions(*)
        `)
        .eq("session_id", sessionId)

      if (sessionData) setSession(sessionData)
      if (answersData) setAnswers(answersData as any)
      setLoading(false)
    }

    fetchResults()
  }, [sessionId])

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-lg">טוען תוצאות...</p>
      </div>
    )
  }

  const score = session.score || 0
  const totalQuestions = session.total_questions
  const percentage = Math.round((score / totalQuestions) * 100)
  const passed = session.passed
  const totalTime = answers.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0)

  const getAnswerText = (question: Question, letter: string): string => {
    const hebrewLetter = convertToHebrew(letter)
    const optionMap: Record<string, string> = {
      א: question.option_a || "",
      ב: question.option_b || "",
      ג: question.option_c || "",
      ד: question.option_d || "",
    }
    return optionMap[hebrewLetter] || ""
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">תוצאות המבחן</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Summary Card */}
          <Card
            className={`mb-8 ${passed === true ? "border-green-500 border-2" : passed === false ? "border-red-500 border-2" : ""}`}
          >
            <CardHeader>
              <div className="text-center">
                {passed === true && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h2 className="text-3xl font-bold text-green-600">עברת בהצלחה!</h2>
                  </div>
                )}
                {passed === false && (
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <XCircle className="h-16 w-16 text-red-500" />
                    <h2 className="text-3xl font-bold text-red-600">לא עברת הפעם</h2>
                    <p className="text-muted-foreground">המשך להתאמן ותצליח בפעם הבאה!</p>
                  </div>
                )}
                {passed === null && (
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold text-[#124734]">תרגול הושלם</h2>
                  </div>
                )}
              </div>
              <CardTitle className="text-center">
                <div className="text-6xl font-bold text-[#124734] mb-2">
                  {score}/{totalQuestions}
                </div>
                <div className="text-2xl text-muted-foreground">{percentage}% נכון</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-[#124734]" />
                  <p className="text-sm text-muted-foreground">זמן כולל</p>
                  <p className="text-lg font-semibold">
                    {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground">תשובות נכונות</p>
                  <p className="text-lg font-semibold text-green-600">{score}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-muted-foreground">תשובות שגויות</p>
                  <p className="text-lg font-semibold text-red-600">{totalQuestions - score}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>סקירת שאלות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {answers.map((answer, index) => {
                  const question = answer.question
                  const isCorrect = answer.is_correct

                  const userAnswerHebrew = convertToHebrew(answer.user_answer)
                  const correctAnswerHebrew = convertToHebrew(question.correct_answer)

                  const userAnswerText = getAnswerText(question, answer.user_answer || "")
                  const correctAnswerText = getAnswerText(question, question.correct_answer || "")

                  return (
                    <div
                      key={answer.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-2">
                            {index + 1}. {question.question_text}
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">התשובה שלך:</span>{" "}
                              <span
                                className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                              >
                                {userAnswerHebrew}
                              </span>
                              {userAnswerText && <span className="mr-2">- {userAnswerText}</span>}
                            </p>
                            {!isCorrect && (
                              <p>
                                <span className="text-muted-foreground">תשובה נכונה:</span>{" "}
                                <span className="text-green-600 font-semibold">{correctAnswerHebrew}</span>
                                {correctAnswerText && <span className="mr-2">- {correctAnswerText}</span>}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="mt-2 p-3 bg-white rounded border">
                                <span className="font-semibold">הסבר:</span> {question.explanation}
                              </p>
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
          <div className="flex flex-col gap-3 mt-6">
            <Button asChild className="w-full bg-[#124734] hover:bg-[#0d331f] h-14 text-lg font-semibold" size="lg">
              <Link href="/">
                <Home className="ml-2 h-6 w-6" />
                חזור לדף הבית
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-[#124734] text-[#124734] hover:bg-[#124734] hover:text-white h-14 text-lg font-semibold bg-transparent"
              size="lg"
            >
              <Link href="/history">
                <TrendingUp className="ml-2 h-6 w-6" />
                צפה בהיסטוריה
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
