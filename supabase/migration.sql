-- Samvad Cloud Sync Schema
-- Run this in the Supabase SQL Editor after creating your project

-- ============================================================
-- Table: profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  active_track TEXT NOT NULL DEFAULT 'vachanamrut',
  xp INTEGER NOT NULL DEFAULT 0,
  start_date TEXT,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_longest INTEGER NOT NULL DEFAULT 0,
  streak_last_read_date TEXT,
  streak_freezes_available INTEGER NOT NULL DEFAULT 3,
  streak_freezes_used TEXT[] DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{"fontSize":"medium","theme":"dark","language":"en","showSetting":true}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS: users can only access their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- Table: track_progress
-- ============================================================
CREATE TABLE track_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  current_reading INTEGER NOT NULL DEFAULT 1,
  completed_readings INTEGER[] DEFAULT '{}',
  reading_history JSONB DEFAULT '{}',
  quiz_results JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, track_id)
);

-- RLS
ALTER TABLE track_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON track_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON track_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON track_progress FOR UPDATE USING (auth.uid() = user_id);
