"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react"

export default function ImportQuestionsPage() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [migrationError, setMigrationError] = useState<any>(null)

  const handleImport = async () => {
    setImporting(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/import-questions", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data)
      }
    } catch (err: any) {
      setError({ error: "Network error", details: err.message })
    } finally {
      setImporting(false)
    }
  }

  const handleMigration = async () => {
    setMigrating(true)
    setMigrationResult(null)
    setMigrationError(null)

    try {
      const response = await fetch("/api/migrate-database", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMigrationResult(data)
      } else {
        setMigrationError(data)
      }
    } catch (err: any) {
      setMigrationError({ error: "Network error", details: err.message })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            שלב 1: עדכון מבנה הדטאבייס
          </CardTitle>
          <CardDescription>הוסף את העמודה correct_answer_shuffled לטבלת user_answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleMigration}
            disabled={migrating}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {migrating ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                מעדכן מבנה...
              </>
            ) : (
              "הרץ מיגרציה"
            )}
          </Button>

          {migrationResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-bold">{migrationResult.message}</div>
              </AlertDescription>
            </Alert>
          )}

          {migrationError && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 space-y-2">
                <div className="font-bold">{migrationError.error}</div>
                {migrationError.instructions && (
                  <div className="mt-2">
                    <strong>{migrationError.instructions}</strong>
                  </div>
                )}
                {migrationError.sql && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{migrationError.sql}</pre>
                )}
                {migrationError.hint && <div className="mt-2 text-sm">{migrationError.hint}</div>}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>למה זה נדרש?</strong>
            </p>
            <p className="mt-1">כדי לשמור את התשובה הנכונה אחרי ערבוב התשובות במבחן, צריך להוסיף עמודה חדשה לטבלה.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>שלב 2: ייבוא שאלות למערכת</CardTitle>
          <CardDescription>ייבוא כל 500 השאלות מקבצי ה-JSON לדטאבייס</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleImport} disabled={importing} className="w-full" size="lg">
            {importing ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                מייבא שאלות...
              </>
            ) : (
              "התחל ייבוא"
            )}
          </Button>

          {result && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-bold mb-2">ייבוא הושלם בהצלחה!</div>
                <div>שאלות שיובאו: {result.imported}</div>
                <div>סה"כ שאלות בדטאבייס: {result.total}</div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 space-y-2">
                <div className="font-bold">שגיאה בייבוא</div>
                <div>{error.error}</div>
                {error.details && (
                  <div className="text-sm mt-2">
                    <strong>פרטים:</strong> {error.details}
                  </div>
                )}
                {error.hint && (
                  <div className="text-sm mt-2">
                    <strong>רמז:</strong> {error.hint}
                  </div>
                )}
                {error.code && (
                  <div className="text-sm mt-2">
                    <strong>קוד שגיאה:</strong> {error.code}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>מה יקרה כשתלחץ על הכפתור:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li>מחיקת כל השאלות הקיימות בדטאבייס</li>
              <li>ייבוא 500 שאלות חדשות מקבצי ה-JSON</li>
              <li>כל שאלה תסווג לפי פרק (פרק 1, פרק 2, וכו')</li>
              <li>כל התשובות יהיו באותיות עבריות (א, ב, ג, ד)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
