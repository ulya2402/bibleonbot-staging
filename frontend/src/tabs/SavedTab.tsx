import { useState, useMemo, useRef, useEffect } from 'react';
import { parseLabels, getLabelMeta } from '../types/bible';

const API_URL = 'https://bibleonbot-backend-staging.rchtxtdev.workers.dev/api';

export default function SavedTab({ savedVerses = [], fetchSaved, onNavigateToVerse }: any) {
  const [viewMode, setViewMode] = useState<'activity' | 'notes' | 'highlights' | 'labels'>('activity');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'book'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);

  const sortRef = useRef<HTMLDivElement | null>(null);

  const SORT_OPTIONS: { id: 'newest' | 'oldest' | 'book'; label: string; icon: string }[] = [
    { id: 'newest', label: 'Terbaru', icon: 'ph-bold ph-clock-counter-clockwise' },
    { id: 'oldest', label: 'Terlama', icon: 'ph-bold ph-clock' },
    { id: 'book', label: 'Kitab (A-Z)', icon: 'ph-bold ph-book-bookmark' },
  ];

  const COLOR_MAP: Record<string, { name: string; text: string; bg: string }> = {
    'yellow': { name: 'Kuning', text: 'bg-amber-100/90 dark:bg-[#3D3319] text-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-amber-400' },
    'green': { name: 'Hijau', text: 'bg-emerald-100/90 dark:bg-[#1E382B] text-emerald-950 dark:text-[#74C69D] px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-emerald-400' },
    'blue': { name: 'Biru', text: 'bg-sky-100/90 dark:bg-[#1C3342] text-sky-950 dark:text-sky-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-sky-400' },
    'pink': { name: 'Merah Muda', text: 'bg-rose-100/90 dark:bg-[#3D1E26] text-rose-950 dark:text-rose-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-rose-400' },
    'purple': { name: 'Ungu', text: 'bg-purple-100/90 dark:bg-[#32203D] text-purple-950 dark:text-purple-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-purple-400' },
    'orange': { name: 'Oranye', text: 'bg-orange-100/90 dark:bg-[#3D2617] text-orange-950 dark:text-orange-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-orange-400' },
    'teal': { name: 'Tosika', text: 'bg-teal-100/90 dark:bg-[#163833] text-teal-950 dark:text-teal-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-teal-400' },
    'indigo': { name: 'Nila', text: 'bg-indigo-100/90 dark:bg-[#202742] text-indigo-950 dark:text-indigo-200 px-1.5 py-0.5 rounded-md box-decoration-clone', bg: 'bg-indigo-400' },
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Baru saja';
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return 'Baru saja';
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m lalu`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}j lalu`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays}h lalu`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    } catch (e) {
      return 'Baru saja';
    }
  };

  const removeSavedVerseGroup = (ids: number[]) => {
    const tg = (window as any).Telegram?.WebApp;
    const executeDelete = async () => {
      setDeletingId(ids[0]);
      setTimeout(async () => {
        setHiddenIds(prev => [...prev, ...ids]);
        try {
          await Promise.all(ids.map(id => fetch(`${API_URL}/saved-verses?id=${id}&t=${Date.now()}`, { method: 'DELETE' })));
          fetchSaved();
        } catch (e) {
          console.error('Delete saved verse error:', e);
          setHiddenIds(prev => prev.filter(hid => !ids.includes(hid)));
        }
        setDeletingId(null);
      }, 200);
    };

    if (tg && typeof tg.showConfirm === 'function') {
      tg.showConfirm(ids.length > 1 ? `Hapus ${ids.length} ayat ini dari daftar?` : 'Hapus ayat ini dari daftar?', (confirmed: boolean) => {
        if (confirmed) executeDelete();
      });
    } else {
      if (confirm(ids.length > 1 ? `Hapus ${ids.length} ayat ini dari daftar?` : 'Hapus ayat ini dari daftar?')) {
        executeDelete();
      }
    }
  };

  const filteredVerses = useMemo(() => {
    const visibleItems = savedVerses.filter((v: any) => 
      !hiddenIds.includes(v.id) && 
      (Boolean(v.color && v.color.trim() !== '') || Boolean(v.note && v.note.trim() !== '') || Boolean(v.labels && v.labels.trim() !== ''))
    );

    let tabItems = visibleItems;
    if (viewMode === 'notes') {
      tabItems = visibleItems.filter((v: any) => v.note && v.note.trim() !== '');
    } else if (viewMode === 'highlights') {
      tabItems = visibleItems.filter((v: any) => v.color && v.color.trim() !== '');
    } else if (viewMode === 'labels') {
      tabItems = visibleItems.filter((v: any) => v.labels && v.labels.trim() !== '');
    }

    if (colorFilter !== 'all') {
      tabItems = tabItems.filter((v: any) => v.color === colorFilter);
    }

    if (labelFilter !== 'all') {
      tabItems = tabItems.filter((v: any) => parseLabels(v.labels).includes(labelFilter));
    }

    if (timeFilter !== 'all') {
      const now = Date.now();
      tabItems = tabItems.filter((v: any) => {
        if (!v.created_at) return true;
        const itemDate = new Date(v.created_at.includes('T') ? v.created_at : v.created_at.replace(' ', 'T') + 'Z').getTime();
        if (isNaN(itemDate)) return true;
        const diffHours = (now - itemDate) / (1000 * 60 * 60);

        if (timeFilter === 'today') return diffHours <= 24;
        if (timeFilter === 'week') return diffHours <= 24 * 7;
        if (timeFilter === 'month') return diffHours <= 24 * 30;
        return true;
      });
    }

    const sortedItems = [...tabItems].sort((a: any, b: any) => {
      if (sortBy === 'newest') {
        const timeA = a.created_at ? new Date(a.created_at.includes('T') ? a.created_at : a.created_at.replace(' ', 'T') + 'Z').getTime() : a.id;
        const timeB = b.created_at ? new Date(b.created_at.includes('T') ? b.created_at : b.created_at.replace(' ', 'T') + 'Z').getTime() : b.id;
        return (timeB || 0) - (timeA || 0);
      }
      if (sortBy === 'oldest') {
        const timeA = a.created_at ? new Date(a.created_at.includes('T') ? a.created_at : a.created_at.replace(' ', 'T') + 'Z').getTime() : a.id;
        const timeB = b.created_at ? new Date(b.created_at.includes('T') ? b.created_at : b.created_at.replace(' ', 'T') + 'Z').getTime() : b.id;
        return (timeA || 0) - (timeB || 0);
      }
      if (sortBy === 'book') {
        const comp = String(a.book).localeCompare(String(b.book));
        if (comp !== 0) return comp;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      }
      return 0;
    });

    const groups: any[] = [];
    sortedItems.forEach((item) => {
      if (groups.length === 0) {
        groups.push({
          ...item,
          verseRange: [item.verse],
          groupedIds: [item.id],
          combinedContent: [{ v: item.verse, text: item.content }]
        });
        return;
      }

      const lastGroup = groups[groups.length - 1];
      const timeDiff = Math.abs(new Date(item.created_at || 0).getTime() - new Date(lastGroup.created_at || 0).getTime());
      
      const isSameBatch = 
        item.book === lastGroup.book &&
        item.chapter === lastGroup.chapter &&
        item.color === lastGroup.color &&
        item.note === lastGroup.note &&
        (item.version || 'AYT') === (lastGroup.version || 'AYT') &&
        (timeDiff < 5000 || sortBy === 'book'); 

      if (isSameBatch) {
        if (!lastGroup.verseRange.includes(item.verse)) {
          lastGroup.verseRange.push(item.verse);
          lastGroup.groupedIds.push(item.id);
          lastGroup.combinedContent.push({ v: item.verse, text: item.content });
          
          lastGroup.verseRange.sort((a: number, b: number) => a - b);
          lastGroup.combinedContent.sort((a: any, b: any) => a.v - b.v);
        }
      } else {
        groups.push({
          ...item,
          verseRange: [item.verse],
          groupedIds: [item.id],
          combinedContent: [{ v: item.verse, text: item.content }]
        });
      }
    });

    return groups.map(g => {
      const ranges = [];
      let start = g.verseRange[0];
      let end = start;
      for (let i = 1; i < g.verseRange.length; i++) {
        if (g.verseRange[i] === end + 1) {
          end = g.verseRange[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = g.verseRange[i];
          end = start;
        }
      }
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      
      return { ...g, displayVerse: ranges.join(', ') };
    });
  }, [savedVerses, hiddenIds, viewMode, colorFilter, timeFilter, sortBy]);

  const totalNotesCount = useMemo(() => savedVerses.filter((v: any) => v.note && v.note.trim() !== '' && !hiddenIds.includes(v.id)).length, [savedVerses, hiddenIds]);
  const totalHighlightsCount = useMemo(() => savedVerses.filter((v: any) => v.color && v.color.trim() !== '' && !hiddenIds.includes(v.id)).length, [savedVerses, hiddenIds]);
  const totalLabelsCount = useMemo(() => savedVerses.filter((v: any) => v.labels && v.labels.trim() !== '' && !hiddenIds.includes(v.id)).length, [savedVerses, hiddenIds]);

  const hasActiveFilter = timeFilter !== 'all' || colorFilter !== 'all' || labelFilter !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setTimeFilter('all');
    setColorFilter('all');
    setLabelFilter('all');
    setSortBy('newest');
  };

  const currentSortObj = SORT_OPTIONS.find(s => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="animate-fadeIn px-5 pt-4 pb-12 select-none relative">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Tersimpan</h2>
          <p className="text-[13px] text-gray-400 dark:text-[#8D9F94] font-medium mt-0.5">Koleksi ayat dan catatan pribadi Anda</p>
        </div>
        <button
          onClick={() => setIsFilterOpen(prev => !prev)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 border ${
            isFilterOpen || hasActiveFilter
              ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D] shadow-sm'
              : 'bg-white dark:bg-[#1E2A23] text-gray-700 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] shadow-2xs hover:bg-gray-50 dark:hover:bg-[#26372D]'
          }`}
          title="Filter"
        >
          <i className="ph-bold ph-sliders-horizontal text-base"></i>
        </button>
      </div>

      <div className="flex bg-[#f0f2f5] dark:bg-[#1E2A23] p-1 rounded-2xl mb-4 border border-gray-200/40 dark:border-[#2E3F34]">
        <button
          onClick={() => setViewMode('activity')}
          className={`flex-1 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-colors duration-150 border ${
            viewMode === 'activity' 
              ? 'bg-white dark:bg-[#26372D] text-gray-900 dark:text-[#E3ECE6] shadow-2xs border-gray-200/70 dark:border-[#2E3F34]' 
              : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-700 dark:hover:text-[#E3ECE6] border-transparent'
          }`}
        >
          Aktivitas
        </button>
        <button
          onClick={() => setViewMode('notes')}
          className={`flex-1 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-colors duration-150 border ${
            viewMode === 'notes' 
              ? 'bg-white dark:bg-[#26372D] text-gray-900 dark:text-[#E3ECE6] shadow-2xs border-gray-200/70 dark:border-[#2E3F34]' 
              : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-700 dark:hover:text-[#E3ECE6] border-transparent'
          }`}
        >
          Catatan ({totalNotesCount})
        </button>
        <button
          onClick={() => setViewMode('highlights')}
          className={`flex-1 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-colors duration-150 border ${
            viewMode === 'highlights' 
              ? 'bg-white dark:bg-[#26372D] text-gray-900 dark:text-[#E3ECE6] shadow-2xs border-gray-200/70 dark:border-[#2E3F34]' 
              : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-700 dark:hover:text-[#E3ECE6] border-transparent'
          }`}
        >
          Sorotan ({totalHighlightsCount})
        </button>
        <button
          onClick={() => setViewMode('labels')}
          className={`flex-1 py-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-colors duration-150 border ${
            viewMode === 'labels' 
              ? 'bg-white dark:bg-[#26372D] text-gray-900 dark:text-[#E3ECE6] shadow-2xs border-gray-200/70 dark:border-[#2E3F34]' 
              : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-700 dark:hover:text-[#E3ECE6] border-transparent'
          }`}
        >
          Label ({totalLabelsCount})
        </button>
      </div>

      {isFilterOpen && (
        <div className="bg-white dark:bg-[#1E2A23] border border-gray-200/90 dark:border-[#2E3F34] rounded-2xl p-3.5 mb-5 shadow-lg space-y-3 relative z-30 animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap border ${
                  timeFilter === 'all'
                    ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D]'
                    : 'bg-white dark:bg-[#17211C] text-gray-600 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap border ${
                  timeFilter === 'today'
                    ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D]'
                    : 'bg-white dark:bg-[#17211C] text-gray-600 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap border ${
                  timeFilter === 'week'
                    ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D]'
                    : 'bg-white dark:bg-[#17211C] text-gray-600 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 whitespace-nowrap border ${
                  timeFilter === 'month'
                    ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D]'
                    : 'bg-white dark:bg-[#17211C] text-gray-600 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                }`}
              >
                Bulan Ini
              </button>
            </div>

           <div className="relative shrink-0" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(prev => !prev)}
                className="flex items-center gap-1.5 bg-white dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D] px-3 py-1 rounded-xl text-[11px] font-bold text-gray-600 dark:text-[#8D9F94] transition active:scale-95 shadow-2xs"
              >
                <i className={currentSortObj.icon}></i>
                <span>{currentSortObj.label}</span>
                <i className={`ph-bold ph-caret-down text-[10px] text-gray-400 dark:text-[#8D9F94] transition-transform ${isSortOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#1E2A23] border border-gray-200 dark:border-[#2E3F34] rounded-2xl shadow-2xl p-1 z-[70] animate-fadeIn">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[11.5px] font-bold transition active:scale-95 ${
                          isSelected ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D]' : 'text-gray-700 dark:text-[#E3ECE6] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <i className={opt.icon}></i>
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <i className="ph-bold ph-check text-xs text-white dark:text-[#74C69D]"></i>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {viewMode !== 'notes' && (
            <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-[#2E3F34]">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
                <button
                  onClick={() => setColorFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition active:scale-95 border shrink-0 ${
                    colorFilter === 'all'
                      ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D] shadow-2xs'
                      : 'bg-white dark:bg-[#17211C] text-gray-500 dark:text-[#8D9F94] border-gray-200 dark:border-[#2E3F34] hover:bg-gray-50 dark:hover:bg-[#26372D]'
                  }`}
                >
                  Semua
                </button>
                {Object.keys(COLOR_MAP).map((colKey) => (
                  <div key={colKey} className="p-0.5 shrink-0">
                    <button
                      onClick={() => setColorFilter(prev => prev === colKey ? 'all' : colKey)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-75 ${
                        COLOR_MAP[colKey].bg
                      } ${
                        colorFilter === colKey ? 'ring-2 ring-gray-900 ring-offset-2 ring-offset-white scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={COLOR_MAP[colKey].name}
                    >
                      {colorFilter === colKey && <i className="ph-bold ph-check text-white text-[10px]"></i>}
                    </button>
                  </div>
                ))}
              </div>

              {hasActiveFilter && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-gray-400 hover:text-gray-900 transition active:scale-95 shrink-0 pl-2"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div key={viewMode} className="animate-tab-enter relative z-10">
        {filteredVerses.length > 0 ? (
          <div className={viewMode === 'activity' ? "relative pl-6 space-y-4" : "space-y-3"}>
            {viewMode === 'activity' && (
              <div className="absolute left-2 top-3 bottom-3 w-px bg-gray-200/90 dark:bg-[#2E3F34] pointer-events-none"></div>
            )}
            
            {filteredVerses.map((v: any) => {
              const highlightClass = v.color ? COLOR_MAP[v.color]?.text || '' : '';
              return (
                <div key={v.groupedIds[0]} className="relative">
                  {viewMode === 'activity' && (
                    <div className="absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-[#74C69D] ring-4 ring-[#fafafa] dark:ring-[#17211C]"></div>
                  )}

                  <div
                    onClick={() => onNavigateToVerse && onNavigateToVerse(v.book, v.chapter, v.verseRange[0])}
                    className={`bg-white dark:bg-[#1E2A23] border border-gray-200/90 dark:border-[#2E3F34] rounded-2xl p-4 shadow-2xs hover:border-gray-300 dark:hover:border-[#3C5143] active:scale-[0.985] cursor-pointer transition-transform duration-150 select-none ${
                      deletingId === v.groupedIds[0] ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-1.5 text-gray-900 dark:text-[#E3ECE6] group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
                        <span className="text-[12.5px] font-extrabold tracking-tight">
                          {v.book} {v.chapter}:{v.displayVerse}
                        </span>
                        <span className="text-[9.5px] font-bold text-gray-500 dark:text-[#8D9F94] bg-gray-100 dark:bg-[#27382F] px-1.5 py-0.5 rounded-md border border-gray-200/70 dark:border-[#354B3E]">
                          {v.version || 'AYT'}
                        </span>
                        <i className="ph-bold ph-caret-right text-xs text-gray-300 dark:text-[#8D9F94] group-hover:text-gray-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"></i>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-gray-400 dark:text-[#8D9F94]">
                          {formatRelativeTime(v.created_at)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedVerseGroup(v.groupedIds);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 dark:text-[#8D9F94] hover:text-gray-900 dark:hover:text-white active:scale-80 transition-colors"
                        >
                          <i className="ph-bold ph-trash text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <p className={`text-[13.5px] leading-relaxed text-gray-700 dark:text-[#E3ECE6] font-normal ${highlightClass}`}>
                      {v.combinedContent.map((c: any, idx: number) => (
                        <span key={c.v}>
                          {v.verseRange.length > 1 && <sup className="text-[9.5px] font-extrabold text-gray-400 dark:text-[#8D9F94] mr-0.5">{c.v}</sup>}
                          {c.text}{idx < v.combinedContent.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </p>

                    {parseLabels(v.labels).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-gray-100 dark:border-[#2E3F34]">
                        {parseLabels(v.labels).map((lbl: string) => {
                          const meta = getLabelMeta(lbl);
                          return (
                            <span
                              key={lbl}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold border ${meta.color}`}
                            >
                              <i className={`ph-bold ${meta.icon} text-xs text-gray-500 dark:text-[#8D9F94]`}></i>
                              <span>{lbl}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {v.note && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#2E3F34] flex items-start gap-2">
                        <i className="ph-bold ph-text-align-left text-gray-400 dark:text-[#8D9F94] text-xs mt-0.5 shrink-0"></i>
                        <p className="text-[13px] text-gray-800 dark:text-[#E3ECE6] leading-relaxed font-normal whitespace-pre-wrap flex-1">
                          {v.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-16 pb-10 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-[#1E2A23] border border-transparent dark:border-[#2E3F34] rounded-full flex items-center justify-center mb-3 text-gray-400 dark:text-[#8D9F94]">
              <i className="ph-fill ph-bookmark-simple text-xl"></i>
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
              {hasActiveFilter ? 'Tidak ada hasil' : 'Belum ada Aktivitas'}
            </h4>
            <p className="text-xs text-gray-400 dark:text-[#8D9F94] max-w-[240px] leading-relaxed mb-3">
              {hasActiveFilter
                ? 'Tidak ada ayat yang cocok dengan filter saat ini.'
                : viewMode === 'notes'
                ? 'Pilih ayat di Alkitab dan gunakan tombol Catat untuk menambahkan renungan.'
                : viewMode === 'highlights'
                ? 'Pilih ayat di Alkitab dan terapkan warna sorotan untuk menandai ayat.'
                : 'Belum ada aktivitas baru. Berikan catatan atau sorotan pada ayat Alkitab.'}
            </p>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#74C69D] rounded-xl text-[11px] font-bold active:scale-95 transition-transform"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}