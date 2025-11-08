-- Update existing questions and answers from English letters to Hebrew letters
-- This script converts A,B,C,D to א,ב,ג,ד in the database

-- Update questions table - correct_answer column
UPDATE public.questions
SET correct_answer = CASE correct_answer
  WHEN 'A' THEN 'א'
  WHEN 'B' THEN 'ב'
  WHEN 'C' THEN 'ג'
  WHEN 'D' THEN 'ד'
  ELSE correct_answer
END
WHERE correct_answer IN ('A', 'B', 'C', 'D');

-- Update user_answers table - user_answer column
UPDATE public.user_answers
SET user_answer = CASE user_answer
  WHEN 'A' THEN 'א'
  WHEN 'B' THEN 'ב'
  WHEN 'C' THEN 'ג'
  WHEN 'D' THEN 'ד'
  ELSE user_answer
END
WHERE user_answer IN ('A', 'B', 'C', 'D');

-- Verify the changes
SELECT 'Questions updated:', COUNT(*) 
FROM public.questions 
WHERE correct_answer IN ('א', 'ב', 'ג', 'ד');

SELECT 'User answers updated:', COUNT(*) 
FROM public.user_answers 
WHERE user_answer IN ('א', 'ב', 'ג', 'ד');

-- Show sample of updated questions
SELECT id, question_text, correct_answer 
FROM public.questions 
LIMIT 5;
