import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Clock, BookOpen, TrendingUp, LogOut, User } from "lucide-react"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function signOut() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">BusPro</h1>
            <p className="text-sm opacity-90">מערכת תרגול מבחני תיאוריה לנהג אוטובוס</p>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" className="text-white hover:bg-[#1a5d47]">
                  <User className="ml-2 h-4 w-4" />
                  פרופיל
                </Button>
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" className="text-white hover:bg-[#1a5d47]">
                  <LogOut className="ml-2 h-4 w-4" />
                  התנתק
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost" className="text-white hover:bg-[#1a5d47]">
                <Link href="/auth/login">התחבר</Link>
              </Button>
              <Button asChild className="bg-white text-[#124734] hover:bg-gray-100">
                <Link href="/auth/sign-up">הרשם</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#124734] mb-4">ברוכים הבאים ל-BusPro</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              תתכוננו למבחן התיאוריה לנהג אוטובוס עם מערכת התרגול המתקדמת שלנו. תרגלו עם שאלות אמיתיות, עקבו אחר
              ההתקדמות שלכם והגיעו לבחינה מוכנים ובטוחים!
            </p>
          </div>

          {/* Exam Mode Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-[#124734] mb-2" />
                <CardTitle>מבחן סימולציה</CardTitle>
                <CardDescription>30 שאלות, 40 דקות - כמו במבחן האמיתי</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#124734] hover:bg-[#0d331f]">
                  <Link href={user ? "/exam/simulation" : "/auth/login"}>התחל מבחן</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-[#124734] mb-2" />
                <CardTitle>תרגול חופשי</CardTitle>
                <CardDescription>15 שאלות ללא הגבלת זמן - תרגלו בקצב שלכם</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#124734] hover:bg-[#0d331f]">
                  <Link href={user ? "/exam/practice" : "/auth/login"}>התחל תרגול</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-[#124734] mb-2" />
                <CardTitle>היסטוריה וסטטיסטיקות</CardTitle>
                <CardDescription>עקבו אחר ההתקדמות והישגים שלכם</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#124734] text-[#124734] hover:bg-[#124734] hover:text-white bg-transparent"
                >
                  <Link href={user ? "/history" : "/auth/login"}>צפה בהיסטוריה</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="bg-[#124734] text-white">
            <CardHeader>
              <CardTitle className="text-2xl">למה BusPro?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>שאלות מעודכנות בעברית לפי מבחן התיאוריה האמיתי</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>מבחני סימולציה עם תנאי זמן אמיתיים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>מעקב אחר התקדמות והישגים אישיים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>הסברים מפורטים לכל שאלה</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#124734] text-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="mb-2">© 2025 BusPro - כל הזכויות שמורות</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/terms" className="hover:underline">
              תנאי שימוש
            </Link>
            <Link href="/privacy" className="hover:underline">
              מדיניות פרטיות
            </Link>
            <Link href="/about" className="hover:underline">
              אודות
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
