import { useState } from 'react';

const API_URL = 'https://bibleonbot-backend-staging.rchtxtdev.workers.dev/api';

export default function AdminTab({ triggerAction, refreshHomeData, news = [], communities = [], channels = [], dailyVerse }: any) {
  const [adminSection, setAdminSection] = useState<'daily' | 'community' | 'channel' | 'news'>('daily');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dvRef, setDvRef] = useState(''); 
  const [dvText, setDvText] = useState('');
  
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState(''); 
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState(''); 
  const [formImage, setFormImage] = useState('');

  const openModal = (item?: any) => {
    if (item) {
      setEditId(item.id);
      if (adminSection === 'news') {
        setFormName(item.title); setFormDesc(item.category); setFormLink(item.link); setFormImage(item.image_url);
      } else if (adminSection === 'community') {
        setFormName(item.name); setFormDesc(item.category); setFormLink(item.link); setFormImage(item.member_count);
      } else {
        setFormName(item.name); setFormDesc(item.category); setFormLink(item.link);
      }
    } else {
      setEditId(null); setFormName(''); setFormDesc(''); setFormLink(''); setFormImage('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); };

  const saveDailyVerse = async () => {
    if (!dvRef || !dvText) return triggerAction('Harap isi referensi & teks!');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/daily-verse`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: dvRef, text: dvText }) });
      if ((await res.json()).success) { 
        triggerAction('Ayat Hari Ini Diperbarui!'); 
        await refreshHomeData(); 
        setDvRef(''); 
        setDvText(''); 
      }
    } catch (e) { 
      triggerAction('Gagal menyimpan.'); 
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin menghapus data ini?")) return;
    setIsLoading(true);
    try {
      const endpoint = adminSection === 'news' ? 'news' : 'community';
      await fetch(`${API_URL}/admin/${endpoint}?id=${id}`, { method: 'DELETE' });
      await refreshHomeData(); 
      triggerAction('Data dihapus!'); 
    } catch (e) { 
      triggerAction('Gagal menghapus.'); 
    }
    setIsLoading(false);
  };
  
  const handleSave = async () => {
    if (!formName || !formLink) return triggerAction('Lengkapi isian wajib!');
    setIsLoading(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      let payload = {};
      let endpoint = '';

      if (adminSection === 'news') {
        endpoint = 'news';
        payload = { id: editId, title: formName, category: formDesc, image_url: formImage, link: formLink };
      } else {
        endpoint = 'community';
        payload = { id: editId, name: formName, member_count: adminSection === 'community' ? formImage : '', category: formDesc, link: formLink, is_channel: adminSection === 'channel' ? 1 : 0 };
      }

      await fetch(`${API_URL}/admin/${endpoint}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      triggerAction(editId ? 'Data diperbarui!' : 'Data ditambahkan!');
      await refreshHomeData(); 
      closeModal();
    } catch (e) { 
      triggerAction('Gagal menyimpan.'); 
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-fadeIn px-5 pt-5 space-y-5 pb-10">
      <div className="mb-4">
        <h2 className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-[#E3ECE6]">Kelola Aplikasi</h2>
        <p className="text-[13px] text-gray-500 dark:text-[#8D9F94] font-medium mt-1">Pilih kategori untuk mengedit data Beranda.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setAdminSection('daily')} className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition shadow-sm ${adminSection === 'daily' ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] dark:border dark:border-[#74C69D]' : 'bg-white dark:bg-[#1E2A23] text-gray-500 dark:text-[#8D9F94] border border-gray-200 dark:border-[#2E3F34]'}`}>Ayat Harian</button>
        <button onClick={() => setAdminSection('community')} className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition shadow-sm ${adminSection === 'community' ? 'bg-blue-600 dark:bg-[#26372D] text-white dark:text-[#74C69D] dark:border dark:border-[#74C69D]' : 'bg-white dark:bg-[#1E2A23] text-gray-500 dark:text-[#8D9F94] border border-gray-200 dark:border-[#2E3F34]'}`}>Komunitas</button>
        <button onClick={() => setAdminSection('channel')} className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition shadow-sm ${adminSection === 'channel' ? 'bg-purple-600 dark:bg-[#26372D] text-white dark:text-[#74C69D] dark:border dark:border-[#74C69D]' : 'bg-white dark:bg-[#1E2A23] text-gray-500 dark:text-[#8D9F94] border border-gray-200 dark:border-[#2E3F34]'}`}>Channel</button>
        <button onClick={() => setAdminSection('news')} className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition shadow-sm ${adminSection === 'news' ? 'bg-orange-600 dark:bg-[#26372D] text-white dark:text-[#74C69D] dark:border dark:border-[#74C69D]' : 'bg-white dark:bg-[#1E2A23] text-gray-500 dark:text-[#8D9F94] border border-gray-200 dark:border-[#2E3F34]'}`}>Berita</button>
      </div>
      <div className="bg-white dark:bg-[#1E2A23] rounded-2xl border border-gray-200 dark:border-[#2E3F34] shadow-sm p-4 min-h-[300px]">
        {adminSection === 'daily' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-gray-50 dark:bg-[#17211C] rounded-xl border border-gray-100 dark:border-[#2E3F34]">
              <p className="text-[10px] font-bold text-gray-400 dark:text-[#8D9F94] uppercase tracking-widest mb-1">Tampil Saat Ini:</p>
              <p className="text-[13px] font-bold text-gray-900 dark:text-[#74C69D]">{dailyVerse?.verse_reference || 'Belum diatur'}</p>
              <p className="text-[13px] text-gray-700 dark:text-[#E3ECE6] mt-1 italic">"{dailyVerse?.verse_text || '-'}"</p>
            </div>
            <input value={dvRef} onChange={(e) => setDvRef(e.target.value)} type="text" placeholder="Referensi (Cth: Yohanes 3:16)" className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
            <textarea value={dvText} onChange={(e) => setDvText(e.target.value)} placeholder="Teks firman..." rows={3} className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition"></textarea>
            <button onClick={saveDailyVerse} disabled={isLoading} className="w-full py-3.5 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#74C69D] font-bold text-[13px] rounded-xl active:scale-95 transition hover:bg-black dark:hover:bg-[#2E4537]">Perbarui Ayat Hari Ini</button>
          </div>
        )}

        {adminSection !== 'daily' && (
          <div className="animate-fadeIn flex flex-col h-full">
            <button onClick={() => openModal()} className="w-full py-3 mb-4 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#2E3F34] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition hover:bg-black dark:hover:bg-[#2E4537]">
              <i className="ph-bold ph-plus"></i> Tambah Data Baru
            </button>
            <div className="space-y-3 flex-1">
              {adminSection === 'community' && communities.map((c: any) => (
                <div key={c.id} className="p-3 border border-gray-100 dark:border-[#2E3F34] rounded-xl bg-[#fafafa] dark:bg-[#17211C] flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[13px] text-gray-900 dark:text-[#E3ECE6]">{c.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#8D9F94]">{c.category} &bull; {c.member_count}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(c)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-blue-600 dark:text-[#74C69D] hover:bg-blue-50 dark:hover:bg-[#2E4537] transition"><i className="ph-bold ph-pencil-simple"></i></button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-red-500 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 transition"><i className="ph-bold ph-trash"></i></button>
                  </div>
                </div>
              ))}
              {adminSection === 'channel' && channels.map((c: any) => (
                <div key={c.id} className="p-3 border border-gray-100 dark:border-[#2E3F34] rounded-xl bg-[#fafafa] dark:bg-[#17211C] flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-[13px] text-gray-900 dark:text-[#E3ECE6]">{c.name}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#8D9F94] line-clamp-1">{c.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(c)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-blue-600 dark:text-[#74C69D] hover:bg-blue-50 dark:hover:bg-[#2E4537] transition"><i className="ph-bold ph-pencil-simple"></i></button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-red-500 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 transition"><i className="ph-bold ph-trash"></i></button>
                  </div>
                </div>
              ))}
              {adminSection === 'news' && news.map((c: any) => (
                <div key={c.id} className="p-3 border border-gray-100 dark:border-[#2E3F34] rounded-xl bg-[#fafafa] dark:bg-[#17211C] flex justify-between items-center group">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-[13px] text-gray-900 dark:text-[#E3ECE6] line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#8D9F94]">{c.category}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openModal(c)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-blue-600 dark:text-[#74C69D] hover:bg-blue-50 dark:hover:bg-[#2E4537] transition"><i className="ph-bold ph-pencil-simple"></i></button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 bg-white dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full flex items-center justify-center text-red-500 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 transition"><i className="ph-bold ph-trash"></i></button>
                  </div>
                </div>
              ))}
              {((adminSection === 'community' && communities.length === 0) || (adminSection === 'channel' && channels.length === 0) || (adminSection === 'news' && news.length === 0)) && (
                <p className="text-[12px] text-gray-400 dark:text-[#8D9F94] text-center italic py-4">Data masih kosong.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-fadeIn" onClick={closeModal}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E2A23] w-full max-w-[500px] max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] p-6 shadow-2xl flex flex-col border-t border-x border-gray-200 dark:border-[#2E3F34] animate-[sheetSlideUp_0.25s_cubic-bezier(0.16,1,0.3,1)] no-scrollbar"
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-[#2E3F34] rounded-full mx-auto mb-4 shrink-0"></div>
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-[#E3ECE6]">{editId ? 'Edit Data' : 'Tambah Data Baru'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#26372D] flex items-center justify-center text-gray-600 dark:text-[#8D9F94] transition hover:bg-gray-200 dark:hover:bg-[#2E4537]">
                <i className="ph-bold ph-x text-sm"></i>
              </button>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-[#8D9F94] uppercase tracking-widest pl-1">{adminSection === 'news' ? 'Judul Artikel' : 'Nama'}</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} type="text" placeholder={adminSection === 'news' ? "Cth: Memahami Kasih Allah..." : "Cth: Komunitas Doa Pagi"} className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3.5 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-[#8D9F94] uppercase tracking-widest pl-1">Kategori / Deskripsi</label>
                <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} type="text" placeholder={adminSection === 'news' ? "Cth: ARTIKEL" : "Cth: Doa Bersama"} className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3.5 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
              </div>
              
              {adminSection === 'news' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-[#8D9F94] uppercase tracking-widest pl-1">Link Cover Gambar</label>
                  <input value={formImage} onChange={(e) => setFormImage(e.target.value)} type="url" placeholder="Cth: https://.../image.jpg" className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3.5 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
                </div>
              )}
              
              {adminSection === 'community' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-[#8D9F94] uppercase tracking-widest pl-1">Jumlah Member</label>
                  <input value={formImage} onChange={(e) => setFormImage(e.target.value)} type="text" placeholder="Cth: 2.4k" className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3.5 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-[#8D9F94] uppercase tracking-widest pl-1">Link Tujuan (Sumber)</label>
                <input value={formLink} onChange={(e) => setFormLink(e.target.value)} type="url" placeholder="Cth: https://t.me/..." className="w-full bg-[#fafafa] dark:bg-[#17211C] border border-gray-200 dark:border-[#2E3F34] rounded-xl px-4 py-3.5 text-[13px] text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none focus:border-gray-400 dark:focus:border-[#74C69D] transition" />
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <button onClick={closeModal} className="flex-1 py-3.5 bg-gray-100 dark:bg-[#17211C] text-gray-700 dark:text-[#8D9F94] border border-transparent dark:border-[#2E3F34] rounded-xl font-bold text-[13px] hover:bg-gray-200 dark:hover:bg-[#26372D] transition">Batal</button>
              <button onClick={handleSave} disabled={isLoading} className="flex-1 py-3.5 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#74C69D] rounded-xl font-bold text-[13px] hover:bg-gray-800 dark:hover:bg-[#2E4537] transition">Simpan Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}