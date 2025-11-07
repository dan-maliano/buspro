"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "אירעה שגיאה בהתחברות")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo/Brand */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#124734] mb-2">BusPro</h1>
              <p className="text-muted-foreground">מערכת תרגול לתורת הרכב</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">התחברות</CardTitle>
                <CardDescription>הזן את פרטי ההתחברות שלך כדי להמשיך</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full bg-[#124734] hover:bg-[#0d331f]" disabled={isLoading}>
                      {isLoading ? "מתחבר..." : "התחבר"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    עדיין אין לך חשבון?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="underline underline-offset-4 text-[#124734] hover:text-[#0d331f]"
                    >
                      הרשם עכשיו
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
