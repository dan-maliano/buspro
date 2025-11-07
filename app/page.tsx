import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Clock, TrendingUp, Calendar } from "lucide-react"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#124734] mb-4">ברוכים הבאים ל-BusPro</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              תתכוננו לתורת הרכב לנהג אוטובוס עם מערכת התרגול המתקדמת שלנו. תרגלו עם שאלות אמיתיות, עקבו אחר ההתקדמות
              שלכם והגיעו לבחינה מוכנים ובטוחים!
            </p>
          </div>

          {/* Exam Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-10 w-10 text-[#124734] mb-2" />
                <CardTitle>מבחן סימולציה</CardTitle>
                <CardDescription>30 שאלות, 45 דקות - כמו במבחן האמיתי</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-[#124734] hover:bg-[#0d331f]">
                  <Link href="/exam/simulation">{user ? "התחל מבחן" : "התחל מבחן (אורח)"}</Link>
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
                  <Link href={user ? "/history" : "/auth/login"}>{user ? "צפה בהיסטוריה" : "התחבר לצפייה"}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-[#124734] mb-6 text-center">בקרוב באתר</h3>
            <Card className="opacity-75 border-2 border-dashed">
              <CardHeader>
                <Calendar className="h-10 w-10 text-[#124734] mb-2 mx-auto" />
                <CardTitle className="text-center">מבחני תיאוריה לאוטובוס</CardTitle>
                <CardDescription className="text-center">
                  בקרוב יתווספו מבחני תיאוריה מלאים לאוטובוס עם עוד תכנים ושאלות מגוונות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full bg-muted text-muted-foreground cursor-not-allowed">
                  בקרוב...
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
                  <span>שאלות מעודכנות בעברית לפי תורת הרכב לנהג אוטובוס</span>
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

      <AppFooter />
    </div>
  )
}
