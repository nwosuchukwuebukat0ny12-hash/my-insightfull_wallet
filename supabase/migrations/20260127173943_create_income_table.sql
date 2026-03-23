-- Create income table
CREATE TABLE IF NOT EXISTS public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Income RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'Users can view their own income'
  ) THEN
    CREATE POLICY "Users can view their own income"
    ON public.income FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'Users can create their own income'
  ) THEN
    CREATE POLICY "Users can create their own income"
    ON public.income FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'Users can update their own income'
  ) THEN
    CREATE POLICY "Users can update their own income"
    ON public.income FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'income' AND policyname = 'Users can delete their own income'
  ) THEN
    CREATE POLICY "Users can delete their own income"
    ON public.income FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;
