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

interface DeleteExamButtonProps {
  sessionId: string
}

export function DeleteExamButton({ sessionId }: DeleteExamButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteExamSession(sessionId)

    if (result.success) {
      router.refresh()
    } else {
      alert("שגיאה במחיקת המבחן: " + result.error)
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
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
          <AlertDialogCancel>ביטול</AlertDialogCancel>
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
