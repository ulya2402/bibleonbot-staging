import { useState, useEffect, useRef, useMemo, memo } from 'react';
import type { BibleVersion } from '../types/bible';
import { parseLabels, getLabelMeta } from '../types/bible';

interface BibleTabProps {
  currentBook: any;
  currentChapter: number;
  currentVersion: BibleVersion;
  setSelectorStep: (step: 'book' | 'chapter' | 'version') => void;
  setIsSelectorOpen: (open: boolean) => void;
  isLoadingBible: boolean;
  bibleVerses: any[];
  savedVerses: any[];
  selectedVerses: number[];
  handleVerseSelect: (id: number) => void;
  handleTouchStart: (id: number) => void;
  handleTouchEnd: () => void;
  setViewingNote: (note: any) => void;
  setViewingLabel?: (data: any) => void;
  goToPrevChapter: () => void;
  goToNextChapter: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  highlightedVerse?: number | null;
  setHighlightedVerse?: (verse: number | null) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

function BibleTabComponent({
  currentBook,
  currentChapter,
  currentVersion,
  setSelectorStep,
  setIsSelectorOpen,
  isLoadingBible,
  bibleVerses,
  savedVerses,
  selectedVerses,
  handleVerseSelect,
  handleTouchStart,
  handleTouchEnd,
  setViewingNote,
  setViewingLabel,
  goToPrevChapter,
  goToNextChapter,
  canGoPrev,
  canGoNext,
  highlightedVerse,
  setHighlightedVerse,
  isDark,
  toggleTheme
}: BibleTabProps) {
  const [verseSearch, setVerseSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const focusTimer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!verseSearch.trim()) {
      setDebouncedSearch('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(verseSearch.trim());
      setIsSearching(false);
    }, 180);
    return () => clearTimeout(handler);
  }, [verseSearch]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const handleBackClick = () => {
      setIsSearchOpen(false);
      setVerseSearch('');
    };

    if (isSearchOpen) {
      tg.BackButton.show();
      tg.onEvent('backButtonClicked', handleBackClick);
    } else {
      tg.BackButton.hide();
      tg.offEvent('backButtonClicked', handleBackClick);
    }

