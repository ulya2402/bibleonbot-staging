import { useState, useEffect, memo } from 'react';
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
  setHighlightedVerse
}: BibleTabProps) {
  const [verseSearch, setVerseSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    'yellow': 'bg-amber-100 text-amber-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'green': 'bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'blue': 'bg-sky-100 text-sky-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'pink': 'bg-rose-100 text-rose-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'purple': 'bg-purple-100 text-purple-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'orange': 'bg-orange-100 text-orange-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'teal': 'bg-teal-100 text-teal-950 px-1 py-0.5 rounded-md box-decoration-clone',
    'indigo': 'bg-indigo-100 text-indigo-950 px-1 py-0.5 rounded-md box-decoration-clone',
  };

  const renderPericopeTitle = (rawTitle: string, isFirstRow: boolean) => {
    if (!rawTitle) return null;
    const cleanTitle = rawTitle.replace(/<br\s*\/?>/gi, ' \u2014 ').trim();
    const match = cleanTitle.match(/^(.*?)\s*(\([^\)]+\))$/);
    const mainText = match ? match[1].trim() : cleanTitle;
    const parallelRef = match ? match[2].trim() : null;

    return (
      <div className={`px-3 select-none ${isFirstRow ? 'pt-2 pb-3' : 'pt-8 pb-3.5'}`}>
        <h3 className="text-[18px] sm:text-[19px] font-extrabold text-gray-900 tracking-tight leading-snug">
          {mainText}
        </h3>
        {parallelRef && (
          <p className="text-[11.5px] font-medium text-gray-400 mt-1 tracking-normal leading-relaxed">
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

  const filteredVerses = bibleVerses.filter((v: any) =>
    v.content.toLowerCase().includes(verseSearch.toLowerCase()) || String(v.verse) === verseSearch
  );

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

  return (
    <div className="relative">
      <div 
        className="sticky top-0 z-30 px-5 pb-3 transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]"
        style={{
          paddingTop: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3rem)',
          backgroundColor: 'rgba(250, 250, 250, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-center gap-1.5 max-w-[400px] mx-auto w-full">
          <button
            onClick={goToPrevChapter}
            disabled={!canGoPrev}
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-xs transition active:scale-90 shrink-0 ${
              !canGoPrev ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'
            }`}
          >
            <i className="ph-bold ph-caret-left text-sm"></i>
          </button>
          <button
            onClick={() => { setSelectorStep('book'); setIsSelectorOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white rounded-full shadow-xs text-[13px] font-bold transition active:scale-95 shrink-0 hover:bg-black"
          >
            <span className="truncate max-w-[130px]">{currentBook.name} {currentChapter}</span>
            <i className="ph-bold ph-caret-down text-gray-400 text-xs"></i>
          </button>
          <button
            onClick={() => { setSelectorStep('version'); setIsSelectorOpen(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-800 rounded-full shadow-xs text-[12px] font-bold transition active:scale-95 shrink-0 hover:bg-gray-50"
          >
            <span>{currentVersion.shortName}</span>
            <i className="ph-bold ph-caret-down text-gray-400 text-[10px]"></i>
          </button>
          <button
            onClick={goToNextChapter}
            disabled={!canGoNext}
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-xs transition active:scale-90 shrink-0 ${
              !canGoNext ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'
            }`}
          >
            <i className="ph-bold ph-caret-right text-sm"></i>
          </button>
          <button
            onClick={() => setIsSearchOpen(prev => !prev)}
            className={`w-8 h-8 flex items-center justify-center rounded-full shadow-xs transition active:scale-90 shrink-0 ml-1 ${
              isSearchOpen ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="ph-bold ph-magnifying-glass text-xs"></i>
          </button>
        </div>

        {isSearchOpen && (
          <div className="mt-2.5 max-w-[400px] mx-auto animate-fadeIn flex items-center gap-2">
            <div className="relative flex-1">
              <i className="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Cari ayat di pasal ini..."
                value={verseSearch}
                onChange={(e) => setVerseSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    setVerseSearch('');
                  }
                }}
                autoFocus
                className="w-full bg-[#f4f5f7] rounded-xl py-2 pl-8 pr-7 text-[12px] font-medium text-gray-800 focus:outline-none focus:bg-[#eaedf2] transition"
              />
              {verseSearch && (
                <button onClick={() => setVerseSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className="ph-bold ph-x text-xs"></i>
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setVerseSearch('');
              }}
              className="text-[12px] font-bold text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded-lg transition active:scale-95 shrink-0"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 px-5 pt-3 pb-10 animate-fadeIn">
        <div className="space-y-1">
          {isLoadingBible ? (
            <div className="animate-pulse space-y-5 py-2 mt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-3 px-3">
                  <div className="w-5 h-4 bg-gray-200 rounded-md shrink-0 mt-1"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isScopeMismatch ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 mt-4 shadow-sm">
              <i className="ph-duotone ph-book-bookmark text-4xl text-gray-300 mb-3"></i>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{currentVersion.name}</h4>
              <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                Versi ini hanya mencakup Perjanjian Baru (PB). Silakan pilih kitab di Perjanjian Baru atau ganti versi terjemahan.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => { setSelectorStep('book'); setIsSelectorOpen(true); }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Pilih Kitab PB
                </button>
                <button
                  onClick={() => { setSelectorStep('version'); setIsSelectorOpen(true); }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Ganti Terjemahan
                </button>
              </div>
            </div>
          ) : filteredVerses.length > 0 ? (
            filteredVerses.map((verseData: any, idx: number) => {
              const isParagraphStart = String(verseData.content).trim().startsWith('¶');
              const hasTitle = Boolean(verseData.title && verseData.title.trim() !== '');
              const savedMatch = savedVerses.find((sv: any) =>
                String(sv.book) === String(currentBook.name) &&
                String(sv.chapter) === String(currentChapter) &&
                String(sv.verse) === String(verseData.verse)
              );
              const highlightClass = savedMatch && savedMatch.color ? COLOR_MAP[savedMatch.color] : '';
              const hasNote = savedMatch && savedMatch.note && savedMatch.note.trim() !== '';

              return (
                <div key={verseData.id} className="space-y-1">
                  {hasTitle && renderPericopeTitle(verseData.title, idx === 0)}
                  {isParagraphStart && !hasTitle && (
                    <div className="pt-4 pb-1.5 flex items-center gap-2 select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <div className="h-px bg-gray-200/80 flex-1"></div>
                    </div>
                  )}
                  <div
                    id={`verse-row-${verseData.verse}`}
                    onClick={() => handleVerseSelect(verseData.id)}
                    onTouchStart={() => handleTouchStart(verseData.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    className={`verse-item px-3 py-2.5 rounded-xl cursor-pointer flex gap-3 transition-all duration-150 ${
                      Number(verseData.verse) === Number(highlightedVerse)
                        ? 'verse-spotlight'
                        : selectedVerses.includes(verseData.id)
                        ? 'bg-[#eaedf2]'
                        : 'bg-transparent hover:bg-gray-100/60'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0 w-6 pt-0.5">
                      <span className={`text-[12px] font-bold ${selectedVerses.includes(verseData.id) ? 'text-gray-900' : 'text-gray-400'}`}>
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
                              content: verseData.content.replace(/^¶\s*/, '').replace(/<t\s*\/>/g, ''),
                              note: savedMatch.note
                            });
                          }}
                          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all duration-150 active:scale-75"
                          title="Buka Catatan"
                        >
                          <i className="ph-bold ph-text-align-left text-xs"></i>
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-[15px] leading-relaxed font-normal block text-gray-800 ${highlightClass}`}>
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
                                      content: verseData.content.replace(/^¶\s*/, '').replace(/<t\s*\/>/g, ''),
                                      labels: savedMatch.labels
                                    });
                                  }
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${meta.color} active:scale-95 transition-transform select-none`}
                              >
                                <i className={`ph-bold ${meta.icon} text-xs`}></i>
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
              <i className="ph-duotone ph-warning-circle text-4xl text-gray-300 mb-3"></i>
              <p className="text-sm font-medium text-gray-500">Ayat tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const BibleTab = memo(BibleTabComponent);
export default BibleTab;