-- Add column to store the shuffled correct answer
ALTER TABLE user_answers 
ADD COLUMN IF NOT EXISTS correct_answer_shuffled TEXT;

-- Add comment to explain the purpose
COMMENT ON COLUMN user_answers.correct_answer_shuffled IS 'The correct answer letter after shuffling (א, ב, ג, or ד)';
