# ייבוא 500 השאלות לדטאבייס

## שלבים להרצת הסקריפט:

### דרך 1: הרצה ידנית (מומלץ)

1. **וודא שיש לך את משתני הסביבה:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **התקן ts-node אם עדיין לא מותקן:**
   \`\`\`bash
   npm install -D ts-node @types/node
   \`\`\`

3. **הרץ את הסקריפט:**
   \`\`\`bash
   npx ts-node --project tsconfig.json scripts/import-all-questions.ts
   \`\`\`

### דרך 2: הרצה דרך npm script

1. **הוסף לpackage.json:**
   \`\`\`json
   {
     "scripts": {
       "import:questions": "ts-node --project tsconfig.json scripts/import-all-questions.ts"
     }
   }
   \`\`\`

2. **הרץ:**
   \`\`\`bash
   npm run import:questions
   \`\`\`

## מה הסקריפט עושה:

1. מוחק את כל השאלות הקיימות בדטאבייס
2. קורא את 500 השאלות מקובץ ה-JSON
3. מתאים את התשובות הנכונות לפי הקובץ correct_answers
4. מייבא את כל השאלות לדטאבייס ב-batches של 100
5. מדפיס סיכום של כמה שאלות יש בכל פרק

## אחרי הייבוא:

המערכת תטען:
- **30 שאלות** למבחן סימולציה
- מחולקות לפי פרקים: 6 מפרק 1, 2 מפרק 2, וכו'
- התשובות ערבבות אוטומטית בכל מבחן
- ציון עובר: עד 8 טעויות (22+ נכון)
