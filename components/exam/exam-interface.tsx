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

type UserAnswerState = {
  questionId: string
  selectedAnswer: "A" | "B" | "C" | "D" | null
  timeSpent: number
}

export default function ExamInterface({
  questions,
  examConfig,
  userId,
}: {
  questions: Question[]
  examConfig: ExamConfig
  userId: string
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswerState[]>(
    questions.map((q) => ({ questionId: q.id, selectedAnswer: null, timeSpent: 0 })),
  )
  const [timeRemaining, setTimeRemaining] = useState(examConfig.timeLimitSeconds || 0)
  const [isExamComplete, setIsExamComplete] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const router = useRouter()

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers[currentQuestionIndex]

  // Initialize exam session
  useEffect(() => {
    async function initSession() {
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
        setSessionId(data.id)
      }
    }
    initSession()
  }, [userId, examConfig])

  // Timer countdown
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

  // Track time spent per question
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      selectedAnswer: answer,
      timeSpent: newAnswers[currentQuestionIndex].timeSpent + timeSpent,
    }
    setUserAnswers(newAnswers)
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
    if (isSubmitting || !sessionId) return
    setIsSubmitting(true)

    const supabase = createClient()

    // Calculate score
    let correctCount = 0
    const answerRecords = questions.map((q, index) => {
      const userAnswer = userAnswers[index]
      const isCorrect = userAnswer.selectedAnswer === q.correct_answer
      if (isCorrect) correctCount++

      return {
        session_id: sessionId,
        question_id: q.id,
        user_answer: userAnswer.selectedAnswer || "A",
        is_correct: isCorrect,
        time_spent_seconds: userAnswer.timeSpent,
      }
    })

    const passed = correctCount >= examConfig.passingScore

    // Insert all answers
    await supabase.from("user_answers").insert(answerRecords)

    // Update session
    await supabase
      .from("exam_sessions")
      .update({
        end_time: new Date().toISOString(),
        score: correctCount,
        passed: examConfig.type === "simulation" ? passed : null,
      })
      .eq("id", sessionId)

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

  const answeredCount = userAnswers.filter((a) => a.selectedAnswer !== null).length
  const progressPercent = (answeredCount / questions.length) * 100

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#124734] text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {examConfig.type === "simulation" && "מבחן סימולציה"}
                {examConfig.type === "practice" && "תרגול חופשי"}
                {examConfig.type === "errors" && "תרגול טעויות"}
              </h1>
              <p className="text-sm opacity-90">
                שאלה {currentQuestionIndex + 1} מתוך {questions.length}
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

      {/* Question Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl leading-relaxed">{currentQuestion.question_text}</CardTitle>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                  {currentQuestion.category}
                </span>
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

              {/* Answer Options */}
              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map((option) => {
                  const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string
                  const isSelected = currentAnswer.selectedAnswer === option

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
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
                          {option}
                        </div>
                        <span className="text-lg">{optionText}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Question Navigator */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">ניווט מהיר</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((_, index) => {
                  const answered = userAnswers[index].selectedAnswer !== null
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg flex items-center justify-center font-semibold transition-all ${
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

          {/* Navigation Buttons */}
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
