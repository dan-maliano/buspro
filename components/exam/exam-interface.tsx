"use client"

import { useState, useEffect, useRef } from "react"
import type { Question, ExamConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle2, AlertCircle, Home, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ExamResults from "./exam-results"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

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
  const questionStartTimeRef = useRef<number>(Date.now())
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
    // Save time spent on previous question before switching
    const now = Date.now()
    const previousIndex = currentQuestionIndex

    // Reset timer for new question
    questionStartTimeRef.current = now
  }, [currentQuestionIndex])

  const handleAnswerSelect = (answer: "א" | "ב" | "ג" | "ד") => {
    const now = Date.now()
    const timeSpent = Math.floor((now - questionStartTimeRef.current) / 1000)

    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      selectedAnswer: answer,
      timeSpent: newAnswers[currentQuestionIndex].timeSpent + timeSpent, // Add to existing time if revisiting
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

    console.log("[v0] 📝 === EXAM SUBMISSION START ===")
    console.log("[v0] User ID:", userId)
    console.log("[v0] Session ID:", sessionId)
    console.log("[v0] Total exam time:", totalExamTimeSeconds, "seconds")
    console.log("[v0] Exam start:", new Date(examStartTime).toISOString())
    console.log("[v0] Exam end:", new Date().toISOString())

    let correctCount = 0
    const answerRecords = questions.map((q, index) => {
      const userAnswer = userAnswers[index]
      const normalizedUserAnswer = userAnswer.selectedAnswer?.trim() || null
      const normalizedCorrectAnswer = q.correct_answer?.trim() || ""
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer

      if (isCorrect) correctCount++

      return {
        session_id: sessionId,
        question_id: q.id,
        user_answer: normalizedUserAnswer,
        is_correct: isCorrect,
        time_spent_seconds: userAnswer.timeSpent || 0,
      }
    })

    const errors = examConfig.totalQuestions - correctCount
    const passed = examConfig.type === "simulation" ? errors <= 8 : null

    console.log("[v0] 📊 Results - Correct:", correctCount, "Errors:", errors, "Passed:", passed)

    if (userId && sessionId) {
      const supabase = createClient()

      localStorage.setItem(`exam_time_${sessionId}`, totalExamTimeSeconds.toString())
      console.log("[v0] 💾 Saved time to localStorage:", totalExamTimeSeconds)

      console.log("[v0] 📤 Saving", answerRecords.length, "answers to database...")
      const { data: answersData, error: answersError } = await supabase
        .from("user_answers")
        .insert(answerRecords)
        .select()

      if (answersError) {
        console.error("[v0] ❌ Error saving answers:", answersError)
      } else {
        console.log("[v0] ✅ Answers saved successfully:", answersData?.length, "records")
      }

      console.log("[v0] 📤 Updating session with final results...")
      const { data: sessionData, error: sessionError } = await supabase
        .from("exam_sessions")
        .update({
          end_time: new Date().toISOString(),
          score: correctCount,
          passed: passed,
          time_spent_seconds: totalExamTimeSeconds,
        })
        .eq("id", sessionId)
        .select()

      if (sessionError) {
        console.error("[v0] ❌ Error updating session:", sessionError)
      } else {
        console.log("[v0] ✅ Session updated successfully:", sessionData)
      }

      console.log("[v0] ⏳ Waiting for database commit...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("[v0] ✅ === EXAM SUBMISSION COMPLETE ===")
    } else {
      console.log("[v0] 👤 Guest mode - results not saved to database")
    }

    setIsExamComplete(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAnswerText = (question: Question, letter: string): string => {
    const optionMap: Record<string, string> = {
      א: question.option_a || "",
      ב: question.option_b || "",
      ג: question.option_c || "",
      ד: question.option_d || "",
    }
    return optionMap[letter] || ""
  }

  if (isExamComplete && sessionId) {
    return <ExamResults sessionId={sessionId} />
  }

  if (isExamComplete && !sessionId) {
    let correctCount = 0
    const resultsData = questions.map((q, index) => {
      const userAnswer = userAnswers[index]
      const normalizedUserAnswer = userAnswer.selectedAnswer?.trim()
      const normalizedCorrectAnswer = q.correct_answer?.trim()
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
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
            <h1 className="text-2xl md:text-3xl font-bold text-center">תוצאות המבחן</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="mb-6 border-[#124734]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ביצעת את המבחן כאורח. התוצאות לא נשמרו. <strong>הירשם או התחבר</strong> כדי לשמור את ההתקדמות שלך ולעקוב
                אחר הסטטיסטיקות.
              </AlertDescription>
            </Alert>

            <Card className={`mb-6 md:mb-8 ${passed ? "border-green-500 border-2" : "border-red-500 border-2"}`}>
              <CardHeader>
                <div className="text-center">
                  {passed ? (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500" />
                      <h2 className="text-2xl md:text-3xl font-bold text-green-600">עברת בהצלחה!</h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500" />
                      <h2 className="text-2xl md:text-3xl font-bold text-red-600">לא עברת הפעם</h2>
                    </div>
                  )}
                </div>
                <CardTitle className="text-center">
                  <div className="text-5xl md:text-6xl font-bold text-[#124734] mb-2">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-xl md:text-2xl text-muted-foreground">{percentage}% נכון</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div className="p-3 md:p-4 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-xs md:text-sm text-muted-foreground">תשובות נכונות</p>
                    <p className="text-base md:text-lg font-semibold text-green-600">{correctCount}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-muted rounded-lg">
                    <AlertCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-red-600" />
                    <p className="text-xs md:text-sm text-muted-foreground">תשובות שגויות</p>
                    <p className="text-base md:text-lg font-semibold text-red-600">{questions.length - correctCount}</p>
                  </div>
                  <div className="p-3 md:p-4 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2 text-[#124734]" />
                    <p className="text-xs md:text-sm text-muted-foreground">זמן כולל</p>
                    <p className="text-base md:text-lg font-semibold">
                      {Math.floor((Date.now() - examStartTime) / 60000)}:
                      {(Math.floor((Date.now() - examStartTime) / 1000) % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 md:mb-8">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">סקירת שאלות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  {resultsData.map((result, index) => {
                    const userAnswerText = getAnswerText(result.question, result.userAnswer)
                    const correctAnswerText = getAnswerText(result.question, result.question.correct_answer || "א")

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          result.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="flex-shrink-0">
                            {result.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-3 text-sm md:text-base leading-relaxed">
                              {index + 1}. {result.question.question_text}
                            </p>
                            <div className="space-y-2 text-sm md:text-base">
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-xs md:text-sm">התשובה שלך:</span>
                                <div className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                                  <span className="font-semibold">{result.userAnswer}</span>
                                  {userAnswerText && <span className="font-normal mr-1">- {userAnswerText}</span>}
                                </div>
                              </div>

                              {!result.isCorrect && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-muted-foreground text-xs md:text-sm">תשובה נכונה:</span>
                                  <div className="text-green-600">
                                    <span className="font-semibold">{result.question.correct_answer}</span>
                                    {correctAnswerText && (
                                      <span className="font-normal mr-1">- {correctAnswerText}</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {result.question.explanation && (
                                <div className="mt-3 p-3 bg-white rounded border">
                                  <span className="font-semibold text-xs md:text-sm block mb-1">הסבר:</span>
                                  <span className="text-xs md:text-sm leading-relaxed">
                                    {result.question.explanation}
                                  </span>
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
                <Link href="/auth/sign-up" className="flex items-center justify-center">
                  <UserPlus className="ml-2 h-6 w-6 flex-shrink-0" />
                  <span>הירשם לשמירת התקדמות</span>
                </Link>
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
