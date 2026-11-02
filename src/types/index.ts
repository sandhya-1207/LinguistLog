export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'Vocabulary' | 'Grammar' | 'Reading' | 'Listening' | 'Speaking' | 'Writing';

export type CoreSkill = 'Reading' | 'Listening' | 'Speaking' | 'Writing';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type VocabStatus = 'Not started' | 'Learning' | 'Mastered';

export type GrammarStatus = 'Not started' | 'Learning' | 'Completed';

export type Priority = 'Low' | 'Medium' | 'High';

export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type MeasurementType = 'minutes' | 'hours' | 'words' | 'topics' | 'sessions' | 'percentage';

export interface UserProfile {
  id: string;
  name: string;
  language: string;
  current_level: CEFRLevel;
  target_level: CEFRLevel;
  learning_start_date: string; // YYYY-MM-DD
  daily_study_goal_minutes: number;
  daily_vocab_goal: number;
  daily_grammar_goal: number;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  study_date: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  duration_minutes: number;
  activity: string;
  skill: SkillType;
  notes?: string;
  created_at?: string;
}

export interface VocabularyItem {
  id: string;
  user_id: string;
  word: string;
  category: string;
  difficulty: Difficulty;
  status: VocabStatus;
  date_added: string; // YYYY-MM-DD
  notes?: string;
  created_at?: string;
}

export interface GrammarTopic {
  id: string;
  user_id: string;
  topic: string;
  category: string;
  difficulty: Difficulty;
  status: GrammarStatus;
  date_added: string; // YYYY-MM-DD
  notes?: string;
  created_at?: string;
}

export interface SkillProgress {
  id: string;
  user_id: string;
  skill: CoreSkill;
  current_level: CEFRLevel;
  target_level: CEFRLevel;
  progress_percentage: number; // 0 - 100
  notes?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target_value: number;
  measurement_type: MeasurementType;
  frequency: GoalFrequency;
  skill?: SkillType | 'All';
  start_date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  is_active: boolean;
  created_at?: string;
}

export interface GoalProgressRecord {
  id: string;
  user_id: string;
  goal_id: string;
  date: string;
  actual_value: number;
  created_at?: string;
}

export interface PlannedActivity {
  id: string;
  user_id: string;
  activity: string;
  skill: SkillType;
  planned_date: string; // YYYY-MM-DD
  planned_duration: number; // minutes
  priority: Priority;
  notes?: string;
  completed: boolean;
  completed_at?: string;
  created_at?: string;
}

export interface RestDay {
  id: string;
  user_id: string;
  rest_date: string; // YYYY-MM-DD
  notes?: string;
  created_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
  reminder_streak: boolean;
  reminder_daily_goal: boolean;
  reminder_time: string; // HH:mm
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface LearningInsight {
  id: string;
  type: 'achievement' | 'tip' | 'progress' | 'warning';
  title: string;
  message: string;
  metric?: string;
}

export interface Quote {
  quote: string;
  author: string;
  languageContext?: string;
}
