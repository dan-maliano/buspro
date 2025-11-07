"use client"

import { useState } from "react"
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
} from "@/components/ui/alert-dialog"
import { deleteUser } from "@/lib/actions/admin"
import { useRouter } from "next/navigation"

interface DeleteUserButtonProps {
  userId: string
  userName: string
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const formData = new FormData()
    formData.append("userId", userId)

    await deleteUser(formData)
    setIsDeleting(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hover:bg-transparent text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק לצמיתות את המשתמש <strong>{userName}</strong> וכל הנתונים הקשורים אליו (מבחנים, תשובות,
              היסטוריה).
              <br />
              <br />
              <strong className="text-red-600">לא ניתן לבטל פעולה זו!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "מוחק..." : "כן, מחק משתמש"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
