import { useState, useMemo } from 'react';

interface DiscoverTabProps {
  books: any[];
  onNavigateToVerse: (bookName: string, chapter: number) => void;
  isDark?: boolean;
}

export default function DiscoverTab({ books, onNavigateToVerse }: DiscoverTabProps) {
  const [query, setQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return books.filter((b) => b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  }, [books, query]);

  return (
    <div className="animate-fadeIn px-5 pt-4 pb-12 space-y-5">
      <div>
        <h2 className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-[#E3ECE6]">Temukan</h2>
        <p className="text-[13px] text-gray-500 dark:text-[#8D9F94] font-medium mt-1">
          Cari kitab, pasal, dan topik Firman Tuhan
        </p>
      </div>

      <div className="relative flex items-center bg-white dark:bg-[#1E2A23] border border-gray-200/90 dark:border-[#2E3F34] rounded-2xl px-3.5 py-1 shadow-2xs focus-within:border-gray-900 dark:focus-within:border-[#74C69D]">
        <i className="ph-bold ph-magnifying-glass text-gray-400 dark:text-[#8D9F94] text-base shrink-0 mr-2.5"></i>
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Ketik nama kitab (cth: Kejadian, Matius)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedBook(null);
          }}
          className="w-full bg-transparent py-2.5 text-[16px] font-medium text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedBook(null);
            }}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-[#8D9F94] shrink-0"
          >
            <i className="ph-bold ph-x text-sm"></i>
          </button>
        )}
      </div>

      {selectedBook ? (
        <div className="bg-white dark:bg-[#1E2A23] border border-gray-200/80 dark:border-[#2E3F34] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#2E3F34]">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 dark:text-[#E3ECE6]">{selectedBook.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#26372D] text-gray-600 dark:text-[#74C69D]">
                {selectedBook.test === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="text-[12px] font-bold text-gray-400 hover:text-gray-700 dark:text-[#8D9F94]"
            >
              Tutup
            </button>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8D9F94] mb-2">
              Pilih Pasal (1 - {selectedBook.chapters})
            </p>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => onNavigateToVerse(selectedBook.name, ch)}
                  className="h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#26372D] text-gray-900 dark:text-[#E3ECE6] font-bold text-sm border border-gray-200/60 dark:border-[#354B3E] hover:bg-gray-900 hover:text-white dark:hover:bg-[#74C69D] dark:hover:text-gray-950 active:scale-90 transition-transform"
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : query.trim() ? (
        <div className="space-y-2">
          {filteredBooks.length > 0 ? (
            <div className="bg-white dark:bg-[#1E2A23] border border-gray-200/80 dark:border-[#2E3F34] rounded-2xl divide-y divide-gray-100 dark:divide-[#2E3F34] overflow-hidden shadow-2xs">
              {filteredBooks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBook(b)}
                  className="p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#26372D] cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-[#E3ECE6]">{b.name}</h4>
                    <p className="text-[11px] text-gray-400 dark:text-[#8D9F94]">
                      {b.chapters} Pasal &bull; {b.test === 'PL' ? 'Perjanjian Lama' : 'Perjanjian Baru'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 dark:text-[#74C69D]">
                    <span>Buka</span>
                    <i className="ph-bold ph-caret-right"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <i className="ph-duotone ph-magnifying-glass text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
              <p className="text-sm font-medium text-gray-400 dark:text-[#8D9F94]">Kitab tidak ditemukan.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-white dark:bg-[#1E2A23] border border-gray-200/80 dark:border-[#2E3F34] rounded-2xl shadow-2xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-[#E3ECE6] mb-1">Pencarian Cepat</h3>
            <p className="text-xs text-gray-500 dark:text-[#8D9F94] leading-relaxed">
              Ketik nama kitab yang ingin Anda baca, lalu pilih pasal untuk langsung membukanya di halaman Alkitab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}