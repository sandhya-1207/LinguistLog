import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../services/dataService';
import { LocalStore } from '../services/storageService';
import { getDailyQuote } from '../services/quotes';
import { 
  UserProfile, 
  StudySession, 
  VocabularyItem, 
  GrammarTopic, 
  SkillProgress, 
  Goal, 
  PlannedActivity, 
  RestDay, 
  UserSettings, 
  LearningInsight, 
  Quote 
} from '../types';
import { format, parseISO, isSameDay } from 'date-fns';

interface DataContextType {
  profile: UserProfile | null;
  sessions: StudySession[];
  vocabulary: VocabularyItem[];
  grammar: GrammarTopic[];
  skills: SkillProgress[];
  goals: Goal[];
  planned: PlannedActivity[];
  restDays: RestDay[];
  settings: UserSettings | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Actions
  saveProfile: (p: UserProfile) => Promise<void>;
  addSession: (s: Omit<StudySession, 'id'>) => Promise<void>;
  updateSession: (s: StudySession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;

  addVocabulary: (v: Omit<VocabularyItem, 'id'>) => Promise<void>;
  updateVocabulary: (v: VocabularyItem) => Promise<void>;
  deleteVocabulary: (id: string) => Promise<void>;

  addGrammar: (g: Omit<GrammarTopic, 'id'>) => Promise<void>;
  updateGrammar: (g: GrammarTopic) => Promise<void>;
  deleteGrammar: (id: string) => Promise<void>;

  updateSkillProgress: (skill: SkillProgress) => Promise<void>;

  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (g: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addPlannedActivity: (p: Omit<PlannedActivity, 'id'>) => Promise<void>;
  updatePlannedActivity: (p: PlannedActivity) => Promise<void>;
  deletePlannedActivity: (id: string) => Promise<void>;
  toggleActivityCompletion: (id: string) => Promise<void>;

  toggleRestDay: (dateString: string, notes?: string) => Promise<void>;
  updateUserSettings: (s: UserSettings) => Promise<void>;

  loadSampleData: () => void;
  clearData: () => void;

  // Derived Calculations
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalStudyDays: number;
    isStudiedToday: boolean;
    streakDates: string[];
  };
  todayStats: {
    studyMinutes: number;
    targetMinutes: number;
    completionPercentage: number;
    vocabCount: number;
    grammarCount: number;
    plannedTotal: number;
    plannedCompleted: number;
  };
  totalStats: {
    totalHours: number;
    totalMinutes: number;
    totalSessions: number;
    totalVocab: number;
    masteredVocab: number;
    learningVocab: number;
    totalGrammar: number;
    completedGrammar: number;
    overallGoalCompletionRate: number;
  };
  insights: LearningInsight[];
  quote: Quote;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'demo-user';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [grammar, setGrammar] = useState<GrammarTopic[]>([]);
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [planned, setPlanned] = useState<PlannedActivity[]>([]);
  const [restDays, setRestDays] = useState<RestDay[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        p,
        sess,
        voc,
        gram,
        sk,
        gl,
        pl,
        rd,
        st
      ] = await Promise.all([
        DataService.getProfile(userId),
        DataService.getSessions(userId),
        DataService.getVocabulary(userId),
        DataService.getGrammar(userId),
        DataService.getSkills(userId),
        DataService.getGoals(userId),
        DataService.getPlanned(userId),
        DataService.getRestDays(userId),
        DataService.getSettings(userId),
      ]);

      setProfile(p);
      setSessions(sess);
      setVocabulary(voc);
      setGrammar(gram);
      setSkills(sk);
      setGoals(gl);
      setPlanned(pl);
      setRestDays(rd);
      setSettings(st);
    } catch (e) {
      console.error('Error refreshing tracker data:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived: Streak
  const streak = useMemo(() => {
    return DataService.calculateStreak(sessions, restDays);
  }, [sessions, restDays]);

  // Derived: Today's Overview
  const todayStats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaySessions = sessions.filter(s => s.study_date === today);
    const studyMinutes = todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const targetMinutes = profile?.daily_study_goal_minutes || 30;
    const completionPercentage = Math.min(100, Math.round((studyMinutes / targetMinutes) * 100));

    const vocabCount = vocabulary.filter(v => v.date_added === today).length;
    const grammarCount = grammar.filter(g => g.date_added === today && g.status === 'Completed').length;

    const todayPlanned = planned.filter(p => p.planned_date === today);
    const plannedTotal = todayPlanned.length;
    const plannedCompleted = todayPlanned.filter(p => p.completed).length;

    return {
      studyMinutes,
      targetMinutes,
      completionPercentage,
      vocabCount,
      grammarCount,
      plannedTotal,
      plannedCompleted,
    };
  }, [sessions, vocabulary, grammar, planned, profile]);

  // Derived: Overall Totals
  const totalStats = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const totalSessions = sessions.length;

    const totalVocab = vocabulary.length;
    const masteredVocab = vocabulary.filter(v => v.status === 'Mastered').length;
    const learningVocab = vocabulary.filter(v => v.status === 'Learning').length;

    const totalGrammar = grammar.length;
    const completedGrammar = grammar.filter(g => g.status === 'Completed').length;

    // Overall goal completion rate
    let completedGoals = 0;
    goals.forEach(g => {
      if (g.measurement_type === 'minutes') {
        const met = totalMinutes >= g.target_value;
        if (met) completedGoals++;
      } else if (g.measurement_type === 'words') {
        if (masteredVocab >= g.target_value) completedGoals++;
      } else if (g.measurement_type === 'topics') {
        if (completedGrammar >= g.target_value) completedGoals++;
      } else {
        completedGoals++;
      }
    });

