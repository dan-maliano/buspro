#!/bin/bash

echo "Running questions import..."
npx tsx scripts/015_import_real_questions.ts > scripts/015_import_real_questions.sql
echo "SQL file generated: scripts/015_import_real_questions.sql"
echo "You can now run this SQL file in your Supabase database"
