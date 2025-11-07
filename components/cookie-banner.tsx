"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-[#124734] shadow-lg">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-[#124734] mb-2">שימוש בקוקיז</h3>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              אנו משתמשים בקוקיז כדי לשפר את חוויית המשתמש שלך, לשמור העדפות ולנתח שימוש באתר. על ידי המשך גלישה באתר,
              אתה מסכים לשימוש בקוכיז בהתאם ל
              <Link href="/privacy" className="underline mx-1 text-[#124734] hover:text-[#0d331f]">
                מדיניות הפרטיות
              </Link>
              שלנו.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={handleAccept} className="flex-1 md:flex-initial bg-[#124734] hover:bg-[#0d331f]">
              אני מסכים
            </Button>
            <Button onClick={handleDecline} variant="outline" className="flex-1 md:flex-initial bg-transparent">
              דחה
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