    const overallGoalCompletionRate = goals.length > 0 
      ? Math.round((completedGoals / goals.length) * 100) 
      : 100;

    return {
      totalHours,
      totalMinutes,
      totalSessions,
      totalVocab,
      masteredVocab,
      learningVocab,
      totalGrammar,
      completedGrammar,
      overallGoalCompletionRate,
    };
  }, [sessions, vocabulary, grammar, goals]);

  // Derived: Real Insights
  const insights = useMemo(() => {
    return DataService.generateInsights(sessions, vocabulary, grammar, profile, streak);
  }, [sessions, vocabulary, grammar, profile, streak]);

  // Quote
  const quote = useMemo(() => {
    return getDailyQuote();
  }, []);

  // Actions
  const saveProfile = async (p: UserProfile) => {
    await DataService.upsertProfile(p);
    setProfile(p);
  };

  const addSession = async (s: Omit<StudySession, 'id'>) => {
    const created = await DataService.addSession(s);
    setSessions(prev => [created, ...prev]);
  };

  const updateSession = async (s: StudySession) => {
    const updated = await DataService.updateSession(s);
    setSessions(prev => prev.map(item => item.id === s.id ? updated : item));
  };

  const deleteSession = async (id: string) => {
    await DataService.deleteSession(id, userId);
    setSessions(prev => prev.filter(item => item.id !== id));
  };

  const addVocabulary = async (v: Omit<VocabularyItem, 'id'>) => {
    const created = await DataService.addVocabulary(v);
    setVocabulary(prev => [created, ...prev]);
  };

  const updateVocabulary = async (v: VocabularyItem) => {
    const updated = await DataService.updateVocabulary(v);
    setVocabulary(prev => prev.map(item => item.id === v.id ? updated : item));
  };

  const deleteVocabulary = async (id: string) => {
    await DataService.deleteVocabulary(id, userId);
    setVocabulary(prev => prev.filter(item => item.id !== id));
  };

  const addGrammar = async (g: Omit<GrammarTopic, 'id'>) => {
    const created = await DataService.addGrammar(g);
    setGrammar(prev => [created, ...prev]);
  };

  const updateGrammar = async (g: GrammarTopic) => {
    const updated = await DataService.updateGrammar(g);
    setGrammar(prev => prev.map(item => item.id === g.id ? updated : item));
  };

  const deleteGrammar = async (id: string) => {
    await DataService.deleteGrammar(id, userId);
    setGrammar(prev => prev.filter(item => item.id !== id));
  };

  const updateSkillProgress = async (sk: SkillProgress) => {
    const updated = await DataService.updateSkill(sk);
    setSkills(prev => {
      const exists = prev.some(item => item.skill === sk.skill);
      return exists ? prev.map(item => item.skill === sk.skill ? updated : item) : [...prev, updated];
    });
  };

  const addGoal = async (g: Omit<Goal, 'id'>) => {
    const created = await DataService.addGoal(g);
    setGoals(prev => [created, ...prev]);
  };

  const updateGoal = async (g: Goal) => {
    const updated = await DataService.updateGoal(g);
    setGoals(prev => prev.map(item => item.id === g.id ? updated : item));
  };

  const deleteGoal = async (id: string) => {
    await DataService.deleteGoal(id, userId);
    setGoals(prev => prev.filter(item => item.id !== id));
  };

  const addPlannedActivity = async (p: Omit<PlannedActivity, 'id'>) => {
    const created = await DataService.addPlanned(p);
    setPlanned(prev => [...prev, created]);
  };

  const updatePlannedActivity = async (p: PlannedActivity) => {
    const updated = await DataService.updatePlanned(p);
    setPlanned(prev => prev.map(item => item.id === p.id ? updated : item));
  };

  const deletePlannedActivity = async (id: string) => {
    await DataService.deletePlanned(id, userId);
    setPlanned(prev => prev.filter(item => item.id !== id));
  };

  const toggleActivityCompletion = async (id: string) => {
    const target = planned.find(p => p.id === id);
    if (!target) return;
    const completed = !target.completed;
    const updated = {
      ...target,
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
    };
    await updatePlannedActivity(updated);
  };

  const toggleRestDay = async (dateString: string, notes?: string) => {
    await DataService.toggleRestDay(dateString, userId, notes);
    const updatedDays = await DataService.getRestDays(userId);
    setRestDays(updatedDays);
  };

  const updateUserSettings = async (s: UserSettings) => {
    const updated = await DataService.updateSettings(s);
    setSettings(updated);
  };

  const loadSampleData = () => {
    LocalStore.loadSampleData(userId);
    refreshData();
  };

  const clearData = () => {
    LocalStore.clearAllData();
    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        sessions,
        vocabulary,
        grammar,
        skills,
        goals,
        planned,
        restDays,
        settings,
        loading,
        refreshData,
        saveProfile,
        addSession,
        updateSession,
        deleteSession,
        addVocabulary,
        updateVocabulary,
        deleteVocabulary,
        addGrammar,
        updateGrammar,
        deleteGrammar,
        updateSkillProgress,
        addGoal,
        updateGoal,
        deleteGoal,
        addPlannedActivity,
        updatePlannedActivity,
        deletePlannedActivity,
        toggleActivityCompletion,
        toggleRestDay,
        updateUserSettings,
        loadSampleData,
        clearData,
        streak,
        todayStats,
        totalStats,
        insights,
        quote,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
