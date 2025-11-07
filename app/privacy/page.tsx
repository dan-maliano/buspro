import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>מדיניות הפרטיות של BusPro</CardTitle>
              <p className="text-sm text-muted-foreground">עודכן לאחרונה: ינואר 2025</p>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">1. מבוא</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו ב-BusPro מחויבים להגן על פרטיותך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ושומרים על
                  המידע האישי שלך.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">2. מידע שאנו אוספים</h2>
                <p className="text-foreground-secondary leading-relaxed mb-2">אנו אוספים את סוגי המידע הבאים:</p>
                <ul className="list-disc pr-6 space-y-2 text-foreground-secondary">
                  <li>
                    <strong>מידע אישי:</strong> שם מלא, כתובת אימייל, סיסמה מוצפנת
                  </li>
                  <li>
                    <strong>מידע על שימוש:</strong> תוצאות מבחנים, תשובות לשאלות, זמני תרגול
                  </li>
                  <li>
                    <strong>מידע טכני:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה
                  </li>
                  <li>
                    <strong>קוקיז:</strong> קבצים קטנים לשמירת העדפות והתחברות
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">3. שימוש במידע</h2>
                <p className="text-foreground-secondary leading-relaxed mb-2">אנו משתמשים במידע שנאסף למטרות הבאות:</p>
                <ul className="list-disc pr-6 space-y-2 text-foreground-secondary">
                  <li>ניהול חשבון המשתמש ואימות זהות</li>
                  <li>מתן גישה למבחני תרגול ומעקב אחר התקדמות</li>
                  <li>שיפור איכות השירות והתאמה אישית</li>
                  <li>שליחת התראות ועדכונים (בהסכמה)</li>
                  <li>אבטחת המערכת ומניעת שימוש לא מורשה</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">4. אבטחת מידע</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך, כולל הצפנת סיסמאות, תקשורת מאובטחת (HTTPS), והגבלת
                  גישה למידע רק לעובדים מורשים. עם זאת, אין אמצעי אבטחה שהוא בטוח ב-100%.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">5. שיתוף מידע</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו לא משתפים, מוכרים או משכירים את המידע האישי שלך לצדדים שלישיים למטרות שיווקיות. אנו עשויים לשתף
                  מידע במקרים הבאים:
                </p>
                <ul className="list-disc pr-6 space-y-2 text-foreground-secondary">
                  <li>בהתאם לדרישת חוק או צו שיפוטי</li>
                  <li>עם ספקי שירות טכניים (כגון אירוח, אימייל) המחויבים לשמור על סודיות</li>
                  <li>במקרה של מיזוג או רכישה עסקית</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">6. זכויותיך</h2>
                <p className="text-foreground-secondary leading-relaxed mb-2">לך יש את הזכויות הבאות:</p>
                <ul className="list-disc pr-6 space-y-2 text-foreground-secondary">
                  <li>לצפות במידע האישי שאנו מחזיקים עליך</li>
                  <li>לבקש תיקון או עדכון של מידע לא מדויק</li>
                  <li>למחוק את חשבונך ואת המידע הקשור אליו</li>
                  <li>לבטל הסכמה לקבלת תקשורת שיווקית</li>
                  <li>להגיש תלונה לרשות להגנת הפרטיות</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">7. קוקיז</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו משתמשים בקוקיז כדי לשפר את חוויית המשתמש, לשמור העדפות ולנתח שימוש באתר. ניתן לנהל את העדפות
                  הקוקיז בהגדרות הדפדפן שלך.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">8. שינויים במדיניות</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. שינויים משמעותיים יפורסמו באתר. המשך שימוש במערכת לאחר
                  שינויים מהווה הסכמה למדיניות המעודכנת.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#124734] mb-3">9. יצירת קשר</h2>
                <p className="text-foreground-secondary leading-relaxed">
                  לשאלות או בקשות בנוגע לפרטיותך, ניתן ליצור קשר דרך דף "אודות".
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
