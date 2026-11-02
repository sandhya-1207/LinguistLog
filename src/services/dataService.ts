import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LocalStore } from './storageService';
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
  CoreSkill
} from '../types';
import { 
  parseISO, 
  differenceInCalendarDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  format 
} from 'date-fns';

export class DataService {
  private static useSupabase(userId?: string): boolean {
    return isSupabaseConfigured && Boolean(userId && userId !== 'demo-user');
  }

  // ===================== PROFILE =====================
  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        return LocalStore.getProfile();
      }
      return data;
    }
    return LocalStore.getProfile();
  }

  static async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    if (this.useSupabase(profile.id)) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting profile in Supabase:', error);
        LocalStore.setProfile(profile);
        return profile;
      }
      return data;
    }
    LocalStore.setProfile(profile);
    return profile;
  }

  // ===================== STUDY SESSIONS =====================
  static async getSessions(userId: string): Promise<StudySession[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('study_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return LocalStore.getSessions();
      }
      return data || [];
    }
    const all = LocalStore.getSessions();
    return all.sort((a, b) => b.study_date.localeCompare(a.study_date));
  }

  static async addSession(session: Omit<StudySession, 'id'> & { id?: string }): Promise<StudySession> {
    const newSession: StudySession = {
      ...session,
      id: session.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess-' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (this.useSupabase(session.user_id)) {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) {
        console.error('Error adding session to Supabase:', error);
        const current = LocalStore.getSessions();
        LocalStore.setSessions([newSession, ...current]);
        return newSession;
      }
      return data;
    }

    const current = LocalStore.getSessions();
    LocalStore.setSessions([newSession, ...current]);
    return newSession;
  }

  static async updateSession(session: StudySession): Promise<StudySession> {
    if (this.useSupabase(session.user_id)) {
      const { data, error } = await supabase
        .from('study_sessions')
        .update(session)
        .eq('id', session.id)
        .eq('user_id', session.user_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating session:', error);
      } else if (data) {
        return data;
      }
    }

    const current = LocalStore.getSessions();
    const updated = current.map(s => s.id === session.id ? session : s);
    LocalStore.setSessions(updated);
    return session;
  }

  static async deleteSession(id: string, userId: string): Promise<boolean> {
    if (this.useSupabase(userId)) {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) console.error('Error deleting session:', error);
    }

    const current = LocalStore.getSessions();
    LocalStore.setSessions(current.filter(s => s.id !== id));
    return true;
  }

  // ===================== VOCABULARY =====================
  static async getVocabulary(userId: string): Promise<VocabularyItem[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching vocabulary:', error);
        return LocalStore.getVocabulary();
      }
      return data || [];
    }
    return LocalStore.getVocabulary().sort((a, b) => b.date_added.localeCompare(a.date_added));
  }

  static async addVocabulary(vocab: Omit<VocabularyItem, 'id'> & { id?: string }): Promise<VocabularyItem> {
    const item: VocabularyItem = {
      ...vocab,
      id: vocab.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'vocab-' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (this.useSupabase(vocab.user_id)) {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('Error adding vocabulary to Supabase:', error);
        const current = LocalStore.getVocabulary();
        LocalStore.setVocabulary([item, ...current]);
        return item;
      }
      return data;
    }

    const current = LocalStore.getVocabulary();
    LocalStore.setVocabulary([item, ...current]);
    return item;
  }

  static async updateVocabulary(vocab: VocabularyItem): Promise<VocabularyItem> {
    if (this.useSupabase(vocab.user_id)) {
      const { data, error } = await supabase
        .from('vocabulary')
        .update(vocab)
        .eq('id', vocab.id)
        .eq('user_id', vocab.user_id)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getVocabulary();
    const updated = current.map(v => v.id === vocab.id ? vocab : v);
    LocalStore.setVocabulary(updated);
    return vocab;
  }

  static async deleteVocabulary(id: string, userId: string): Promise<boolean> {
    if (this.useSupabase(userId)) {
      await supabase.from('vocabulary').delete().eq('id', id).eq('user_id', userId);
    }
    const current = LocalStore.getVocabulary();
    LocalStore.setVocabulary(current.filter(v => v.id !== id));
    return true;
  }

  // ===================== GRAMMAR =====================
  static async getGrammar(userId: string): Promise<GrammarTopic[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('grammar_topics')
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) {
        console.error('Error fetching grammar:', error);
        return LocalStore.getGrammar();
      }
      return data || [];
    }
    return LocalStore.getGrammar().sort((a, b) => b.date_added.localeCompare(a.date_added));
  }

  static async addGrammar(topic: Omit<GrammarTopic, 'id'> & { id?: string }): Promise<GrammarTopic> {
    const item: GrammarTopic = {
      ...topic,
      id: topic.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'gram-' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (this.useSupabase(topic.user_id)) {
      const { data, error } = await supabase
        .from('grammar_topics')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('Error adding grammar:', error);
        const current = LocalStore.getGrammar();
        LocalStore.setGrammar([item, ...current]);
        return item;
      }
      return data;
    }

    const current = LocalStore.getGrammar();
    LocalStore.setGrammar([item, ...current]);
    return item;
  }

  static async updateGrammar(topic: GrammarTopic): Promise<GrammarTopic> {
    if (this.useSupabase(topic.user_id)) {
      const { data, error } = await supabase
        .from('grammar_topics')
        .update(topic)
        .eq('id', topic.id)
        .eq('user_id', topic.user_id)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getGrammar();
    const updated = current.map(g => g.id === topic.id ? topic : g);
    LocalStore.setGrammar(updated);
    return topic;
  }

  static async deleteGrammar(id: string, userId: string): Promise<boolean> {
    if (this.useSupabase(userId)) {
      await supabase.from('grammar_topics').delete().eq('id', id).eq('user_id', userId);
    }
    const current = LocalStore.getGrammar();
    LocalStore.setGrammar(current.filter(g => g.id !== id));
    return true;
  }

  // ===================== SKILL PROGRESS =====================
  static async getSkills(userId: string): Promise<SkillProgress[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching skills:', error);
        return LocalStore.getSkills();
      }
      return data || [];
    }
    return LocalStore.getSkills();
  }

  static async updateSkill(skill: SkillProgress): Promise<SkillProgress> {
    const updatedItem = {
      ...skill,
      updated_at: new Date().toISOString()
    };

    if (this.useSupabase(skill.user_id)) {
      const { data, error } = await supabase
        .from('skill_progress')
        .upsert(updatedItem)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getSkills();
    const exists = current.some(s => s.skill === skill.skill);
    const updated = exists 
      ? current.map(s => s.skill === skill.skill ? updatedItem : s)
      : [...current, updatedItem];
    LocalStore.setSkills(updated);
    return updatedItem;
  }

  // ===================== GOALS =====================
  static async getGoals(userId: string): Promise<Goal[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }
    return LocalStore.getGoals();
  }

  static async addGoal(goal: Omit<Goal, 'id'> & { id?: string }): Promise<Goal> {
    const item: Goal = {
      ...goal,
      id: goal.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'goal-' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (this.useSupabase(goal.user_id)) {
      const { data, error } = await supabase
        .from('goals')
        .insert(item)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getGoals();
    LocalStore.setGoals([item, ...current]);
    return item;
  }

  static async updateGoal(goal: Goal): Promise<Goal> {
    if (this.useSupabase(goal.user_id)) {
      const { data, error } = await supabase
        .from('goals')
        .update(goal)
        .eq('id', goal.id)
        .eq('user_id', goal.user_id)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getGoals();
    const updated = current.map(g => g.id === goal.id ? goal : g);
    LocalStore.setGoals(updated);
    return goal;
  }

  static async deleteGoal(id: string, userId: string): Promise<boolean> {
    if (this.useSupabase(userId)) {
      await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
    }
    const current = LocalStore.getGoals();
    LocalStore.setGoals(current.filter(g => g.id !== id));
    return true;
  }

  // ===================== PLANNED ACTIVITIES =====================
  static async getPlanned(userId: string): Promise<PlannedActivity[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('planned_activities')
        .select('*')
        .eq('user_id', userId)
        .order('planned_date', { ascending: true });

      if (!error && data) return data;
    }
    return LocalStore.getPlanned();
  }

  static async addPlanned(activity: Omit<PlannedActivity, 'id'> & { id?: string }): Promise<PlannedActivity> {
    const item: PlannedActivity = {
      ...activity,
      id: activity.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'plan-' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (this.useSupabase(activity.user_id)) {
      const { data, error } = await supabase
        .from('planned_activities')
        .insert(item)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getPlanned();
    LocalStore.setPlanned([...current, item]);
    return item;
  }

  static async updatePlanned(activity: PlannedActivity): Promise<PlannedActivity> {
    if (this.useSupabase(activity.user_id)) {
      const { data, error } = await supabase
        .from('planned_activities')
        .update(activity)
        .eq('id', activity.id)
        .eq('user_id', activity.user_id)
        .select()
        .single();

      if (!error && data) return data;
    }

    const current = LocalStore.getPlanned();
    const updated = current.map(p => p.id === activity.id ? activity : p);
    LocalStore.setPlanned(updated);
    return activity;
  }

  static async deletePlanned(id: string, userId: string): Promise<boolean> {
    if (this.useSupabase(userId)) {
      await supabase.from('planned_activities').delete().eq('id', id).eq('user_id', userId);
    }
    const current = LocalStore.getPlanned();
    LocalStore.setPlanned(current.filter(p => p.id !== id));
    return true;
  }

  // ===================== REST DAYS =====================
  static async getRestDays(userId: string): Promise<RestDay[]> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('rest_days')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) return data;
    }
    return LocalStore.getRestDays();
  }

  static async toggleRestDay(dateString: string, userId: string, notes?: string): Promise<boolean> {
    const current = await this.getRestDays(userId);
    const existing = current.find(r => r.rest_date === dateString);

    if (existing) {
      if (this.useSupabase(userId)) {
        await supabase.from('rest_days').delete().eq('id', existing.id).eq('user_id', userId);
      }
      LocalStore.setRestDays(current.filter(r => r.rest_date !== dateString));
      return false; // removed
    } else {
      const newItem: RestDay = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rest-' + Date.now()),
        user_id: userId,
        rest_date: dateString,
        notes: notes || 'Planned rest day',
        created_at: new Date().toISOString()
      };
      if (this.useSupabase(userId)) {
        await supabase.from('rest_days').insert(newItem);
      }
      LocalStore.setRestDays([...current, newItem]);
      return true; // added
    }
  }

  // ===================== SETTINGS =====================
  static async getSettings(userId: string): Promise<UserSettings | null> {
    if (this.useSupabase(userId)) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) return data;
    }
    return LocalStore.getSettings();
  }

  static async updateSettings(settings: UserSettings): Promise<UserSettings> {
    if (this.useSupabase(settings.user_id)) {
      const { data, error } = await supabase
        .from('settings')
        .upsert(settings)
        .select()
        .single();

      if (!error && data) return data;
    }
    LocalStore.setSettings(settings);
    return settings;
  }

  // ===================== STREAK SYSTEM =====================
  // Rest days pause the streak without breaking it!
  static calculateStreak(sessions: StudySession[], restDays: RestDay[]): {
    currentStreak: number;
    longestStreak: number;
    totalStudyDays: number;
    streakDates: string[];
    isStudiedToday: boolean;
  } {
    // Unique study dates where duration > 0
    const studyDateSet = new Set<string>();
    sessions.forEach(s => {
      if (s.duration_minutes > 0) {
        studyDateSet.add(s.study_date);
      }
    });

    const restDateSet = new Set(restDays.map(r => r.rest_date));
    const totalStudyDays = studyDateSet.size;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const isStudiedToday = studyDateSet.has(todayStr);

    // Current streak calculation walking back from today (or yesterday if haven't studied yet today)
    let currentStreak = 0;
    const streakDates: string[] = [];

    let checkDate = new Date();
    // If today is not studied and not rest day, start checking from yesterday to see if active streak extends to today
    if (!studyDateSet.has(todayStr) && !restDateSet.has(todayStr)) {
      checkDate = subDays(new Date(), 1);
    }

    let iterations = 0;
    while (iterations < 730) { // check up to 2 years back
      const dStr = format(checkDate, 'yyyy-MM-dd');
      if (studyDateSet.has(dStr)) {
        currentStreak++;
        streakDates.push(dStr);
        checkDate = subDays(checkDate, 1);
      } else if (restDateSet.has(dStr)) {
        // Rest day pauses streak! Don't increment streak count, but don't break the streak!
        checkDate = subDays(checkDate, 1);
      } else {
        // Streak ended
        break;
      }
      iterations++;
    }

    // Longest streak calculation across all time
    // Create sorted list of all unique dates between earliest date and today
    let longestStreak = 0;
    if (studyDateSet.size > 0) {
      const sortedDates = Array.from(studyDateSet).sort();
      let tempStreak = 0;
      let walk = parseISO(sortedDates[0]);
      const end = new Date();

      while (differenceInCalendarDays(end, walk) >= 0) {
        const dStr = format(walk, 'yyyy-MM-dd');
        if (studyDateSet.has(dStr)) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else if (restDateSet.has(dStr)) {
          // Pause, streak intact
        } else {
          tempStreak = 0;
        }
        walk = new Date(walk.getTime() + 86400000);
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return {
      currentStreak,
      longestStreak,
      totalStudyDays,
      streakDates,
      isStudiedToday,
    };
  }

  // ===================== REAL PERSONALIZED INSIGHTS =====================
  static generateInsights(
    sessions: StudySession[],
    vocabulary: VocabularyItem[],
    grammar: GrammarTopic[],
    profile: UserProfile | null,
    streakInfo: { currentStreak: number; longestStreak: number }
  ): LearningInsight[] {
    const insights: LearningInsight[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    // 1. Weekly study hours calculation
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weeklySessions = sessions.filter(s => {
      const d = parseISO(s.study_date);
      return isWithinInterval(d, { start: thisWeekStart, end: thisWeekEnd });
    });

    const weeklyMinutes = weeklySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const weeklyHours = (weeklyMinutes / 60).toFixed(1);

    if (weeklyMinutes > 0) {
      insights.push({
        id: 'ins-weekly-time',
        type: 'achievement',
        title: 'Weekly Commitment',
        message: `You have dedicated ${weeklyHours} hours to learning this week across ${weeklySessions.length} sessions.`,
        metric: `${weeklyHours} hrs`
      });
    }

    // 2. Most practiced skill
    const skillMap: Record<string, number> = {};
    sessions.forEach(s => {
      skillMap[s.skill] = (skillMap[s.skill] || 0) + s.duration_minutes;
    });

    let topSkill = '';
    let maxSkillMinutes = 0;
    Object.entries(skillMap).forEach(([skill, mins]) => {
      if (mins > maxSkillMinutes) {
        maxSkillMinutes = mins;
        topSkill = skill;
      }
    });

    if (topSkill) {
      const topSkillHours = (maxSkillMinutes / 60).toFixed(1);
      insights.push({
        id: 'ins-top-skill',
        type: 'progress',
        title: 'Primary Focus',
        message: `${topSkill} has been your most practiced focus, totaling ${topSkillHours} hours of immersion.`,
        metric: topSkill
      });
    }

    // 3. Vocabulary goal & progress
    const masteredCount = vocabulary.filter(v => v.status === 'Mastered').length;
    const learningCount = vocabulary.filter(v => v.status === 'Learning').length;
    const todayVocab = vocabulary.filter(v => v.date_added === today).length;

    if (profile?.daily_vocab_goal) {
      if (todayVocab >= profile.daily_vocab_goal) {
        insights.push({
          id: 'ins-vocab-goal-met',
          type: 'achievement',
          title: 'Daily Vocab Target Reached',
          message: `You added ${todayVocab} words today, achieving your daily target of ${profile.daily_vocab_goal}!`,
          metric: `${todayVocab}/${profile.daily_vocab_goal}`
        });
      } else {
        const remaining = profile.daily_vocab_goal - todayVocab;
        insights.push({
          id: 'ins-vocab-goal-rem',
          type: 'tip',
          title: 'Vocabulary Milestone',
          message: `You are only ${remaining} word${remaining > 1 ? 's' : ''} away from completing your daily target.`,
          metric: `${remaining} remaining`
        });
      }
    }

    // 4. Streak insight
    if (streakInfo.currentStreak >= 3) {
      insights.push({
        id: 'ins-streak',
        type: 'achievement',
        title: 'Momentum Unlocked',
        message: `Outstanding consistency! You are on a ${streakInfo.currentStreak}-day learning streak.`,
        metric: `${streakInfo.currentStreak} days`
      });
    }

    // 5. Grammar milestone
    const completedGrammar = grammar.filter(g => g.status === 'Completed').length;
    if (grammar.length > 0) {
      const grammarPct = Math.round((completedGrammar / grammar.length) * 100);
      insights.push({
        id: 'ins-grammar-pct',
        type: 'progress',
        title: 'Grammar Synthesis',
        message: `You have completed ${completedGrammar} of ${grammar.length} tracked grammar topics (${grammarPct}% completion rate).`,
        metric: `${grammarPct}%`
      });
    }

    return insights;
  }
}
