import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Bus, Target, Users, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">אודות BusPro</h1>
            <Button asChild variant="ghost" className="text-white hover:bg-[#1a5d47]">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                BusPro היא מערכת תרגול מבחני תיאוריה מתקדמת לנהגי אוטובוס. המטרה שלנו היא לעזור לך להתכונן בצורה הטובה
                ביותר למבחן התיאוריה ולעבור אותו בהצלחה. אנו מספקים תרגול מקיף, מעקב אחר התקדמות, וכלים שיעזרו לך ללמוד
                בצורה יעילה ומותאמת אישית.
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
                  <h3 className="font-bold text-[#124734] mb-2">תרגול חופשי</h3>
                  <p className="text-sm text-foreground-secondary">תרגול ללא הגבלת זמן בקצב שלך, מושלם לחיזוק החומר</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">מעקב התקדמות</h3>
                  <p className="text-sm text-foreground-secondary">סטטיסטיקות מפורטות ומעקב אחר ביצועים לפי קטגוריות</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold text-[#124734] mb-2">הסברים מפורטים</h3>
                  <p className="text-sm text-foreground-secondary">הסבר מפורט לכל שאלה כדי להבין את החומר לעומק</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-[#124734]" />
                <CardTitle className="text-2xl">הצוות שלנו</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-secondary leading-relaxed">
                אנחנו צוות של אנשי חינוך ומומחי תחבורה המחויבים לספק את הכלים הטובים ביותר לנהגי אוטובוס עתידיים. אנו
                מעדכנים באופן קבוע את בסיס השאלות שלנו כדי להבטיח שהוא עדכני ורלוונטי למבחן התיאוריה האמיתי.
              </p>
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
    </div>
  )
}
