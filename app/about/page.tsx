import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bus, Target, Mail } from "lucide-react"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"
import { createClient } from "@/lib/supabase/server"

export default async function AboutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader user={user} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Mission */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Bus className="h-8 w-8 text-[#124734]" />
                <CardTitle className="text-2xl">המשימה שלנו</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground-secondary leading-relaxed">
                BusPro היא מערכת הכנה מתקדמת לתורת הרכב לנהגי אוטובוס. המטרה שלנו היא לעזור לך להתכונן בצורה הטובה ביותר
                למבחן תורת הרכב ולעבור אותו בהצלחה. אנו מספקים תרגול מקיף, מעקב אחר התקדמות, וכלים שיעזרו לך ללמוד בצורה
                יעילה ומותאמת אישית.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-[#124734]" />
                <CardTitle className="text-2xl">מה אנחנו מציעים</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">מבחני סימולציה</h3>
                  <p className="text-sm text-foreground-secondary">
                    תרגול במבחני סימולציה מלאים עם תנאי זמן אמיתיים - 30 שאלות ב-40 דקות
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">מעקב התקדמות</h3>
                  <p className="text-sm text-foreground-secondary">סטטיסטיקות מפורטות ומעקב אחר ביצועים לפי קטגוריות</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">הסברים מפורטים</h3>
                  <p className="text-sm text-foreground-secondary">הסבר מפורט לכל שאלה כדי להבין את החומר לעומק</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">שאלות מעודכנות</h3>
                  <p className="text-sm text-foreground-secondary">שאלות בעברית המתאימות לתורת הרכב לנהג אוטובוס</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-8 w-8 text-[#124734]" />
                <CardTitle className="text-2xl">יצירת קשר</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-secondary leading-relaxed mb-4">
                יש לך שאלות, הצעות או משוב? נשמח לשמוע ממך!
              </p>
              <div className="p-4 bg-[#124734]/5 rounded-lg border-2 border-[#124734]/20">
                <p className="text-sm text-muted-foreground mb-1">אימייל</p>
                <p className="font-semibold text-[#124734]" dir="ltr">
                  support@buspro.example.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
