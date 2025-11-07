import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MailCheck } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-surface">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#124734]/10">
              <MailCheck className="h-8 w-8 text-[#124734]" />
            </div>
            <CardTitle className="text-2xl">אמת את כתובת האימייל שלך</CardTitle>
            <CardDescription className="text-base">
              שלחנו לך מייל אימות מ-BusPro. אנא בדוק את תיבת הדואר שלך (כולל תיקיית הספאם) ולחץ על הקישור כדי להפעיל את
              החשבון שלך. המייל נשלח מ-BusPro דרך Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="text-muted-foreground">
                <strong>שים לב:</strong> הקישור לאימות תקף ל-24 שעות. אם לא קיבלת את המייל, בדוק גם בתיקיית הספאם. המייל
                נשלח מ-BusPro.
              </p>
            </div>
            <Button asChild className="w-full bg-[#124734] hover:bg-[#0d331f]">
              <Link href="/auth/login">חזור להתחברות</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
