import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  UserProfile, 
  StudySession, 
  VocabularyItem, 
  GrammarTopic, 
  SkillProgress, 
  Goal 
} from '../types';

export class ExportService {
  // Helper to trigger browser file download
  private static downloadBlob(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ===================== CSV EXPORTS =====================
  static exportSessionsCSV(sessions: StudySession[], language: string = 'Language') {
    const headers = ['Date', 'Activity', 'Skill', 'Duration (mins)', 'Start Time', 'End Time', 'Notes'];
    const rows = sessions.map(s => [
      `"${s.study_date}"`,
      `"${(s.activity || '').replace(/"/g, '""')}"`,
      `"${s.skill}"`,
      s.duration_minutes,
      `"${s.start_time || ''}"`,
      `"${s.end_time || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadBlob(csv, `${language.toLowerCase()}_study_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  static exportVocabularyCSV(vocabulary: VocabularyItem[], language: string = 'Language') {
    const headers = ['Word', 'Category', 'Difficulty', 'Status', 'Date Added', 'Notes'];
    const rows = vocabulary.map(v => [
      `"${v.word.replace(/"/g, '""')}"`,
      `"${(v.category || 'General').replace(/"/g, '""')}"`,
      `"${v.difficulty}"`,
      `"${v.status}"`,
      `"${v.date_added}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadBlob(csv, `${language.toLowerCase()}_vocabulary_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  static exportGrammarCSV(grammar: GrammarTopic[], language: string = 'Language') {
    const headers = ['Topic', 'Category', 'Difficulty', 'Status', 'Date Added', 'Notes'];
    const rows = grammar.map(g => [
      `"${g.topic.replace(/"/g, '""')}"`,
      `"${(g.category || 'General').replace(/"/g, '""')}"`,
      `"${g.difficulty}"`,
      `"${g.status}"`,
      `"${g.date_added}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadBlob(csv, `${language.toLowerCase()}_grammar_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  static exportGoalsCSV(goals: Goal[], language: string = 'Language') {
    const headers = ['Goal Name', 'Type', 'Target Value', 'Unit', 'Frequency', 'Start Date', 'End Date', 'Active'];
    const rows = goals.map(g => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.goal_type}"`,
      g.target_value,
      `"${g.measurement_type}"`,
      `"${g.frequency}"`,
      `"${g.start_date}"`,
      `"${g.end_date || ''}"`,
      g.is_active ? 'Yes' : 'No'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadBlob(csv, `${language.toLowerCase()}_goals_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // ===================== PDF REPORT GENERATION =====================
  static generatePDFReport(params: {
    profile: UserProfile;
    sessions: StudySession[];
    vocabulary: VocabularyItem[];
    grammar: GrammarTopic[];
    skills: SkillProgress[];
    goals: Goal[];
    streak: { currentStreak: number; longestStreak: number; totalStudyDays: number };
    startDate?: string;
    endDate?: string;
  }) {
    const { profile, sessions, vocabulary, grammar, skills, goals, streak, startDate, endDate } = params;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Mocha / Forest warm header styling
    doc.setFillColor(117, 87, 68); // Mocha Primary #755744
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('LinguistLog — Progress Report', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 18, { align: 'right' });

    // Profile summary section
    let currentY = 38;
    doc.setTextColor(53, 40, 32); // Mocha text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Learner Profile: ${profile.name}`, 14, currentY);

    currentY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Target Language: ${profile.language} | Current Level: ${profile.current_level} -> Target: ${profile.target_level}`, 14, currentY);
    currentY += 5;
    doc.text(`Journey Start: ${profile.learning_start_date} | Scope: ${startDate || 'All Time'} to ${endDate || 'Present'}`, 14, currentY);

    // Summary Statistics Cards Table
    currentY += 8;
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const masteredVocab = vocabulary.filter(v => v.status === 'Mastered').length;
    const completedGrammar = grammar.filter(g => g.status === 'Completed').length;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: [200, 173, 150], textColor: [53, 40, 32], fontStyle: 'bold' },
      bodyStyles: { textColor: [53, 40, 32] },
      head: [['Total Hours', 'Total Sessions', 'Current Streak', 'Study Days', 'Mastered Vocab', 'Completed Grammar']],
      body: [[
        `${totalHours} hrs`,
        `${sessions.length}`,
        `${streak.currentStreak} days`,
        `${streak.totalStudyDays} days`,
        `${masteredVocab} / ${vocabulary.length}`,
        `${completedGrammar} / ${grammar.length}`
      ]],
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Four Skills Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Skill Proficiency Breakdown', 14, currentY);

    currentY += 4;
    const skillRows = skills.map(s => [
      s.skill,
      s.current_level,
      s.target_level,
      `${s.progress_percentage}%`,
      s.notes || '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [117, 87, 68], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [53, 40, 32], fontSize: 9 },
      head: [['Skill', 'Current CEFR', 'Target CEFR', 'Progress', 'Self-Assessment Notes']],
      body: skillRows.length > 0 ? skillRows : [['No skills recorded', '', '', '', '']],
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Recent Study Sessions Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Recent Study Sessions (Last ${Math.min(sessions.length, 12)})`, 14, currentY);

    currentY += 4;
    const recentSessions = sessions.slice(0, 12).map(s => [
      s.study_date,
      s.skill,
      s.activity,
      `${s.duration_minutes} min`,
      s.notes || '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [117, 87, 68], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [53, 40, 32], fontSize: 8 },
      head: [['Date', 'Skill', 'Activity', 'Duration', 'Notes']],
      body: recentSessions.length > 0 ? recentSessions : [['No sessions recorded', '', '', '', '']],
      margin: { left: 14, right: 14 }
    });

    // Check if we need page 2 for Vocabulary & Goals
    if ((doc as any).lastAutoTable.finalY > 210) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Active Goals Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Target Goals & Milestones', 14, currentY);

    currentY += 4;
    const goalRows = goals.map(g => [
      g.name,
      g.goal_type.toUpperCase(),
      `${g.target_value} ${g.measurement_type}`,
      g.frequency,
      g.is_active ? 'Active' : 'Archived'
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [117, 87, 68], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [53, 40, 32], fontSize: 9 },
      head: [['Goal', 'Scope', 'Target', 'Frequency', 'Status']],
      body: goalRows.length > 0 ? goalRows : [['No goals configured', '', '', '', '']],
      margin: { left: 14, right: 14 }
    });

    // Save PDF
    const filename = `${profile.language.toLowerCase()}_learning_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }
}
