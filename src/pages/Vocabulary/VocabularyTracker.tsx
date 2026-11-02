import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { VocabularyItem, Difficulty, VocabStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { ExportService } from '../../services/exportService';
import {
  Languages,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export const VocabularyTracker: React.FC = () => {
  const { user } = useAuth();
  const {
    vocabulary,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    profile,
  } = useData();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabularyItem | null>(null);

  // Form Fields
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [status, setStatus] = useState<VocabStatus>('Learning');
  const [dateAdded, setDateAdded] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Extract all existing unique categories
  const existingCategories = useMemo(() => {
    const set = new Set<string>(['General', 'Food & Dining', 'Travel', 'Verbs', 'Adjectives', 'Idioms', 'Business']);
    vocabulary.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [vocabulary]);

  // Filtered vocabulary list
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter((item) => {
      const matchSearch =
        item.word.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchCategory && matchDifficulty && matchStatus;
    });
  }, [vocabulary, search, categoryFilter, difficultyFilter, statusFilter]);

  // Automatically calculate statistics
  const totalWords = vocabulary.length;
  const learningWords = vocabulary.filter((v) => v.status === 'Learning').length;
  const masteredWords = vocabulary.filter((v) => v.status === 'Mastered').length;
  const notStartedWords = vocabulary.filter((v) => v.status === 'Not started').length;
  const completionPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  const openAddModal = () => {
    setEditingItem(null);
    setWord('');
    setCategory('General');
    setDifficulty('Medium');
    setStatus('Learning');
    setDateAdded(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: VocabularyItem) => {
    setEditingItem(item);
    setWord(item.word);
    setCategory(item.category);
    setDifficulty(item.difficulty);
    setStatus(item.status);
    setDateAdded(item.date_added);
    setNotes(item.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      setError('Please provide a word or phrase.');
      return;
    }

    if (editingItem) {
      await updateVocabulary({
        ...editingItem,
        word: word.trim(),
        category: category.trim() || 'General',
        difficulty,
        status,
        date_added: dateAdded,
        notes: notes.trim() || undefined,
      });
    } else {
      await addVocabulary({
        user_id: user?.id || 'demo-user',
        word: word.trim(),
        category: category.trim() || 'General',
        difficulty,
        status,
        date_added: dateAdded,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Vocabulary Tracker
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Manual catalog of terms, expressions, and phrases you are actively mastering.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => ExportService.exportVocabularyCSV(vocabulary, profile?.language || 'Language')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] hover:bg-[#EFE7DF] dark:bg-[#203128] dark:hover:bg-[#2A3F33] text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] shadow-xs"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Word
          </button>
        </div>
      </div>

      {/* Auto-Calculated Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Total Words Added
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalWords}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Currently Learning
          </span>
          <span className="text-2xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9]">
            {learningWords}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Words Mastered
          </span>
          <span className="text-2xl font-bold font-editorial text-emerald-700 dark:text-emerald-400">
            {masteredWords}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Mastery Rate
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {completionPercentage}%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search words, notes, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#766456] dark:text-[#9CB29F] absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Not started">Not started</option>
            <option value="Learning">Learning</option>
            <option value="Mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Vocabulary Cards / Grid */}
      {filteredVocabulary.length === 0 ? (
        <EmptyState
          icon={Languages}
          title="No vocabulary found"
          description="Manually record words encountered in your reading, listening, or conversation drills."
          actionText="Add New Word"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVocabulary.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs flex flex-col justify-between hover:shadow-subtle transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] leading-tight break-words">
                    {item.word}
                  </h3>
                  <Badge variant="status" value={item.status}>
                    {item.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <span className="text-xs text-[#766456] dark:text-[#9CB29F] font-medium px-2 py-0.5 rounded-md bg-[#F5EFE7] dark:bg-[#17251D]">
                    {item.category}
                  </span>
                  <Badge variant="difficulty" value={item.difficulty}>
                    {item.difficulty}
                  </Badge>
                </div>

                {item.notes && (
                  <p className="text-xs text-[#766456] dark:text-[#9CB29F] line-clamp-2 italic mb-3">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-[11px] text-[#766456] dark:text-[#9CB29F]">
                <span>Added: {item.date_added}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-md hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete word "${item.word}"?`)) {
                        deleteVocabulary(item.id);
                      }
                    }}
                    className="p-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vocabulary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Vocabulary' : 'Add Vocabulary Item'}
        subtitle="Catalog a word or expression to track your learning status."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Word or Phrase *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Imprescindible"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Connectors"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VocabStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="Not started">Not started</option>
                <option value="Learning">Learning</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Date Added
              </label>
              <input
                type="date"
                value={dateAdded}
                onChange={(e) => setDateAdded(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Personal Notes / Usage Context (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Essential / indispensable. Useful in C1 essays."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              {editingItem ? 'Update Word' : 'Save Vocabulary'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
