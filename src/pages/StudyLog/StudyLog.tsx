import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { StudySession, SkillType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { AddSessionModal } from '../../components/modals/AddSessionModal';
import { Modal } from '../../components/common/Modal';
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { ExportService } from '../../services/exportService';

export const StudyLog: React.FC = () => {
  const { sessions, deleteSession, profile } = useData();

  // Search and Filters
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [viewingSession, setViewingSession] = useState<StudySession | null>(null);

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        const matchesSearch =
          s.activity.toLowerCase().includes(search.toLowerCase()) ||
          (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));
        const matchesSkill = selectedSkill === 'all' || s.skill === selectedSkill;
        const matchesDate = !dateFilter || s.study_date === dateFilter;
        return matchesSearch && matchesSkill && matchesDate;
      })
      .sort((a, b) => {
        return sortOrder === 'desc'
          ? b.study_date.localeCompare(a.study_date)
          : a.study_date.localeCompare(b.study_date);
      });
  }, [sessions, search, selectedSkill, dateFilter, sortOrder]);

  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Study Log
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Complete historical record of all your manual language immersion sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => ExportService.exportSessionsCSV(sessions, profile?.language || 'Language')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] hover:bg-[#EFE7DF] dark:bg-[#203128] dark:hover:bg-[#2A3F33] text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] shadow-xs transition-colors"
            title="Download CSV file of all study sessions"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingSession(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search activities, keywords, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#766456] dark:text-[#9CB29F] absolute left-3 top-2.5" />
        </div>

        {/* Skill filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          >
            <option value="all">All Skills</option>
            <option value="Reading">Reading</option>
            <option value="Listening">Listening</option>
            <option value="Speaking">Speaking</option>
            <option value="Writing">Writing</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Grammar">Grammar</option>
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-[#755744] dark:text-[#A7BDA9] hover:underline px-1"
            >
              Clear date
            </button>
          )}

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs font-semibold hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
            title={`Sort ${sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center justify-between text-xs text-[#766456] dark:text-[#9CB29F] px-2">
        <span>
          Showing <strong>{filteredSessions.length}</strong> recorded sessions
        </span>
        <span>
          Total immersion time:{' '}
          <strong className="text-[#352820] dark:text-[#E8F0E8]">
            {(totalMinutes / 60).toFixed(1)} hrs ({totalMinutes} mins)
          </strong>
        </span>
      </div>

      {/* Sessions Table / List */}
      <div className="rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={BookOpenCheck}
              title="No study sessions found"
              description="Log your daily reading, speaking, listening, or vocabulary practice."
              actionText="Record Session"
              onAction={() => {
                setEditingSession(null);
                setIsAddModalOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5EFE7]/80 dark:bg-[#17251D] border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 text-[11px] font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4">Skill</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 hidden md:table-cell">Time Slot</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D7CC]/50 dark:divide-[#2C4236]/50">
                {filteredSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#EFE7DF]/40 dark:hover:bg-[#2A3F33]/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#352820] dark:text-[#E8F0E8] whitespace-nowrap">
                      {s.study_date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="skill" value={s.skill}>
                        {s.skill}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#352820] dark:text-[#E8F0E8]">
                      {s.activity}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#755744] dark:text-[#A7BDA9]">
                      {s.duration_minutes} min
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-[#766456] dark:text-[#9CB29F] whitespace-nowrap">
                      {s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-[#766456] dark:text-[#9CB29F] max-w-xs truncate">
                      {s.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSession(s)}
                          className="p-1.5 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSession(s);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
                          title="Edit session"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this study session? This will update your streak and analytics.')) {
                              deleteSession(s.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Session Modal */}
      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSession(null);
        }}
        initialSession={editingSession}
      />

      {/* Session Details Modal */}
      {viewingSession && (
        <Modal
          isOpen={Boolean(viewingSession)}
          onClose={() => setViewingSession(null)}
          title="Session Details"
          subtitle={`Recorded for ${viewingSession.study_date}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4D7CC] dark:border-[#2C4236]">
              <div>
                <span className="text-xs uppercase text-[#766456] dark:text-[#9CB29F]">
                  Skill Category
                </span>
                <div className="mt-1">
                  <Badge variant="skill" value={viewingSession.skill}>
                    {viewingSession.skill}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase text-[#766456] dark:text-[#9CB29F]">
                  Recorded Duration
                </span>
                <span className="text-xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9] block">
                  {viewingSession.duration_minutes} min
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
                Activity
              </span>
              <p className="text-base font-semibold text-[#352820] dark:text-[#E8F0E8]">
                {viewingSession.activity}
              </p>
            </div>

            {viewingSession.start_time && viewingSession.end_time && (
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
                  Time Slot
                </span>
                <p className="text-sm text-[#352820] dark:text-[#E8F0E8]">
                  {viewingSession.start_time} to {viewingSession.end_time}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
                Reflection Notes
              </span>
              <p className="text-sm text-[#352820] dark:text-[#E8F0E8] whitespace-pre-wrap bg-[#F5EFE7]/60 dark:bg-[#17251D] p-3.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236]">
                {viewingSession.notes || 'No notes entered for this session.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingSession(null)}
                className="px-4 py-2 rounded-xl bg-[#755744] dark:bg-[#3F6650] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
