"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteExamSession } from "@/lib/actions/exam"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DeleteExamButtonProps {
  sessionId: string
}

export function DeleteExamButton({ sessionId }: DeleteExamButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    console.log("[v0] Deleting exam session:", sessionId)

    const result = await deleteExamSession(sessionId)
    console.log("[v0] Delete result:", result)

    if (result.success) {
      setIsOpen(false)

      toast({
        title: "המבחן נמחק בהצלחה",
        description: "הסטטיסטיקות עודכנו בהתאם",
      })

      router.refresh()

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else {
      toast({
        title: "שגיאה במחיקת המבחן",
        description: result.error || "אנא נסה שוב",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת מבחן</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק מבחן זה? פעולה זו תמחק את המבחן ואת כל התשובות שלך, ותעדכן את הסטטיסטיקות בהתאם.
            לא ניתן לבטל פעולה זו.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? "מוחק..." : "מחק מבחן"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
