import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Starting database migration...")

    // Add the correct_answer_shuffled column if it doesn't exist
    const { error: migrationError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE user_answers 
        ADD COLUMN IF NOT EXISTS correct_answer_shuffled TEXT;
        
        COMMENT ON COLUMN user_answers.correct_answer_shuffled IS 
        'התשובה הנכונה אחרי ערבוב התשובות - האות שהמשתמש ראה במהלך המבחן';
      `,
    })

    if (migrationError) {
      console.error("[v0] Migration error:", migrationError)
      return NextResponse.json(
        {
          error: "Migration failed",
          details: migrationError.message,
          hint: "יש להריץ את הSQL הבא ידנית ב-Supabase SQL Editor:\n\nALTER TABLE user_answers ADD COLUMN IF NOT EXISTS correct_answer_shuffled TEXT;",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Migration complete!")

    return NextResponse.json({
      success: true,
      message: "העמודה correct_answer_shuffled נוספה בהצלחה לטבלת user_answers",
    })
  } catch (error: any) {
    console.error("[v0] Migration error:", error)

    // If RPC function doesn't exist, return instructions
    return NextResponse.json(
      {
        error: "Migration requires manual execution",
        instructions: "יש להריץ את הפקודה הבאה ב-Supabase SQL Editor",
        sql: "ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS correct_answer_shuffled TEXT;",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
