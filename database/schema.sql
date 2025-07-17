-- Supabase Database Schema
-- Run these commands in your Supabase SQL editor

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  duration TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  course_id BIGINT REFERENCES courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_course_id ON chat_messages(course_id);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
CREATE POLICY "Public can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public can insert courses" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update courses" ON courses FOR UPDATE USING (true);
CREATE POLICY "Public can delete courses" ON courses FOR DELETE USING (true);

CREATE POLICY "Public can view messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public can insert messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update messages" ON chat_messages FOR UPDATE USING (true);
CREATE POLICY "Public can delete messages" ON chat_messages FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO courses (title, description, instructor, duration, level) VALUES
  ('Introduction to React', 'Learn the basics of React framework', 'John Doe', '4 weeks', 'Beginner'),
  ('Advanced JavaScript', 'Deep dive into JavaScript concepts', 'Jane Smith', '6 weeks', 'Advanced'),
  ('Node.js Backend Development', 'Build scalable backend applications', 'Mike Johnson', '8 weeks', 'Intermediate'),
  ('Database Design Principles', 'Learn to design efficient databases', 'Sarah Wilson', '5 weeks', 'Intermediate'),
  ('UI/UX Design Fundamentals', 'Master user interface and experience design', 'Alex Chen', '7 weeks', 'Beginner');

-- Insert sample chat messages
INSERT INTO chat_messages (message, sender, course_id) VALUES
  ('Hello! Welcome to the course management system. How can I help you today?', 'bot', NULL),
  ('I can help you find courses, answer questions about course content, or provide learning guidance.', 'bot', NULL);
