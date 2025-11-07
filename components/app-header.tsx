import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, User, Bus } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AppHeader({ user }: { user: SupabaseUser | null }) {
  return (
    <header className="bg-[#124734] text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex flex-col gap-2 hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-3">
            <Bus className="h-10 w-10" />
            <h1 className="text-3xl font-bold">BusPro</h1>
          </div>
          <p className="text-sm opacity-90">הכנה לתורת הרכב לנהג אוטובוס</p>
        </Link>
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
  )
}
