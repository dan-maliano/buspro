-- Add completed column to exam_sessions if it doesn't exist
-- This ensures we can track which exams have been submitted

DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'exam_sessions' 
        AND column_name = 'completed'
    ) THEN
        -- Add the column
        ALTER TABLE exam_sessions 
        ADD COLUMN completed BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Column "completed" added successfully';
    ELSE
        RAISE NOTICE 'Column "completed" already exists';
    END IF;
    
    -- Update existing sessions that have end_time but no completed flag
    UPDATE exam_sessions 
    SET completed = true 
    WHERE end_time IS NOT NULL AND completed IS NULL;
    
    RAISE NOTICE 'Updated existing sessions with end_time to completed=true';
END $$;
