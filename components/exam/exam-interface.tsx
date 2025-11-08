"use client"

import { useState, useEffect } from "react"
import type { Question, ExamConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ExamResults from "./exam-results"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserAnswerState = {
  questionId: string
  selectedAnswer: "א" | "ב" | "ג" | "ד" | null
  timeSpent: number
}

export default function ExamInterface({
  questions,
  examConfig,
  userId,
}: {
  questions: Question[]
  examConfig: ExamConfig
  userId: string | null
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswerState[]>(
    questions.map((q) => ({ questionId: q.id, selectedAnswer: null, timeSpent: 0 })),
  )
  const [timeRemaining, setTimeRemaining] = useState(examConfig.timeLimitSeconds || 0)
  const [examStartTime] = useState(Date.now())
  const [isExamComplete, setIsExamComplete] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const router = useRouter()

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers[currentQuestionIndex]

  useEffect(() => {
    async function initSession() {
      if (!userId) {
        console.log("[v0] Guest mode - no session created")
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("exam_sessions")
        .insert({
          user_id: userId,
          exam_type: examConfig.type,
          total_questions: examConfig.totalQuestions,
          time_limit_seconds: examConfig.timeLimitSeconds,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Failed to create exam session:", error)
      } else {
        console.log("[v0] Session created:", data.id)
        setSessionId(data.id)
      }
    }
    initSession()
  }, [userId, examConfig])

  useEffect(() => {
    if (!examConfig.timeLimitSeconds || isExamComplete) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [examConfig.timeLimitSeconds, isExamComplete])

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswerSelect = (answer: "א" | "ב" | "ג" | "ד") => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      selectedAnswer: answer,
      timeSpent: newAnswers[currentQuestionIndex].timeSpent + timeSpent,
    }
    setUserAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 300)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitExam = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const totalExamTimeSeconds = Math.floor((Date.now() - examStartTime) / 1000)

    console.log("[v0] === EXAM SUBMISSION DEBUG ===")
    console.log("[v0] userId:", userId, "sessionId:", sessionId)
    console.log("[v0] Total questions:", questions.length)
    console.log("[v0] Total exam time:", totalExamTimeSeconds, "seconds")

    if (userId && sessionId) {
      const supabase = createClient()

      let correctCount = 0
      const answerRecords = questions.map((q, index) => {
        const userAnswer = userAnswers[index]

        const isCorrect = userAnswer.selectedAnswer === q.correct_answer

        if (isCorrect) correctCount++

        console.log(`[v0] Q${index + 1}:`, {
          questionId: q.id,
          questionText: q.question_text?.substring(0, 50),
          userAnswer: userAnswer.selectedAnswer,
          correctAnswer: q.correct_answer,
          isCorrect,
        })

        return {
          session_id: sessionId,
          question_id: q.id,
          user_answer: userAnswer.selectedAnswer || null,
          is_correct: isCorrect,
          time_spent_seconds: userAnswer.timeSpent || Math.floor(totalExamTimeSeconds / questions.length),
        }
      })

      const errors = examConfig.totalQuestions - correctCount
      const passed = errors <= 8

      console.log("[v0] Final results:", {
        correctCount,
        errors,
        passed,
        totalQuestions: examConfig.totalQuestions,
        totalTime: totalExamTimeSeconds,
      })

      const { error: answersError } = await supabase.from("user_answers").insert(answerRecords)

      if (answersError) {
        console.error("[v0] Failed to save answers:", answersError)
      } else {
        console.log("[v0] Answers saved successfully")
      }

      const { error: sessionError } = await supabase
        .from("exam_sessions")
        .update({
          end_time: new Date().toISOString(),
          score: correctCount,
          passed: examConfig.type === "simulation" ? passed : null,
          time_spent_seconds: totalExamTimeSeconds,
        })
        .eq("id", sessionId)

      if (sessionError) {
        console.error("[v0] Failed to update session:", sessionError)
      } else {
        console.log("[v0] Session updated successfully")
      }
    } else {
      console.log("[v0] Guest exam completed - results not saved")
    }

    setIsExamComplete(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isExamComplete && sessionId) {
    return <ExamResults sessionId={sessionId} />
  }

  if (isExamComplete && !sessionId) {
    let correctCount = 0
    const resultsData = questions.map((q, index) => {
      const userAnswer = userAnswers[index]
      const isCorrect = userAnswer.selectedAnswer === q.correct_answer
      if (isCorrect) correctCount++
      return {
        question: q,
        userAnswer: userAnswer.selectedAnswer || "א",
        isCorrect,
      }
    })

    const percentage = Math.round((correctCount / questions.length) * 100)
    const passed = correctCount >= examConfig.passingScore

    return (
      <div className="min-h-screen bg-surface">
        <header className="bg-[#124734] text-white shadow-md">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-center">תוצאות המבחן</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="mb-6 border-[#124734]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ביצעת את המבחן כאורח. התוצאות לא נשמרו. <strong>הירשם או התחבר</strong> כדי לשמור את ההתקדמות שלך ולעקוב
                אחר הסטטיסטיקות.
              </AlertDescription>
            </Alert>

            <Card className={`mb-8 ${passed ? "border-green-500 border-2" : "border-red-500 border-2"}`}>
              <CardHeader>
                <div className="text-center">
                  {passed ? (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                      <h2 className="text-3xl font-bold text-green-600">עברת בהצלחה!</h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <AlertCircle className="h-16 w-16 text-red-500" />
                      <h2 className="text-3xl font-bold text-red-600">לא עברת הפעם</h2>
                    </div>
                  )}
                </div>
                <CardTitle className="text-center">
                  <div className="text-6xl font-bold text-[#124734] mb-2">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-2xl text-muted-foreground">{percentage}% נכון</div>
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>סקירת שאלות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {resultsData.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        result.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {result.isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-2">
                            {index + 1}. {result.question.question_text}
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">התשובה שלך:</span>{" "}
                              <span
                                className={
                                  result.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                                }
                              >
                                {result.userAnswer}
                              </span>
                            </p>
                            {!result.isCorrect && (
                              <p>
                                <span className="text-muted-foreground">תשובה נכונה:</span>{" "}
                                <span className="text-green-600 font-semibold">{result.question.correct_answer}</span>
                              </p>
                            )}
                            {result.question.explanation && (
                              <p className="mt-2 p-3 bg-white rounded border">
                                <span className="font-semibold">הסבר:</span> {result.question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 bg-[#124734] hover:bg-[#0d331f]" size="lg">
                <a href="/">חזור לדף הבית</a>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent" size="lg">
                <a href="/auth/sign-up">הירשם לשמירת התקדמות</a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const answeredCount = userAnswers.filter((a) => a.selectedAnswer !== null).length
  const progressPercent = (answeredCount / questions.length) * 100

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-[#124734] text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {examConfig.type === "simulation" && "מבחן סימולציה"}
                {examConfig.type === "errors" && "תרגול טעויות"}
              </h1>
              <p className="text-sm opacity-90">
                שאלה {currentQuestionIndex + 1} מתוך {examConfig.totalQuestions}
              </p>
            </div>
            {examConfig.timeLimitSeconds && (
              <div className="flex items-center gap-2 text-xl font-mono bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining < 300 ? "text-red-300" : ""}>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <Progress value={progressPercent} className="mt-2 h-2" />
        </div>
      </header>

      {!userId && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-2">
            <p className="text-sm text-center">
              <strong>מבחן כאורח:</strong> התוצאות לא יישמרו.{" "}
              <a href="/auth/login" className="underline font-semibold text-[#124734]">
                התחבר
              </a>{" "}
              או{" "}
              <a href="/auth/sign-up" className="underline font-semibold text-[#124734]">
                הירשם
              </a>{" "}
              כדי לשמור את ההתקדמות שלך.
            </p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold bg-[#124734] text-white px-3 py-1 rounded-full whitespace-nowrap md:hidden">
                    שאלה מספר {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                    {currentQuestion.category}
                  </span>
                </div>

                <CardTitle className="text-xl leading-relaxed">{currentQuestion.question_text}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {currentQuestion.question_image_url && (
                <img
                  src={currentQuestion.question_image_url || "/placeholder.svg"}
                  alt="שאלה"
                  className="w-full max-w-md mx-auto mb-6 rounded-lg"
                />
              )}

              <div className="space-y-3">
                {[
                  { letter: "א" as const, text: currentQuestion.option_a },
                  { letter: "ב" as const, text: currentQuestion.option_b },
                  { letter: "ג" as const, text: currentQuestion.option_c },
                  { letter: "ד" as const, text: currentQuestion.option_d },
                ].map((option) => {
                  const isSelected = currentAnswer.selectedAnswer === option.letter

                  return (
                    <button
                      key={option.letter}
                      onClick={() => handleAnswerSelect(option.letter)}
                      className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                        isSelected ? "border-[#124734] bg-[#124734]/10" : "border-border hover:border-[#124734]/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isSelected ? "bg-[#124734] text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          {option.letter}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">ניווט מהיר</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 gap-2">
                {questions.map((_, index) => {
                  const answered = userAnswers[index].selectedAnswer !== null
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                        isCurrent
                          ? "bg-[#124734] text-white ring-2 ring-[#124734] ring-offset-2"
                          : answered
                            ? "bg-[#124734]/20 text-[#124734]"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="lg"
              className="w-32 bg-transparent"
            >
              הקודם
            </Button>

            <div className="flex-1 text-center">
              {answeredCount < questions.length ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>נותרו {questions.length - answeredCount} שאלות ללא תשובה</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>כל השאלות נענו!</span>
                </div>
              )}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                size="lg"
                className="w-32 bg-[#124734] hover:bg-[#0d331f]"
              >
                {isSubmitting ? "שולח..." : "סיים מבחן"}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg" className="w-32 bg-[#124734] hover:bg-[#0d331f]">
                הבא
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