    return () => {
      tg.BackButton.hide();
      tg.offEvent('backButtonClicked', handleBackClick);
    };
  }, [isSearchOpen]);

  const COLOR_MAP: Record<string, string> = {
    'yellow': 'bg-amber-100 dark:bg-amber-500/25 text-amber-950 dark:text-amber-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'green': 'bg-emerald-100 dark:bg-emerald-500/25 text-emerald-950 dark:text-emerald-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'blue': 'bg-sky-100 dark:bg-sky-500/25 text-sky-950 dark:text-sky-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'pink': 'bg-rose-100 dark:bg-rose-500/25 text-rose-950 dark:text-rose-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'purple': 'bg-purple-100 dark:bg-purple-500/25 text-purple-950 dark:text-purple-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'orange': 'bg-orange-100 dark:bg-orange-500/25 text-orange-950 dark:text-orange-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'teal': 'bg-teal-100 dark:bg-teal-500/25 text-teal-950 dark:text-teal-200 px-1 py-0.5 rounded-md box-decoration-clone',
    'indigo': 'bg-indigo-100 dark:bg-indigo-500/25 text-indigo-950 dark:text-indigo-200 px-1 py-0.5 rounded-md box-decoration-clone',
  };

  const renderPericopeTitle = (rawTitle: string, isFirstRow: boolean) => {
    if (!rawTitle) return null;
    const cleanTitle = rawTitle.replace(/<br\s*\/?>/gi, ' \u2014 ').trim();
    const match = cleanTitle.match(/^(.*?)\s*(\([^\)]+\))$/);
    const mainText = match ? match[1].trim() : cleanTitle;
    const parallelRef = match ? match[2].trim() : null;

    return (
      <div className={`px-3 select-none ${isFirstRow ? 'pt-2 pb-3' : 'pt-8 pb-3.5'}`}>
        <h3 className="text-[18px] sm:text-[19px] font-extrabold text-gray-900 dark:text-[#74C69D] tracking-tight leading-snug">
          {mainText}
        </h3>
        {parallelRef && (
          <p className="text-[11.5px] font-medium text-gray-400 dark:text-[#8D9F94] mt-1 tracking-normal leading-relaxed">
            {parallelRef}
          </p>
        )}
      </div>
    );
  };

  const renderVerseContent = (rawText: string) => {
    const textWithoutPilcrow = rawText.replace(/^¶\s*/, '').replace(/¶\s*/g, '').replace(/<t\s*\/>/g, '');
    const lines = textWithoutPilcrow.split(/\r?\n/);
    
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\{[^}]+\}|\[[^\]]+\]|\([^\)]+\)|G\d+|H\d+|[A-Z]-[A-Z0-9-]+| )/g);
      
      const parsedLine = parts.map((part: string, index: number) => {
        if (!part) return null;

        if (part === ' ') {
          return <span key={index} className="inline-block w-1 select-none"> </span>;
        }

        if (part.startsWith('{') && part.endsWith('}')) {
          const content = part.replace(/[{}]/g, '');
          const isStrong = /^\(?([GH]\d+)\)?$/.test(content);
          return (
            <span
              key={index}
              className={`inline-flex items-center text-[9px] font-mono select-none mx-0.5 px-1 py-0.2 rounded border align-baseline ${
                isStrong
                  ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200'
                  : 'text-purple-700 bg-purple-50/90 border-purple-200'
              }`}
            >
              {content}
            </span>
          );
        }

        if (part.startsWith('[') && part.endsWith(']')) {
          const content = part.slice(1, -1);
          return (
            <span key={index} className="italic text-gray-600 font-normal">
              {content}
            </span>
          );
        }

        if (part.startsWith('(') && part.endsWith(')')) {
          return (
            <span key={index} className="text-gray-500 text-[12px] font-normal">
              {part}
            </span>
          );
        }

        if (/^(G|H)\d+$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center text-[9px] font-mono text-emerald-700 bg-emerald-50/90 border border-emerald-200 select-none mx-0.5 px-1 py-0.2 rounded align-baseline"
            >
              {part}
            </span>
          );
        }

        if (/^[A-Z]-[A-Z0-9-]+$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center text-[9px] font-mono text-purple-700 bg-purple-50/90 border border-purple-200 select-none mx-0.5 px-1 py-0.2 rounded align-baseline"
            >
              {part}
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      });

      return (
        <span key={lineIdx} className={lineIdx > 0 ? 'block mt-2 pl-2.5 border-l-2 border-gray-200' : ''}>
          {parsedLine}
        </span>
      );
    });
  };

  const filteredVerses = useMemo(() => {
    if (!debouncedSearch) return bibleVerses;
    const searchLower = debouncedSearch.toLowerCase();
    return bibleVerses.filter((v: any) =>
      v.content.toLowerCase().includes(searchLower) || String(v.verse) === debouncedSearch
    );
  }, [bibleVerses, debouncedSearch]);

  useEffect(() => {
    if (highlightedVerse && !isLoadingBible && bibleVerses.length > 0) {
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(`verse-row-${highlightedVerse}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      const clearTimer = setTimeout(() => {
        if (setHighlightedVerse) setHighlightedVerse(null);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightedVerse, isLoadingBible, bibleVerses, setHighlightedVerse]);

  const isScopeMismatch = currentVersion.testamentScope === 'NT' && currentBook.test === 'PL';

  const savedMap = new Map<number, any>();
  for (let i = 0; i < savedVerses.length; i++) {
    const sv = savedVerses[i];
    if (
      String(sv.book).toLowerCase() === String(currentBook.name).toLowerCase() &&
      Number(sv.chapter) === Number(currentChapter)
    ) {
      savedMap.set(Number(sv.verse), sv);
    }
  }

  return (
    <div className="relative">
      <div 
        className="sticky top-0 z-30 px-5 pb-3 transition-colors duration-150 border-b border-gray-200/50 dark:border-[#2E3F34]/50 shadow-2xs"
        style={{
          paddingTop: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3rem)',
          backgroundColor: isDark ? 'rgba(23, 33, 28, 0.97)' : 'rgba(250, 250, 250, 0.97)'
        }}
      >
        <div className="flex items-center justify-center gap-1.5 max-w-[420px] mx-auto w-full">
          <button
            onClick={goToPrevChapter}
            disabled={!canGoPrev}
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#24332A] text-gray-700 dark:text-[#E3ECE6] border border-gray-200/80 dark:border-[#2E3F34] shadow-xs transition active:scale-90 shrink-0 ${
              !canGoPrev ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-[#2B3C32]'
            }`}
          >
            <i className="ph-bold ph-caret-left text-sm"></i>
          </button>
          
          <button
            onClick={() => { setSelectorStep('book'); setIsSelectorOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 dark:bg-[#26372D] text-white border border-transparent dark:border-[#354B3E] rounded-full shadow-xs text-[13px] font-bold transition active:scale-95 shrink-0 hover:bg-black dark:hover:bg-[#2D4135]"
          >
            <span className="truncate max-w-[125px]">{currentBook.name} {currentChapter}</span>
            <i className="ph-bold ph-caret-down text-gray-400 dark:text-[#8D9F94] text-xs"></i>
          </button>

          <button
            onClick={() => { setSelectorStep('version'); setIsSelectorOpen(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#24332A] text-gray-800 dark:text-[#E3ECE6] border border-gray-200 dark:border-[#2E3F34] rounded-full shadow-xs text-[12px] font-bold transition active:scale-95 shrink-0 hover:bg-gray-50 dark:hover:bg-[#2B3C32]"
          >
            <span>{currentVersion.shortName}</span>
            <i className="ph-bold ph-caret-down text-gray-400 dark:text-[#8D9F94] text-[10px]"></i>
          </button>

          <button
            onClick={goToNextChapter}
            disabled={!canGoNext}
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#24332A] text-gray-700 dark:text-[#E3ECE6] border border-gray-200/80 dark:border-[#2E3F34] shadow-xs transition active:scale-90 shrink-0 ${
              !canGoNext ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-[#2B3C32]'
            }`}
          >
            <i className="ph-bold ph-caret-right text-sm"></i>
          </button>

          <button
            onClick={() => {
              if (isSearchOpen && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              setIsSearchOpen(prev => !prev);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-xs transition active:scale-90 shrink-0 ml-0.5 border border-gray-200/80 dark:border-[#2E3F34] ${
              isSearchOpen ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D]' : 'bg-white dark:bg-[#24332A] text-gray-600 dark:text-[#E3ECE6] hover:bg-gray-50 dark:hover:bg-[#2B3C32]'
            }`}
          >
            <i className="ph-bold ph-magnifying-glass text-xs"></i>
          </button>

          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full shadow-xs transition active:scale-90 shrink-0 bg-white dark:bg-[#24332A] text-gray-600 dark:text-[#74C69D] hover:bg-gray-50 dark:hover:bg-[#2B3C32] border border-gray-200/80 dark:border-[#2E3F34]"
              title={isDark ? "Tema Terang" : "Tema Gelap"}
            >
              <i className={`ph-bold ${isDark ? 'ph-sun text-[#74C69D]' : 'ph-moon'} text-xs`}></i>
            </button>
          )}
        </div>

        <div 
          className={`overflow-hidden max-w-[420px] mx-auto transition-all duration-200 ${
            isSearchOpen ? 'max-h-12 opacity-100 mt-2.5' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 py-0.5">
            <div className="relative flex-1">
              <i className="ph-bold ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8D9F94] text-xs"></i>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari ayat di pasal ini..."
                value={verseSearch}
                onChange={(e) => setVerseSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                    setIsSearchOpen(false);
                    setVerseSearch('');
                    setDebouncedSearch('');
                    setIsSearching(false);
                  }
                }}
                className="w-full bg-[#f4f5f7] dark:bg-[#1E2A23] border border-gray-200/60 dark:border-[#2E3F34] text-gray-800 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] rounded-xl py-2 pl-9 pr-8 text-[12px] font-medium focus:outline-none focus:bg-[#eaedf2] dark:focus:bg-[#26372D]"
              />
              {verseSearch && (
                <button 
                  onClick={() => {
                    setVerseSearch('');
                    setDebouncedSearch('');
                    setIsSearching(false);
                  }} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-[#8D9F94] dark:hover:text-[#E3ECE6]"
                >
                  <i className="ph-bold ph-x text-xs"></i>
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                setIsSearchOpen(false);
                setVerseSearch('');
                setDebouncedSearch('');
                setIsSearching(false);
              }}
              className="text-[12px] font-bold text-gray-500 dark:text-[#8D9F94] hover:text-gray-900 dark:hover:text-[#E3ECE6] px-2 py-1.5 rounded-lg active:scale-95 shrink-0"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-3 pb-10 animate-fadeIn">
        <div className="space-y-1">
          {isLoadingBible ? (
            <div className="animate-pulse space-y-5 py-2 mt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-3 px-3">
                  <div className="w-5 h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md shrink-0 mt-1"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isScopeMismatch ? (
            <div className="text-center py-12 px-4 bg-white dark:bg-[#1E2A23] rounded-2xl border border-gray-100 dark:border-[#2E3F34] mt-4 shadow-sm">
              <i className="ph-duotone ph-book-bookmark text-4xl text-gray-300 dark:text-gray-500 mb-3"></i>
              <h4 className="font-bold text-gray-900 dark:text-[#E3ECE6] text-sm mb-1">{currentVersion.name}</h4>
              <p className="text-xs text-gray-500 dark:text-[#8D9F94] max-w-[280px] mx-auto leading-relaxed">
                Versi ini hanya mencakup Perjanjian Baru (PB). Silakan pilih kitab di Perjanjian Baru atau ganti versi terjemahan.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => { setSelectorStep('book'); setIsSelectorOpen(true); }}
                  className="px-4 py-2 bg-gray-900 dark:bg-[#26372D] text-white border border-transparent dark:border-[#74C69D] rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Pilih Kitab PB
                </button>
                <button
                  onClick={() => { setSelectorStep('version'); setIsSelectorOpen(true); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#26372D] text-gray-800 dark:text-[#E3ECE6] border border-gray-200 dark:border-[#2E3F34] rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Ganti Terjemahan
                </button>
              </div>
            </div>
          ) : isSearching ? (
            <div className="animate-pulse space-y-4 py-2 mt-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 px-3">
                  <div className="w-5 h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md shrink-0 mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#2E3F34] rounded-md w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVerses.length > 0 ? (
            filteredVerses.map((verseData: any, idx: number) => {
              const isParagraphStart = String(verseData.content).trim().startsWith('\u00B6');
              const hasTitle = Boolean(verseData.title && verseData.title.trim() !== '');
              const savedMatch = savedMap.get(Number(verseData.verse));
              const highlightClass = savedMatch && savedMatch.color ? COLOR_MAP[savedMatch.color] : '';
              const hasNote = savedMatch && savedMatch.note && savedMatch.note.trim() !== '';

              return (
                <div key={verseData.id} className="space-y-1">
                  {hasTitle && renderPericopeTitle(verseData.title, idx === 0)}

                  {isParagraphStart && !hasTitle && (
                    <div className="pt-4 pb-1.5 flex items-center gap-2 select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[#787C82]"></div>
                      <div className="h-px bg-gray-200/80 dark:bg-[#52555A] flex-1"></div>
                    </div>
                  )}

                  <div
                    id={`verse-row-${verseData.verse}`}
                    onClick={() => handleVerseSelect(verseData.id)}
                    onTouchStart={() => handleTouchStart(verseData.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`verse-item px-3 py-2.5 rounded-xl cursor-pointer flex gap-3 transition-all duration-150 select-none active:scale-[0.985] active:opacity-90 ${
                      Number(verseData.verse) === Number(highlightedVerse)
                        ? 'verse-spotlight'
                        : selectedVerses.includes(verseData.id)
                        ? 'bg-[#eaedf2] dark:bg-[#28382F]'
                        : 'bg-transparent'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0 w-6 pt-0.5">
                      <span className={`text-[12px] font-bold ${selectedVerses.includes(verseData.id) ? 'text-gray-900 dark:text-[#74C69D]' : 'text-gray-400 dark:text-[#7C8E83]'}`}>
                        {verseData.verse}
                      </span>
                      {hasNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingNote({
                              book: currentBook.name,
                              chapter: currentChapter,
                              verse: verseData.verse,
                              content: verseData.content.replace(/^[\u00B6\s]+/, '').replace(/<t\s*\/>/g, ''),
                              note: savedMatch.note
                            });
                          }}
                          className="w-4 h-4 flex items-center justify-center text-gray-500 dark:text-[#8D9F94] hover:text-gray-900 dark:hover:text-[#E3ECE6] transition-all duration-150 active:scale-75"
                          title="Buka Catatan"
                        >
                          <i className="ph-bold ph-text-align-left text-xs"></i>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <span className={`text-[15px] leading-relaxed font-normal block text-gray-800 dark:text-[#E3ECE6] ${highlightClass}`}>
                        {renderVerseContent(verseData.content)}
                      </span>

                      {parseLabels(savedMatch?.labels).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {parseLabels(savedMatch.labels).map((lbl: string) => {
                            const meta = getLabelMeta(lbl);
                            return (
                              <span
                                key={lbl}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (setViewingLabel) {
                                    setViewingLabel({
                                      book: currentBook.name,
                                      chapter: currentChapter,
                                      verse: verseData.verse,
                                      content: verseData.content.replace(/^[\u00B6\s]+/, '').replace(/<t\s*\/>/g, ''),
                                      labels: savedMatch.labels
                                    });
                                  }
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${meta.color} active:scale-95 transition-transform select-none`}
                              >
                                <i className={`ph-bold ${meta.icon} text-xs text-gray-500 dark:text-[#8D9F94]`}></i>
                                <span>{lbl}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <i className="ph-duotone ph-warning-circle text-4xl text-gray-300 dark:text-gray-500 mb-3"></i>
              <p className="text-sm font-medium text-gray-500 dark:text-[#A6ACB3]">Ayat tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const BibleTab = memo(BibleTabComponent);
export default BibleTab;