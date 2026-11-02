import { 
  UserProfile, 
  StudySession, 
  VocabularyItem, 
  GrammarTopic, 
  SkillProgress, 
  Goal, 
  GoalProgressRecord, 
  PlannedActivity, 
  RestDay, 
  UserSettings 
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'll_tracker_profile',
  SESSIONS: 'll_tracker_sessions',
  VOCABULARY: 'll_tracker_vocabulary',
  GRAMMAR: 'll_tracker_grammar',
  SKILLS: 'll_tracker_skills',
  GOALS: 'll_tracker_goals',
  GOAL_PROGRESS: 'll_tracker_goal_progress',
  PLANNED: 'll_tracker_planned',
  REST_DAYS: 'll_tracker_rest_days',
  SETTINGS: 'll_tracker_settings',
  SAMPLE_LOADED: 'll_tracker_sample_loaded',
};

// Helpers
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSampleData(userId: string = 'demo-user'): {
  profile: UserProfile;
  sessions: StudySession[];
  vocabulary: VocabularyItem[];
  grammar: GrammarTopic[];
  skills: SkillProgress[];
  goals: Goal[];
  goalProgress: GoalProgressRecord[];
  planned: PlannedActivity[];
  restDays: RestDay[];
  settings: UserSettings;
} {
  const today = getTodayString();

  const profile: UserProfile = {
    id: userId,
    name: 'Elena Rostova',
    language: 'Spanish',
    current_level: 'B1',
    target_level: 'C1',
    learning_start_date: getPastDateString(60),
    daily_study_goal_minutes: 45,
    daily_vocab_goal: 8,
    daily_grammar_goal: 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sessions: StudySession[] = [
    {
      id: 'sess-today-1',
      user_id: userId,
      study_date: today,
      start_time: '09:00',
      end_time: '09:35',
      duration_minutes: 35,
      activity: 'Podcast: Radio Ambulante',
      skill: 'Listening',
      notes: 'Understood ~80% of native conversation without subtitles.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sess-today-2',
      user_id: userId,
      study_date: today,
      start_time: '13:00',
      end_time: '13:20',
      duration_minutes: 20,
      activity: 'Subjunctive triggers review',
      skill: 'Grammar',
      notes: 'Reviewed ojalá and expressions of doubt.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'sess-yest-1',
      user_id: userId,
      study_date: getPastDateString(1),
      start_time: '18:00',
      end_time: '18:50',
      duration_minutes: 50,
      activity: 'Novel: Cien Años de Soledad (Ch. 3)',
      skill: 'Reading',
      notes: 'Marked 6 new literary adjectives.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'sess-2days-1',
      user_id: userId,
      study_date: getPastDateString(2),
      start_time: '20:00',
      end_time: '20:45',
      duration_minutes: 45,
      activity: 'Language exchange call with Sofia',
      skill: 'Speaking',
      notes: 'Practiced past tense storytelling and narrating childhood trips.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'sess-3days-1',
      user_id: userId,
      study_date: getPastDateString(3),
      start_time: '08:30',
      end_time: '09:15',
      duration_minutes: 45,
      activity: 'Vocabulary retention & phrase writing',
      skill: 'Vocabulary',
      notes: 'Recorded idioms related to weather and emotion.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'sess-4days-1',
      user_id: userId,
      study_date: getPastDateString(4),
      start_time: '19:00',
      end_time: '19:40',
      duration_minutes: 40,
      activity: 'Journal entry: Weekend reflections',
      skill: 'Writing',
      notes: 'Wrote 250 words about architectural design.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'sess-5days-1',
      user_id: userId,
      study_date: getPastDateString(5),
      start_time: '10:00',
      end_time: '10:55',
      duration_minutes: 55,
      activity: 'News broadcast: RTVE Noticias',
      skill: 'Listening',
      notes: 'Focused on regional accents and fast paced speech.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'sess-6days-1',
      user_id: userId,
      study_date: getPastDateString(6),
      start_time: '17:00',
      end_time: '17:35',
      duration_minutes: 35,
      activity: 'Irregular preterite drill notes',
      skill: 'Grammar',
      notes: 'Poner, saber, querer forms.',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'sess-8days-1',
      user_id: userId,
      study_date: getPastDateString(8),
      start_time: '11:00',
      end_time: '11:45',
      duration_minutes: 45,
      activity: 'Short story reading & notes',
      skill: 'Reading',
      notes: 'Read Cortázar short fiction piece.',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'sess-9days-1',
      user_id: userId,
      study_date: getPastDateString(9),
      start_time: '14:00',
      end_time: '14:50',
      duration_minutes: 50,
      activity: 'Pronunciation and shadow speaking',
      skill: 'Speaking',
      notes: 'Shadowing Spanish podcast host cadence.',
      created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
  ];

  const restDays: RestDay[] = [
    {
      id: 'rest-1',
      user_id: userId,
      rest_date: getPastDateString(7),
      notes: 'Planned family trip - rest day taken.',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    }
  ];

  const vocabulary: VocabularyItem[] = [
    {
      id: 'vocab-1',
      user_id: userId,
      word: 'Desafortunadamente',
      category: 'Connectors',
      difficulty: 'Medium',
      status: 'Mastered',
      date_added: getPastDateString(14),
      notes: 'Means "unfortunately". Good in formal essays.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-2',
      user_id: userId,
      word: 'Imprescindible',
      category: 'Adjectives',
      difficulty: 'Hard',
      status: 'Learning',
      date_added: getPastDateString(10),
      notes: 'Essential / indispensable. Common in B2 texts.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-3',
      user_id: userId,
      word: 'Cotilleo',
      category: 'Colloquial',
      difficulty: 'Easy',
      status: 'Mastered',
      date_added: getPastDateString(20),
      notes: 'Gossip / chatter.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-4',
      user_id: userId,
      word: 'Averiguar',
      category: 'Verbs',
      difficulty: 'Medium',
      status: 'Learning',
      date_added: getPastDateString(5),
      notes: 'To figure out / to inquire / verify.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-5',
      user_id: userId,
      word: 'Madrugar',
      category: 'Daily Life',
      difficulty: 'Easy',
      status: 'Mastered',
      date_added: getPastDateString(25),
      notes: 'To wake up early. Unique cultural verb.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-6',
      user_id: userId,
      word: 'Puntualizar',
      category: 'Academic',
      difficulty: 'Hard',
      status: 'Not started',
      date_added: today,
      notes: 'To specify or clarify nuances.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-7',
      user_id: userId,
      word: 'Estremecer',
      category: 'Literature',
      difficulty: 'Hard',
      status: 'Learning',
      date_added: today,
      notes: 'To shudder or shake with emotion.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vocab-8',
      user_id: userId,
      word: 'Sobremesa',
      category: 'Culture',
      difficulty: 'Medium',
      status: 'Mastered',
      date_added: getPastDateString(18),
      notes: 'Time spent lingering around table after dining.',
      created_at: new Date().toISOString(),
    }
  ];

  const grammar: GrammarTopic[] = [
    {
      id: 'gram-1',
      user_id: userId,
      topic: 'Present Subjunctive with Emotions',
      category: 'Subjunctive Mood',
      difficulty: 'Medium',
      status: 'Completed',
      date_added: getPastDateString(12),
      notes: 'Me alegro de que, es una lástima que + subjuntivo.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'gram-2',
      user_id: userId,
      topic: 'Por vs. Para Nuances',
      category: 'Prepositions',
      difficulty: 'Medium',
      status: 'Completed',
      date_added: getPastDateString(28),
      notes: 'Cause vs purpose, duration vs deadline.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'gram-3',
      user_id: userId,
      topic: 'Imperfect Subjunctive (Past Subjunctive)',
      category: 'Subjunctive Mood',
      difficulty: 'Hard',
      status: 'Learning',
      date_added: getPastDateString(4),
      notes: '-ra and -se endings. Si tuviera más tiempo...',
      created_at: new Date().toISOString(),
    },
    {
      id: 'gram-4',
      user_id: userId,
      topic: 'Conditional Sentences (Type 2 & 3)',
      category: 'Conditionals',
      difficulty: 'Hard',
      status: 'Not started',
      date_added: today,
      notes: 'Hypothetical situations and past counterfactuals.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'gram-5',
      user_id: userId,
      topic: 'Indirect & Direct Object Pronoun Placement',
      category: 'Pronouns',
      difficulty: 'Easy',
      status: 'Completed',
      date_added: getPastDateString(35),
      notes: 'Se lo dije, dándomelo.',
      created_at: new Date().toISOString(),
    }
  ];

  const skills: SkillProgress[] = [
    {
      id: 'skill-1',
      user_id: userId,
      skill: 'Reading',
      current_level: 'B2',
      target_level: 'C1',
      progress_percentage: 68,
      notes: 'Comfortable with contemporary novels and news articles.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'skill-2',
      user_id: userId,
      skill: 'Listening',
      current_level: 'B1',
      target_level: 'C1',
      progress_percentage: 52,
      notes: 'Podcasts are very clear; conversational group speech is harder.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'skill-3',
      user_id: userId,
      skill: 'Speaking',
      current_level: 'B1',
      target_level: 'B2',
      progress_percentage: 45,
      notes: 'Can hold 45 min conversations, working on natural filler words.',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'skill-4',
      user_id: userId,
      skill: 'Writing',
      current_level: 'B1',
      target_level: 'B2',
      progress_percentage: 40,
      notes: 'Grammar is structured; expanding connectors and descriptive tone.',
      updated_at: new Date().toISOString(),
    }
  ];

  const goals: Goal[] = [
    {
      id: 'goal-1',
      user_id: userId,
      name: 'Daily Study Habit',
      description: 'Spend at least 45 minutes on language practice every day',
      goal_type: 'daily',
      target_value: 45,
      measurement_type: 'minutes',
      frequency: 'daily',
      skill: 'All',
      start_date: getPastDateString(30),
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'goal-2',
      user_id: userId,
      name: 'Weekly Listening Immersion',
      description: 'Log 4 hours of active Spanish listening per week',
      goal_type: 'weekly',
      target_value: 240,
      measurement_type: 'minutes',
      frequency: 'weekly',
      skill: 'Listening',
      start_date: getPastDateString(14),
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'goal-3',
      user_id: userId,
      name: 'Monthly Vocabulary Expansion',
      description: 'Add and master 50 high-frequency B2 words',
      goal_type: 'monthly',
      target_value: 50,
      measurement_type: 'words',
      frequency: 'monthly',
      skill: 'Vocabulary',
      start_date: getPastDateString(20),
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'goal-4',
      user_id: userId,
      name: 'Master Subjunctive Mood',
      description: 'Complete 8 core grammar topics on subjunctive nuances',
      goal_type: 'custom',
      target_value: 8,
      measurement_type: 'topics',
      frequency: 'custom',
      skill: 'Grammar',
      start_date: getPastDateString(25),
      end_date: getPastDateString(-20),
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ];

  const goalProgress: GoalProgressRecord[] = [];

  const planned: PlannedActivity[] = [
    {
      id: 'plan-1',
      user_id: userId,
      activity: 'Morning listening podcast (Radio Ambulante)',
      skill: 'Listening',
      planned_date: today,
      planned_duration: 35,
      priority: 'High',
      notes: 'Episode on investigative journalism in Mexico.',
      completed: true,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'plan-2',
      user_id: userId,
      activity: 'Review subjunctive mood triggers',
      skill: 'Grammar',
      planned_date: today,
      planned_duration: 20,
      priority: 'Medium',
      notes: 'Make notes for triggers of emotion & doubt.',
      completed: true,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'plan-3',
      user_id: userId,
      activity: 'Evening reading: 1 chapter of novel',
      skill: 'Reading',
      planned_date: today,
      planned_duration: 30,
      priority: 'Low',
      notes: 'Notice usage of imperfect vs preterite in literary storytelling.',
      completed: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'plan-4',
      user_id: userId,
      activity: 'Speaking exchange session',
      skill: 'Speaking',
      planned_date: getPastDateString(-1),
      planned_duration: 45,
      priority: 'High',
      notes: 'Discuss current events and cultural festivals.',
      completed: false,
      created_at: new Date().toISOString(),
    }
  ];

  const settings: UserSettings = {
    id: 'settings-1',
    user_id: userId,
    theme: 'light',
    notifications_enabled: false,
    reminder_streak: true,
    reminder_daily_goal: true,
    reminder_time: '20:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    profile,
    sessions,
    vocabulary,
    grammar,
    skills,
    goals,
    goalProgress,
    planned,
    restDays,
    settings,
  };
}

export const LocalStore = {
  getProfile: (): UserProfile | null => {
    const val = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return val ? JSON.parse(val) : null;
  },
  setProfile: (profile: UserProfile): void => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSessions: (): StudySession[] => {
    const val = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return val ? JSON.parse(val) : [];
  },
  setSessions: (sessions: StudySession[]): void => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getVocabulary: (): VocabularyItem[] => {
    const val = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    return val ? JSON.parse(val) : [];
  },
  setVocabulary: (items: VocabularyItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(items));
  },

  getGrammar: (): GrammarTopic[] => {
    const val = localStorage.getItem(STORAGE_KEYS.GRAMMAR);
    return val ? JSON.parse(val) : [];
  },
  setGrammar: (items: GrammarTopic[]): void => {
    localStorage.setItem(STORAGE_KEYS.GRAMMAR, JSON.stringify(items));
  },

  getSkills: (): SkillProgress[] => {
    const val = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return val ? JSON.parse(val) : [];
  },
  setSkills: (skills: SkillProgress[]): void => {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  getGoals: (): Goal[] => {
    const val = localStorage.getItem(STORAGE_KEYS.GOALS);
    return val ? JSON.parse(val) : [];
  },
  setGoals: (goals: Goal[]): void => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getGoalProgress: (): GoalProgressRecord[] => {
    const val = localStorage.getItem(STORAGE_KEYS.GOAL_PROGRESS);
    return val ? JSON.parse(val) : [];
  },
  setGoalProgress: (records: GoalProgressRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.GOAL_PROGRESS, JSON.stringify(records));
  },

  getPlanned: (): PlannedActivity[] => {
    const val = localStorage.getItem(STORAGE_KEYS.PLANNED);
    return val ? JSON.parse(val) : [];
  },
  setPlanned: (activities: PlannedActivity[]): void => {
    localStorage.setItem(STORAGE_KEYS.PLANNED, JSON.stringify(activities));
  },

  getRestDays: (): RestDay[] => {
    const val = localStorage.getItem(STORAGE_KEYS.REST_DAYS);
    return val ? JSON.parse(val) : [];
  },
  setRestDays: (restDays: RestDay[]): void => {
    localStorage.setItem(STORAGE_KEYS.REST_DAYS, JSON.stringify(restDays));
  },

  getSettings: (): UserSettings | null => {
    const val = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return val ? JSON.parse(val) : null;
  },
  setSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  isSampleLoaded: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.SAMPLE_LOADED) === 'true';
  },

  loadSampleData: (userId: string = 'demo-user') => {
    const data = generateSampleData(userId);
    LocalStore.setProfile(data.profile);
    LocalStore.setSessions(data.sessions);
    LocalStore.setVocabulary(data.vocabulary);
    LocalStore.setGrammar(data.grammar);
    LocalStore.setSkills(data.skills);
    LocalStore.setGoals(data.goals);
    LocalStore.setGoalProgress(data.goalProgress);
    LocalStore.setPlanned(data.planned);
    LocalStore.setRestDays(data.restDays);
    LocalStore.setSettings(data.settings);
    localStorage.setItem(STORAGE_KEYS.SAMPLE_LOADED, 'true');
    return data;
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.VOCABULARY);
    localStorage.removeItem(STORAGE_KEYS.GRAMMAR);
    localStorage.removeItem(STORAGE_KEYS.SKILLS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.GOAL_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.PLANNED);
    localStorage.removeItem(STORAGE_KEYS.REST_DAYS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SAMPLE_LOADED);
  }
};
