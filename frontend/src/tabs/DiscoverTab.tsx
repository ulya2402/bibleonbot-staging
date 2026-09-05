import { useState, useMemo } from 'react';

interface DiscoverTabProps {
  books: any[];
  onNavigateToVerse: (bookName: string, chapter: number, verseNumber?: number) => void;
  isDark?: boolean;
}

export default function DiscoverTab({ books, onNavigateToVerse }: DiscoverTabProps) {
  const [query, setQuery] = useState('');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return books.filter(b => b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  }, [books, query]);

  return (
    <div className="animate-fadeIn px-5 pt-3 pb-12 space-y-4">
      <div>
        <h2 className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-[#E3ECE6]">Temukan</h2>
        <p className="text-[13px] text-gray-500 dark:text-[#8D9F94] font-medium mt-0.5">
          Eksplorasi topik, renungan, dan firman Tuhan
        </p>
      </div>

      <div className="relative flex items-center bg-white dark:bg-[#1E2A23] rounded-2xl px-3.5 py-1 focus-within:ring-2 focus-within:ring-gray-900/10 dark:focus-within:ring-[#74C69D]/20 transition-all">
        <i className="ph-bold ph-magnifying-glass text-gray-400 dark:text-[#8D9F94] text-base shrink-0 mr-2.5"></i>
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Cari kitab (cth: Kejadian, Yohanes)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent py-2.5 text-[16px] font-medium text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-[#8D9F94] shrink-0"
          >
            <i className="ph-bold ph-x text-sm"></i>
          </button>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-2 pt-1">
          {filteredBooks.map((book) => {
            const isExpanded = expandedBookId === book.id;

            return (
              <div
                key={book.id}
                className={`rounded-2xl transition-colors duration-150 overflow-hidden ${
                  isExpanded
                    ? 'bg-white dark:bg-[#1E2A23]'
                    : 'bg-white/70 dark:bg-[#1E2A23]/70 hover:bg-white dark:hover:bg-[#1E2A23]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedBookId(prev => prev === book.id ? null : book.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left select-none"
                >
                  <div>
                    <h4 className="text-[14.5px] font-bold text-gray-900 dark:text-[#E3ECE6]">
                      {book.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 dark:text-[#8D9F94] mt-0.5">
                      {book.chapters} Pasal &bull; {book.test === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-[#8D9F94] bg-gray-50 dark:bg-[#26372D] shrink-0">
                    <i className={`ph-bold ph-caret-down text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180 text-gray-900 dark:text-[#74C69D]' : ''}`}></i>
                  </div>
                </button>

                <div className={`accordion-grid ${isExpanded ? 'open' : ''}`}>
                  <div className="accordion-inner">
                    <div className="px-4 pb-4 pt-1">
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-2 border-t border-gray-100 dark:border-[#2E3F34]">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => {
                              try {
                                (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
                              } catch (e) {}
                              onNavigateToVerse(book.name, ch);
                            }}
                            className="h-9 rounded-xl flex items-center justify-center text-[13px] font-bold bg-gray-100 dark:bg-[#26372D] text-gray-800 dark:text-[#E3ECE6] hover:bg-gray-900 hover:text-white dark:hover:bg-[#74C69D] dark:hover:text-[#17211C] active:scale-90 active:opacity-75 transition-all duration-150"
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <i className="ph-duotone ph-magnifying-glass text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
              <p className="text-sm font-medium text-gray-400 dark:text-[#8D9F94]">Kitab tidak ditemukan.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="pt-6 text-center space-y-2 select-none">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#1E2A23] text-gray-400 dark:text-[#8D9F94] flex items-center justify-center mx-auto text-xl">
            <i className="ph-bold ph-compass"></i>
          </div>
          <h3 className="font-bold text-sm text-gray-700 dark:text-[#E3ECE6]">Pencarian Cepat Kitab</h3>
          <p className="text-[12px] text-gray-400 dark:text-[#8D9F94] max-w-[240px] mx-auto leading-relaxed">
            Ketik nama kitab pada kolom pencarian di atas untuk membuka pasal secara instan.
          </p>
        </div>
      )}
    </div>
  );
}