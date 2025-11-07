import Link from "next/link"

export default function AppFooter() {
  return (
    <footer className="bg-[#124734] text-white mt-auto">
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
  )
}
