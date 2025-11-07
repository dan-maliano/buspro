"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, User, Bus, Shield, Menu, X } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useState } from "react"

export default function AppHeader({ user }: { user: SupabaseUser | null }) {
  const isAdmin = user?.email === "dbm1000000@gmail.com"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-[#124734] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop and Mobile Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col gap-0.5 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2">
              <Bus className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BusPro</h1>
            </div>
            <p className="text-xs opacity-90">הכנה לתורת הרכב לנהג אוטובוס</p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-white hover:bg-[#1a5d47]">
                      <Shield className="ml-2 h-4 w-4" />
                      ניהול
                    </Button>
                  </Link>
                )}
                <Link href="/history">
                  <Button variant="ghost" className="text-white hover:bg-[#1a5d47]">
                    היסטוריה
                  </Button>
                </Link>
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
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white hover:bg-[#1a5d47]">
                  <Link href="/auth/login">התחבר</Link>
                </Button>
                <Button asChild className="bg-white text-[#124734] hover:bg-gray-100">
                  <Link href="/auth/sign-up">הרשם</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-[#1a5d47] rounded transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="תפריט"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2 border-t border-white/20 pt-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                      <Shield className="ml-2 h-4 w-4" />
                      ניהול
                    </Button>
                  </Link>
                )}
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    עמוד הבית
                  </Button>
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    היסטוריה
                  </Button>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    <User className="ml-2 h-4 w-4" />
                    פרופיל
                  </Button>
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    אודות
                  </Button>
                </Link>
                <form action={signOut} className="w-full">
                  <Button type="submit" variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    <LogOut className="ml-2 h-4 w-4" />
                    התנתק
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    עמוד הבית
                  </Button>
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    אודות
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-[#1a5d47] justify-start">
                    התחבר
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-[#124734] hover:bg-gray-100">הרשם</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
