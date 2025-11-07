import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-[#124734] text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">תנאי שימוש</h1>
            <Button asChild variant="ghost" className="text-white hover:bg-[#1a5d47]">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>תנאי השימוש של BusPro</CardTitle>
              <p className="text-sm text-muted-foreground">עודכן לאחרונה: ינואר 2025</p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">1. קבלת התנאים</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  על ידי שימוש במערכת BusPro, אתה מסכים לתנאי השימוש המפורטים להלן. אם אינך מסכים לתנאים אלו, אנא הימנע
                  משימוש במערכת.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">2. שימוש במערכת</h2>
                <p className="text-foreground-secondary leading-relaxed mb-2">
                  מערכת BusPro מיועדת לתרגול מבחני תיאוריה לנהג אוטובוס. השימוש במערכת כפוף לכללים הבאים:
                </p>
                <ul className="list-disc pr-6 space-y-2 text-foreground-secondary">
                  <li>המערכת מיועדת לשימוש אישי בלבד</li>
                  <li>אסור להעתיק, להפיץ או למכור תוכן מהמערכת ללא רשות מפורשת</li>
                  <li>אסור לבצע פעולות שעלולות לפגוע בתפקוד המערכת</li>
                  <li>יש לשמור על סודיות פרטי ההתחברות שלך</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">3. תוכן המערכת</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  השאלות והתוכן במערכת מיועדים לתרגול בלבד. אנו משתדלים לספק תוכן מדויק ועדכני, אך איננו מתחייבים שהתוכן
                  זהה לחלוטין למבחן הרשמי. אנו ממליצים להשלים את הלימוד עם חומרי הכנה נוספים.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">4. אחריות משתמש</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אתה אחראי לכל פעילות המתבצעת תחת חשבונך. יש לדווח מיד על כל שימוש לא מורשה בחשבון.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">5. הגבלת אחריות</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  המערכת מסופקת "כמות שהיא" (AS-IS). אנו לא אחראים לנזקים ישירים או עקיפים הנובעים משימוש במערכת, לרבות
                  אי-הצלחה במבחן הרשמי.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">6. שינויים בתנאים</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת. שינויים משמעותיים יפורסמו במערכת. המשך שימוש
                  במערכת לאחר שינויים מהווה הסכמה לתנאים החדשים.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">7. יצירת קשר</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  לשאלות או הערות לגבי תנאי השימוש, ניתן ליצור קשר דרך דף "אודות".
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
