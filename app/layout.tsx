import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import CookieBanner from "@/components/cookie-banner"

export const metadata: Metadata = {
  title: "BusPro - הכנה לתורת הרכב לנהג אוטובוס",
  description: "אפליקציית הכנה לתורת הרכב לנהגי אוטובוס",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BusPro",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&family=Rubik:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
