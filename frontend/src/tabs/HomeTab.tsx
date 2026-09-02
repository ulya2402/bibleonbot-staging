import { useState } from 'react';

export default function HomeTab({ dailyVerse, communities, channels, news, userName, isAdmin, setActiveTab, isDark, toggleTheme }: any) {
  const [visibleComms, setVisibleComms] = useState(5);
  const [visibleNews, setVisibleNews] = useState(5);

  const hour = new Date().getHours();
  let greeting = 'Selamat pagi,';
  if (hour >= 11 && hour < 15) greeting = 'Selamat siang,';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore,';
  else if (hour >= 18 || hour < 4) greeting = 'Selamat malam,';

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return 'Artikel';
    }
  };

  const formatNewsDate = (dateInput: string) => {
    if (!dateInput) return 'Baru saja';
    try {
      const formatted = dateInput.includes('T') ? dateInput : dateInput.replace(' ', 'T') + 'Z';
      const date = new Date(formatted);
      if (isNaN(date.getTime())) return 'Baru saja';

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Baru saja';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} jam lalu`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Kemarin';
      if (diffInDays < 7) return `${diffInDays} hari lalu`;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return 'Baru saja';
    }
  };

  return (
    <div className="animate-fadeIn px-5 space-y-8 pt-4">
      
      <div className="flex justify-between items-start px-1 mb-2">
        <div className="flex-1">
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-[#E3ECE6] leading-tight">
            <span id="greeting-time">{greeting}</span><br/>
            <span className="text-gray-400 dark:text-[#8D9F94] font-medium text-[22px]">Saudara {userName}</span>
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 bg-white dark:bg-[#1E2A23] text-gray-700 dark:text-[#74C69D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center shadow-sm active:scale-95 shrink-0 transition"
            title={isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
          >
            <i className={`ph-bold ${isDark ? 'ph-sun text-[#74C69D]' : 'ph-moon text-gray-700'} text-lg`}></i>
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className="w-10 h-10 bg-gray-900 dark:bg-[#1E2A23] text-white dark:text-[#E3ECE6] rounded-full flex items-center justify-center shadow-sm border border-transparent dark:border-[#2E3F34] relative active:scale-95 shrink-0 transition">
              <i className="ph-bold ph-shield-star"></i>
            </button>
          )}
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-transparent dark:to-transparent dark:bg-[#1E2A23] text-white rounded-[1.5rem] p-6 overflow-hidden shadow-lg mt-4 border border-transparent dark:border-[#2E3F34]">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl dark:hidden"></div>
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl dark:hidden"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#8D9F94]">Ayat Hari Ini</span>
            <i className="ph-fill ph-sparkle text-yellow-400 dark:text-[#74C69D] text-lg"></i>
          </div>
          <p className="text-lg font-medium leading-relaxed mb-3 text-white dark:text-[#E3ECE6]">
            {dailyVerse ? dailyVerse.verse_text : 'Memuat ayat...'}
          </p>
          <p className="text-sm text-gray-400 dark:text-[#8D9F94] font-semibold">
            {dailyVerse ? `- ${dailyVerse.verse_reference}` : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-[#E3ECE6]">Komunitas</h3>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-[#74C69D] bg-blue-50 dark:bg-[#22352A] px-2 py-1 rounded-md border border-blue-100 dark:border-[#2D4536]">Disarankan</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {communities.slice(0, visibleComms).map((c: any, i: number) => {
            const isPrayer = c.category.toLowerCase().includes('doa');
            return (
              <div key={i} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#1E2A23] rounded-2xl border border-gray-100 dark:border-[#2E3F34] shadow-sm hover:border-gray-200 dark:hover:border-[#3C5143] transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPrayer ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-300' : 'bg-blue-50 dark:bg-[#26372D] text-blue-500 dark:text-[#74C69D]'}`}>
                    <i className={`text-lg ${isPrayer ? 'ph-fill ph-hands-praying' : 'ph-fill ph-users-three'}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-[#E3ECE6]">{c.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#8D9F94] font-medium">{c.member_count} &bull; {c.category}</p>
                  </div>
                </div>
                <button onClick={() => window.open(c.link, '_blank')} className="px-4 py-1.5 bg-gray-900 dark:bg-[#2B3C32] text-white text-xs font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-[#34493D] border border-transparent dark:border-[#3C5244] transition shadow-sm">Gabung</button>
              </div>
            );
          })}
          {communities.length === 0 && <p className="text-xs text-gray-500 dark:text-[#8D9F94] text-center py-2">Belum ada komunitas.</p>}
        </div>

        {communities.length > visibleComms && (
          <button onClick={() => setVisibleComms(prev => prev + 5)} className="w-full py-2.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 hover:text-gray-900 transition flex justify-center items-center gap-1">
            <span>Tampilkan lainnya</span>
            <i className="ph-bold ph-caret-down"></i>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-lg tracking-tight px-1">Rekomendasi Channel</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {channels.map((ch: any, i: number) => {
            const isYouTube = ch.link.toLowerCase().includes('youtube.com') || ch.link.toLowerCase().includes('youtu.be');
            if (isYouTube) {
              return (
                <div key={i} className="flex-none w-[180px] p-3.5 bg-white dark:bg-[#251A1D] rounded-2xl border border-gray-100 dark:border-[#3D2329] shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-14 h-14 bg-red-50 dark:bg-rose-900/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <i className="ph-fill ph-youtube-logo text-xl text-rose-500 drop-shadow-sm"></i>
                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">YouTube</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-[#F2E6E8] leading-tight relative z-10">{ch.name}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-[#B3999E] mb-4 mt-1 line-clamp-2 relative z-10">{ch.category}</p>
                  <button onClick={() => window.open(ch.link, '_blank')} className="w-full py-2 bg-gray-50 dark:bg-[#341E24] hover:bg-gray-100 dark:hover:bg-[#43262E] text-gray-800 dark:text-rose-200 text-[11px] font-bold uppercase tracking-wider rounded-xl border border-gray-200 dark:border-[#4B2932] transition relative z-10">Tonton</button>
                </div>
              );
            }
            return (
              <div key={i} className="flex-none w-[180px] p-3.5 bg-gradient-to-br from-[#2AABEE]/10 to-[#229ED9]/5 dark:from-transparent dark:to-transparent dark:bg-[#17222B] rounded-2xl border border-[#2AABEE]/20 dark:border-[#223544] relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#2AABEE] dark:bg-[#1E3241] flex items-center justify-center text-white dark:text-[#58BCEB] border border-transparent dark:border-[#294255] shadow-sm">
                    <i className="ph-fill ph-telegram-logo text-sm"></i>
                  </div>
                  <span className="text-[10px] font-bold text-[#2AABEE] dark:text-[#58BCEB] uppercase tracking-wider">Telegram</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#E2EDF4] leading-tight">{ch.name}</h4>
                <p className="text-[11px] text-gray-600 dark:text-[#8AA3B4] mb-4 mt-1 line-clamp-2">{ch.category}</p>
                <button onClick={() => window.open(ch.link, '_blank')} className="w-full py-2 bg-white dark:bg-[#1E3241] text-[#2AABEE] dark:text-[#58BCEB] text-[11px] font-bold uppercase tracking-wider rounded-xl border border-[#2AABEE]/30 dark:border-[#294255] shadow-sm hover:bg-gray-50 dark:hover:bg-[#253D4F]">Buka App</button>
              </div>
            );
          })}
          {channels.length === 0 && <p className="text-xs text-gray-500 px-1">Belum ada channel.</p>}
        </div>
      </div>

      <div className="pb-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg tracking-tight">Berita & Artikel</h3>
          <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <i className="ph-bold ph-newspaper text-sm"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          {news.slice(0, visibleNews).map((n: any, i: number) => {
            const isArticle = n.category.toLowerCase().includes('artikel');
            return (
              <div key={n.id || i} onClick={() => window.open(n.link, '_blank')} className="animate-item-fade flex gap-4 items-center bg-white dark:bg-[#1E2A23] p-2.5 rounded-2xl border border-gray-100 dark:border-[#2E3F34] shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-[#3C5143] transition-all duration-150 active:scale-[0.985] group">
                <img src={n.image_url} alt="Cover" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 py-1 pr-2">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 block ${isArticle ? 'text-blue-600 dark:text-[#74C69D]' : 'text-orange-600 dark:text-[#74C69D]'}`}>{n.category}</span>
                  <h4 className="font-bold text-[13px] leading-tight text-gray-900 dark:text-[#E3ECE6] line-clamp-2 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-[#74C69D] transition">{n.title}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-[#8D9F94] font-medium">
                    <div className="flex items-center gap-1"><i className="ph-fill ph-clock"></i> {formatNewsDate(n.created_at)}</div>
                    <span>&bull;</span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-[#8D9F94]"><i className="ph-fill ph-globe"></i> {getDomainName(n.link)}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {news.length === 0 && <p className="text-xs text-gray-500 dark:text-[#8D9F94] text-center py-2">Belum ada berita.</p>}
        </div>
        {news.length > visibleNews && (
          <button onClick={() => setVisibleNews(prev => prev + 5)} className="w-full py-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-[#8D9F94] bg-white dark:bg-[#1E2A23] border border-gray-200 dark:border-[#2E3F34] rounded-xl hover:bg-gray-50 dark:hover:bg-[#26372D] active:scale-[0.98] transition-all flex justify-center items-center gap-1.5 shadow-sm">
            <span>Tampilkan Berita Lainnya</span>
            <i className="ph-bold ph-arrow-down"></i>
          </button>
        )}
      </div>

      <div className="relative bg-gradient-to-br from-[#1a1d23] to-[#2d313a] dark:from-transparent dark:to-transparent dark:bg-[#1E2A23] rounded-[1.5rem] p-7 overflow-hidden shadow-2xl mx-1 my-4 mb-6 group border border-transparent dark:border-[#2E3F34]">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-yellow-500 opacity-10 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-20 dark:hidden"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl dark:hidden"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-transparent dark:to-transparent dark:bg-[#26372D] border border-transparent dark:border-[#2E3F34] flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] dark:shadow-none mb-4 transform group-hover:scale-105 transition-transform duration-300">
            <i className="ph-fill ph-hand-heart text-white dark:text-[#74C69D] text-3xl drop-shadow-md"></i>
          </div>
          
          <h3 className="text-white dark:text-[#E3ECE6] font-bold text-[18px] leading-tight mb-2 tracking-tight">Jadilah Saluran Berkat</h3>
          <p className="text-gray-300 dark:text-[#8D9F94] text-[12px] leading-relaxed mb-6 font-medium px-4">
            Dukungan Anda membantu Alkitab ID terus berkembang dan tetap bebas iklan.
          </p>
          
          <a href="https://saweria.co/tobiasilya" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 dark:bg-[#26372D] dark:hover:bg-[#2E4537] border border-white/10 dark:border-[#2E3F34] text-white dark:text-[#74C69D] px-7 py-3 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-2 active:scale-95">
            <span>Donasi via Saweria</span>
            <i className="ph-bold ph-arrow-up-right text-yellow-400 dark:text-[#74C69D] text-sm"></i>
          </a>
        </div>
      </div>

    </div>
  );
}