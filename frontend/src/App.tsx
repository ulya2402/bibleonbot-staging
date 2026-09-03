import { useState, useEffect, useRef, useMemo } from 'react';
import type { UIEvent } from 'react';
import HomeTab from './tabs/HomeTab';
import BibleTab from './tabs/BibleTab';
import SavedTab from './tabs/SavedTab';
import AdminTab from './tabs/AdminTab';
import DiscoverTab from './tabs/DiscoverTab';
import { 
  BIBLE_LANGUAGES, 
  ALL_BIBLE_VERSIONS, 
  DEFAULT_BIBLE_VERSION,
  PRESET_LABELS,
  parseLabels
} from './types/bible';
import type { BibleVersion, VerseLabel } from './types/bible';

const API_URL = 'https://bibleonbot-backend-staging.rchtxtdev.workers.dev/api';
const ADMIN_ID = 8189771306;

// PERBAIKAN FATAL: Menyamakan singkatan (id) dengan tb.csv agar ayat 100% muncul
const BIBLE_BOOKS = [
  { id: 'Kej', name: 'Kejadian', chapters: 50, test: 'PL' }, { id: 'Kel', name: 'Keluaran', chapters: 40, test: 'PL' },
  { id: 'Ima', name: 'Imamat', chapters: 27, test: 'PL' }, { id: 'Bil', name: 'Bilangan', chapters: 36, test: 'PL' },
  { id: 'Ula', name: 'Ulangan', chapters: 34, test: 'PL' }, { id: 'Yos', name: 'Yosua', chapters: 24, test: 'PL' },
  { id: 'Hak', name: 'Hakim-hakim', chapters: 21, test: 'PL' }, { id: 'Rut', name: 'Rut', chapters: 4, test: 'PL' },
  { id: '1Sa', name: '1 Samuel', chapters: 31, test: 'PL' }, { id: '2Sa', name: '2 Samuel', chapters: 24, test: 'PL' },
  { id: '1Ra', name: '1 Raja-raja', chapters: 22, test: 'PL' }, { id: '2Ra', name: '2 Raja-raja', chapters: 25, test: 'PL' },
  { id: '1Ta', name: '1 Tawarikh', chapters: 29, test: 'PL' }, { id: '2Ta', name: '2 Tawarikh', chapters: 36, test: 'PL' },
  { id: 'Ezr', name: 'Ezra', chapters: 10, test: 'PL' }, { id: 'Neh', name: 'Nehemia', chapters: 13, test: 'PL' },
  { id: 'Est', name: 'Ester', chapters: 10, test: 'PL' }, { id: 'Ayb', name: 'Ayub', chapters: 42, test: 'PL' },
  { id: 'Mzm', name: 'Mazmur', chapters: 150, test: 'PL' }, { id: 'Ams', name: 'Amsal', chapters: 31, test: 'PL' },
  { id: 'Pkh', name: 'Pengkhotbah', chapters: 12, test: 'PL' }, { id: 'Kid', name: 'Kidung Agung', chapters: 8, test: 'PL' },
  { id: 'Yes', name: 'Yesaya', chapters: 66, test: 'PL' }, { id: 'Yer', name: 'Yeremia', chapters: 52, test: 'PL' },
  { id: 'Rat', name: 'Ratapan', chapters: 5, test: 'PL' }, { id: 'Yeh', name: 'Yehezkiel', chapters: 48, test: 'PL' },
  { id: 'Dan', name: 'Daniel', chapters: 12, test: 'PL' }, { id: 'Hos', name: 'Hosea', chapters: 14, test: 'PL' },
  { id: 'Yoe', name: 'Yoel', chapters: 3, test: 'PL' }, { id: 'Amo', name: 'Amos', chapters: 9, test: 'PL' },
  { id: 'Oba', name: 'Obaja', chapters: 1, test: 'PL' }, { id: 'Yun', name: 'Yunus', chapters: 4, test: 'PL' },
  { id: 'Mik', name: 'Mikha', chapters: 7, test: 'PL' }, { id: 'Nah', name: 'Nahum', chapters: 3, test: 'PL' },
  { id: 'Hab', name: 'Habakuk', chapters: 3, test: 'PL' }, { id: 'Zef', name: 'Zefanya', chapters: 3, test: 'PL' },
  { id: 'Hag', name: 'Hagai', chapters: 2, test: 'PL' }, { id: 'Zak', name: 'Zakharia', chapters: 14, test: 'PL' },
  { id: 'Mal', name: 'Maleakhi', chapters: 4, test: 'PL' },
  { id: 'Mat', name: 'Matius', chapters: 28, test: 'PB' }, { id: 'Mrk', name: 'Markus', chapters: 16, test: 'PB' },
  { id: 'Luk', name: 'Lukas', chapters: 24, test: 'PB' }, { id: 'Yoh', name: 'Yohanes', chapters: 21, test: 'PB' },
  { id: 'Kis', name: 'Kisah Para Rasul', chapters: 28, test: 'PB' }, { id: 'Rom', name: 'Roma', chapters: 16, test: 'PB' },
  { id: '1Ko', name: '1 Korintus', chapters: 16, test: 'PB' }, { id: '2Ko', name: '2 Korintus', chapters: 13, test: 'PB' },
  { id: 'Gal', name: 'Galatia', chapters: 6, test: 'PB' }, { id: 'Efe', name: 'Efesus', chapters: 6, test: 'PB' },
  { id: 'Flp', name: 'Filipi', chapters: 4, test: 'PB' }, { id: 'Kol', name: 'Kolose', chapters: 4, test: 'PB' },
  { id: '1Te', name: '1 Tesalonika', chapters: 5, test: 'PB' }, { id: '2Te', name: '2 Tesalonika', chapters: 3, test: 'PB' },
  { id: '1Ti', name: '1 Timotius', chapters: 6, test: 'PB' }, { id: '2Ti', name: '2 Timotius', chapters: 4, test: 'PB' },
  { id: 'Tit', name: 'Titus', chapters: 3, test: 'PB' }, { id: 'Flm', name: 'Filemon', chapters: 1, test: 'PB' },
  { id: 'Ibr', name: 'Ibrani', chapters: 13, test: 'PB' }, { id: 'Yak', name: 'Yakobus', chapters: 5, test: 'PB' },
  { id: '1Pt', name: '1 Petrus', chapters: 5, test: 'PB' }, { id: '2Pt', name: '2 Petrus', chapters: 3, test: 'PB' },
  { id: '1Yo', name: '1 Yohanes', chapters: 5, test: 'PB' }, { id: '2Yo', name: '2 Yohanes', chapters: 1, test: 'PB' },
  { id: '3Yo', name: '3 Yohanes', chapters: 1, test: 'PB' }, { id: 'Yud', name: 'Yudas', chapters: 1, test: 'PB' },
  { id: 'Why', name: 'Wahyu', chapters: 22, test: 'PB' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('bible_theme');
      if (savedTheme) return savedTheme === 'dark';
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.colorScheme) return tg.colorScheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setIsDark(prev => {
      const nextState = !prev;
      try {
        localStorage.setItem('bible_theme', nextState ? 'dark' : 'light');
      } catch (e) {}
      return nextState;
    });
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 280);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const targetColor = isDark ? '#17211C' : '#fafafa';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', targetColor);
    const metaScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaScheme) metaScheme.setAttribute('content', isDark ? 'dark' : 'light');

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      try { tg.setHeaderColor?.(targetColor); } catch (e) {}
      try { tg.setBackgroundColor?.(targetColor); } catch (e) {}
    }
  }, [isDark]);

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(true);
  const [userId, setUserId] = useState<string>(ADMIN_ID.toString());
  const [userName, setUserName] = useState<string>('Pengguna');
  
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [savedVerses, setSavedVerses] = useState<any[]>([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  
  const [currentBook, setCurrentBook] = useState(BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVersion, setCurrentVersion] = useState<BibleVersion>(() => {
    const savedVerId = localStorage.getItem('bible_preferred_version');
    const matched = ALL_BIBLE_VERSIONS.find(v => v.id === savedVerId);
    return matched || DEFAULT_BIBLE_VERSION;
  });
  const [bibleVerses, setBibleVerses] = useState<any[]>([]);
  const [isLoadingBible, setIsLoadingBible] = useState(false);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorStep, setSelectorStep] = useState<'book' | 'chapter' | 'version'>('book');
  const [tempSelectedBook, setTempSelectedBook] = useState(BIBLE_BOOKS[0]);

  const closeSelector = () => {
    setIsSelectorOpen(false);
    setSelectorStep('book');
  };
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [noteSheetData, setNoteSheetData] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isNoteRefExpanded, setIsNoteRefExpanded] = useState(false);

  const [isLabelPaletteOpen, setIsLabelPaletteOpen] = useState(false);
  const [isCreateLabelOpen, setIsCreateLabelOpen] = useState(false);
  const [isLabelPageLoading, setIsLabelPageLoading] = useState(true);
  const [isEditingCustomLabels, setIsEditingCustomLabels] = useState(false);
  const [customLabelInput, setCustomLabelInput] = useState('');
  const createLabelInputRef = useRef<HTMLInputElement | null>(null);
  const customLabelHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCustomLabelHeld = useRef(false);
  const [availableCustomLabels, setAvailableCustomLabels] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('bible_custom_labels');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (isCreateLabelOpen) {
      setIsLabelPageLoading(true);
      const loadTimer = setTimeout(() => {
        setIsLabelPageLoading(false);
      }, 1400);
      return () => clearTimeout(loadTimer);
    }
  }, [isCreateLabelOpen]);

  useEffect(() => {
    if (isCreateLabelOpen && !isLabelPageLoading) {
      const focusTimer = setTimeout(() => {
        createLabelInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [isCreateLabelOpen, isLabelPageLoading]);

  const closeCreateLabelSheet = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsCreateLabelOpen(false);
    setCustomLabelInput('');
    setIsLabelPageLoading(true);
  };

  const handleCustomLabelPressStart = () => {
    isCustomLabelHeld.current = false;
    customLabelHoldTimer.current = setTimeout(() => {
      isCustomLabelHeld.current = true;
      if (navigator.vibrate) navigator.vibrate(40);
      setIsEditingCustomLabels(true);
    }, 400);
  };

  const handleCustomLabelPressEnd = () => {
    if (customLabelHoldTimer.current) {
      clearTimeout(customLabelHoldTimer.current);
    }
  };

  const handleDeleteCustomLabel = (labelName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tg = (window as any).Telegram?.WebApp;
    const performDelete = () => {
      const next = availableCustomLabels.filter(c => c.toLowerCase() !== labelName.toLowerCase());
      setAvailableCustomLabels(next);
      try {
        localStorage.setItem('bible_custom_labels', JSON.stringify(next));
      } catch (err) {}
      if (next.filter(c => !PRESET_LABELS.some(p => p.name.toLowerCase() === c.toLowerCase())).length === 0) {
        setIsEditingCustomLabels(false);
      }
      setTimeout(() => triggerAction('Label dihapus!'), 160);
    };

    if (tg && typeof tg.showConfirm === 'function') {
      tg.showConfirm(`Hapus label "${labelName}"?`, (confirmed: boolean) => {
        if (confirmed) performDelete();
      });
    } else {
      if (confirm(`Hapus label "${labelName}"?`)) {
        performDelete();
      }
    }
  };

  const activeLabelsForSelected = useMemo(() => {
    const selectedObjs = bibleVerses.filter(bv => selectedVerses.includes(bv.id));
    const labelSet = new Set<string>();
    selectedObjs.forEach(v => {
      const match = savedVerses.find((sv: any) =>
        String(sv.book).toLowerCase() === String(currentBook.name).toLowerCase() &&
        Number(sv.chapter) === Number(currentChapter) &&
        Number(sv.verse) === Number(v.verse)
      );
      if (match && match.labels) {
        parseLabels(match.labels).forEach((lbl: string) => labelSet.add(lbl));
      }
    });
    return labelSet;
  }, [bibleVerses, selectedVerses, savedVerses, currentBook, currentChapter]);

  const handleToggleLabelQuick = (labelName: string) => {
    const nextSet = new Set<string>(activeLabelsForSelected);
    if (nextSet.has(labelName)) {
      nextSet.delete(labelName);
    } else {
      nextSet.add(labelName);
    }
    saveVerseData(null, null, Array.from<string>(nextSet));
  };

  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bible_recent_colors');
      return saved ? JSON.parse(saved) : ['yellow', 'green', 'blue'];
    } catch (e) {
      return ['yellow', 'green', 'blue'];
    }
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const isNavVisibleRef = useRef(true);
  const lastScrollY = useRef(0);
  const scrollRafId = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  
  useEffect(() => {
    return () => {
      if (scrollRafId.current !== null) {
        cancelAnimationFrame(scrollRafId.current);
      }
    };
  }, []);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isColorHeld = useRef(false);

  const ALL_HIGHLIGHT_COLORS = [
    { id: 'yellow', bg: 'bg-amber-300' },
    { id: 'green', bg: 'bg-emerald-300' },
    { id: 'blue', bg: 'bg-sky-300' },
    { id: 'pink', bg: 'bg-rose-300' },
    { id: 'purple', bg: 'bg-purple-300' },
    { id: 'orange', bg: 'bg-orange-300' },
    { id: 'teal', bg: 'bg-teal-300' },
    { id: 'indigo', bg: 'bg-indigo-300' },
  ];

  const handleMainScroll = (e: UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (scrollRafId.current !== null) return;

    scrollRafId.current = requestAnimationFrame(() => {
      const scrollDifference = currentScrollY - lastScrollY.current;
      let nextNavState = isNavVisibleRef.current;

      if (currentScrollY <= 30) {
        nextNavState = true;
      } else if (scrollDifference > 8 && currentScrollY > 60) {
        nextNavState = false;
      } else if (scrollDifference < -8) {
        nextNavState = true;
      }

      if (nextNavState !== isNavVisibleRef.current) {
        isNavVisibleRef.current = nextNavState;
        setIsNavVisible(nextNavState);
      }

      lastScrollY.current = currentScrollY;
      scrollRafId.current = null;
    });
  };

  const fetchHomeData = async () => {
    try {
      setIsLoadingHome(true);
      const resHome = await fetch(`${API_URL}/home?t=${new Date().getTime()}`);
      if (resHome.ok) {
        const data = await resHome.json();
        setDailyVerse(data.dailyVerse);
        setCommunities(data.communities || []);
        setChannels(data.channels || []);
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Fetch Home Data Error:', error);
    } finally {
      setIsLoadingHome(false);
    }
  };

  const fetchSavedData = async () => {
    try {
      const res = await fetch(`${API_URL}/saved-verses?userId=${userId}&t=${new Date().getTime()}`);
      if (res.ok) setSavedVerses(await res.json());
    } catch (error) {
      console.error('Fetch Saved Data Error:', error);
    }
  };

  useEffect(() => {
    let cleanupInsets: (() => void) | undefined;
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        try { tg.enableClosingConfirmation?.(); } catch (e) {}
        try { if (!tg.isVersionAtLeast || tg.isVersionAtLeast('8.0')) { tg.requestFullscreen?.(); tg.disableVerticalSwipes?.(); } } catch (e) {}
        const initialBg = isDark ? '#17211C' : '#fafafa';
        try { tg.setHeaderColor?.(initialBg); tg.setBackgroundColor?.(initialBg); } catch (e) {}

        const applyInsets = () => {
          const root = document.documentElement.style;
          const safe = tg.safeAreaInset || {};
          const content = tg.contentSafeAreaInset || {};
          root.setProperty('--tg-safe-top', `${safe.top || 0}px`);
          root.setProperty('--tg-safe-bottom', `${safe.bottom || 0}px`);
          root.setProperty('--tg-content-top', `${content.top || 0}px`);
          root.setProperty('--tg-content-bottom', `${content.bottom || 0}px`);
        };
        applyInsets();
        tg.onEvent?.('safeAreaChanged', applyInsets);
        tg.onEvent?.('contentSafeAreaChanged', applyInsets);
        tg.onEvent?.('viewportChanged', applyInsets);

        const currentUserId = tg.initDataUnsafe?.user?.id?.toString();
        const firstName = tg.initDataUnsafe?.user?.first_name;

        if (firstName) setUserName(firstName);
        if (currentUserId) { setUserId(currentUserId); setIsAdmin(Number(currentUserId) === ADMIN_ID); }

        // Ambil data bacaan terakhir dari Telegram CloudStorage saat app pertama dibuka
        if (tg.CloudStorage) {
          tg.CloudStorage.getItem('alkitab_last_read', (error: any, value: string | null) => {
            if (!error && value) {
              try {
                const data = JSON.parse(value);
                const found = BIBLE_BOOKS.find(
                  (b) => b.id === data.bookId || b.name === data.bookName
                );
                if (found) setCurrentBook(found);
                if (data.chapter) setCurrentChapter(Number(data.chapter));
              } catch (e) {}
            }
          });
        }

        cleanupInsets = () => {
          tg.offEvent?.('safeAreaChanged', applyInsets);
          tg.offEvent?.('contentSafeAreaChanged', applyInsets);
          tg.offEvent?.('viewportChanged', applyInsets);
        };
      }
    } catch (error) {}

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);

    fetchHomeData();
    return () => {
      if (cleanupInsets) cleanupInsets();
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Simpan otomatis setiap kali berpindah kitab atau pasal
  useEffect(() => {
    if (!currentBook) return;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.CloudStorage) {
      const payload = JSON.stringify({
        bookId: currentBook.id,
        bookName: currentBook.name,
        chapter: currentChapter
      });
      tg.CloudStorage.setItem('alkitab_last_read', payload);
    }
  }, [currentBook, currentChapter]);

  useEffect(() => {
    fetchSavedData();
  }, [userId, activeTab]);

  const closeNoteSheet = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsNoteSheetOpen(false);
    setNoteSheetData(null);
  };


  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.BackButton) return;
    const handleBack = () => {
      if (isCreateLabelOpen) {
        closeCreateLabelSheet();
      } else if (isEditingCustomLabels) {
        setIsEditingCustomLabels(false);
      } else if (isSelectorOpen) {
        closeSelector();
      } else if (isNoteSheetOpen) {
        closeNoteSheet();
      } else if (isLabelPaletteOpen) {
        setIsLabelPaletteOpen(false);
      } else if (isColorPaletteOpen) {
        setIsColorPaletteOpen(false);
      } else if (selectedVerses.length > 0) {
        setSelectedVerses([]);
      }
    };

    if (isCreateLabelOpen || isEditingCustomLabels || isSelectorOpen || isNoteSheetOpen || isLabelPaletteOpen || isColorPaletteOpen || selectedVerses.length > 0) {
      tg.BackButton.show();
      tg.onEvent('backButtonClicked', handleBack);
    } else {
      tg.BackButton.hide();
      tg.offEvent('backButtonClicked', handleBack);
    }

    return () => {
      tg.BackButton.hide();
      tg.offEvent('backButtonClicked', handleBack);
    };
  }, [isCreateLabelOpen, isSelectorOpen, isNoteSheetOpen, isLabelPaletteOpen, isColorPaletteOpen, selectedVerses.length]);

  useEffect(() => {
    if (currentVersion.testamentScope === 'NT' && currentBook.test === 'PL') {
      const defaultNTBook = BIBLE_BOOKS.find(b => b.test === 'PB') || BIBLE_BOOKS[39];
      setCurrentBook(defaultNTBook);
      setCurrentChapter(1);
    }
  }, [currentVersion]);

  useEffect(() => {
    const fetchBibleVerses = async () => {
      setIsLoadingBible(true); setBibleVerses([]); 
      try {
        const resBible = await fetch(`${API_URL}/bible?book=${currentBook.id}&chapter=${currentChapter}&version=${currentVersion.id}`);
        if (resBible.ok) setBibleVerses(await resBible.json());
      } catch (error) {
        console.error('Fetch Bible Verses Error:', error);
      } finally { 
        setIsLoadingBible(false); 
      }
    };
    fetchBibleVerses();
    if (mainRef.current) mainRef.current.scrollTop = 0;
    setIsNavVisible(true);
  }, [currentBook, currentChapter, currentVersion]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.verse-item') && !target.closest('.action-menu') && selectedVerses.length > 0 && !isNoteSheetOpen && !isCreateLabelOpen) {
        setSelectedVerses([]);
        setIsColorPaletteOpen(false);
        setIsLabelPaletteOpen(false);
        setIsEditingCustomLabels(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedVerses, isNoteSheetOpen, isCreateLabelOpen]);

  const handleVerseSelect = (verseId: number) => {
    setSelectedVerses(prev => prev.includes(verseId) ? prev.filter(id => id !== verseId) : [...prev, verseId]);
    setIsColorPaletteOpen(false);
    setIsLabelPaletteOpen(false);
  };

  const handleTouchStart = (verseId: number) => {
    pressTimer.current = setTimeout(() => {
      handleVerseSelect(verseId);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 400);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleColorPressStart = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    isColorHeld.current = false;
    colorHoldTimer.current = setTimeout(() => {
      isColorHeld.current = true;
      setIsColorPaletteOpen(true);
      if (navigator.vibrate) navigator.vibrate(40);
    }, 300);
  };

  const handleColorPressEnd = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (colorHoldTimer.current) clearTimeout(colorHoldTimer.current);
  };

  const handleColorClick = (e: React.MouseEvent, colorId: string) => {
    e.stopPropagation();
    if (isColorHeld.current) {
      isColorHeld.current = false;
      return;
    }
    saveVerseData(colorId, null);
  };

  const triggerAction = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const openNoteSheet = (explicitData?: any) => {
    if (explicitData) {
      const items = explicitData.items || [{
        verse: explicitData.verse,
        text: String(explicitData.content).replace(/^[\u00B6\s]+/, '').replace(/<t\s*\/>/g, '').trim()
      }];
      setNoteSheetData({
        ...explicitData,
        items
      });
      setNoteInput(explicitData.note || '');
      setIsNoteSheetOpen(true);
      return;
    }
    if (selectedVerses.length === 0) return;
    let existingNote = '';
    const selectedVerseObjects = bibleVerses
      .filter(bv => selectedVerses.includes(bv.id))
      .sort((a, b) => a.verse - b.verse);
    const verseNumbers = selectedVerseObjects.map(v => v.verse).join(', ');
    const combinedContent = selectedVerseObjects.map(v => v.content.replace(/^[\u00B6\s]+/, '').replace(/<t\s*\/>/g, '').trim()).join(' ');
    const items = selectedVerseObjects.map(v => ({
      verse: v.verse,
      text: v.content.replace(/^[\u00B6\s]+/, '').trim()
    }));
    if (selectedVerses.length === 1) {
      const v = selectedVerseObjects[0];
      if (v) {
        const match = savedVerses.find(sv => String(sv.book) === String(currentBook.name) && String(sv.chapter) === String(currentChapter) && String(sv.verse) === String(v.verse));
        if (match && match.note) existingNote = match.note;
      }
    }
    setNoteSheetData({
      book: currentBook.name,
      chapter: currentChapter,
      verse: verseNumbers,
      content: combinedContent,
      items: items,
      note: existingNote
    });
    setNoteInput(existingNote);
    setIsNoteSheetOpen(true);
  };

  const handleAddCustomLabel = () => {
    const trimmed = customLabelInput.trim();
    if (!trimmed) return;
    if (!PRESET_LABELS.some((p: VerseLabel) => p.name.toLowerCase() === trimmed.toLowerCase()) && !availableCustomLabels.includes(trimmed)) {
      const updated = [...availableCustomLabels, trimmed];
      setAvailableCustomLabels(updated);
      try { localStorage.setItem('bible_custom_labels', JSON.stringify(updated)); } catch (e) {}
    }
    const nextLabels = Array.from(new Set([...Array.from(activeLabelsForSelected), trimmed]));
    saveVerseData(null, null, nextLabels);
    setCustomLabelInput('');
    closeCreateLabelSheet();
  };  

  const saveVerseData = async (
    colorParam: string | null = null,
    noteParam: string | null = null,
    labelsParam: string[] | string | null = null
  ) => {
    let targetVerses = bibleVerses.filter(v => selectedVerses.includes(v.id));
    const targetBookName = noteSheetData?.book || currentBook.name;
    const targetChapterNum = noteSheetData?.chapter || currentChapter;

    if (targetVerses.length === 0 && noteSheetData) {
      const activeSheetData = noteSheetData;
      if (activeSheetData.items && activeSheetData.items.length > 0) {
        targetVerses = activeSheetData.items.map((it: any) => {
          const match = bibleVerses.find(v => String(v.verse) === String(it.verse));
          return match || { verse: it.verse, content: it.text };
        });
      } else {
        const singleVerse = bibleVerses.find(v => String(v.verse) === String(activeSheetData.verse));
        if (singleVerse) {
          targetVerses = [singleVerse];
        } else {
          targetVerses = [{
            verse: activeSheetData.verse,
            content: activeSheetData.content
          }];
        }
      }
    }

    if (targetVerses.length === 0) return;
    if (colorParam) {
      setRecentColors(prev => {
        const next = [colorParam, ...prev.filter(c => c !== colorParam)].slice(0, 3);
        try { localStorage.setItem('bible_recent_colors', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }

    const newSavedVerses = [...savedVerses];
    const fetchPromises: Promise<any>[] = [];

    try {
      for (const v of targetVerses) {
        const existingIndex = newSavedVerses.findIndex(
          sv => String(sv.book) === String(targetBookName) &&
                String(sv.chapter) === String(targetChapterNum) &&
                String(sv.verse) === String(v.verse)
        );
        const existing = existingIndex >= 0 ? newSavedVerses[existingIndex] : null;
        const finalColor = colorParam !== null ? colorParam : (existing?.color || '');
        const finalNote = noteParam !== null ? noteParam : (existing?.note || '');
        const finalLabels = labelsParam !== null 
          ? (Array.isArray(labelsParam) ? labelsParam.join(', ') : labelsParam)
          : (existing?.labels || '');

        if (existing && existing.color === finalColor && existing.note === finalNote && existing.labels === finalLabels) {
          continue;
        }

        const isCompletelyEmpty = (!finalColor || finalColor.trim() === '') && (!finalNote || finalNote.trim() === '') && (!finalLabels || finalLabels.trim() === '');

        if (isCompletelyEmpty) {
          if (existingIndex >= 0) {
            newSavedVerses.splice(existingIndex, 1);
          }
          if (existing?.id) {
            fetchPromises.push(
              fetch(`${API_URL}/saved-verses?id=${existing.id}&t=${Date.now()}`, {
                method: 'DELETE'
              })
            );
          }
          continue;
        }

        const payload = {
          id: existing?.id,
          user_id: String(userId),
          book: String(targetBookName),
          chapter: Number(targetChapterNum),
          verse: Number(v.verse),
          content: String(v.content).replace(/^¶\s*/, '').replace(/<t\s*\/>/g, ''),
          color: String(finalColor),
          note: String(finalNote),
          version: String(currentVersion.shortName || 'AYT'),
          labels: String(finalLabels),
          created_at: new Date().toISOString()
        };

        if (existingIndex >= 0) newSavedVerses[existingIndex] = { ...newSavedVerses[existingIndex], ...payload };
        else newSavedVerses.unshift({ ...payload, id: Date.now() + Math.random() });

        fetchPromises.push(
          fetch(`${API_URL}/saved-verses?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        );
      }

      setSavedVerses(newSavedVerses);
      
      if (labelsParam !== null) {
        triggerAction('Label diperbarui!');
      } else if (noteParam !== null) {
        closeNoteSheet();
        setTimeout(() => triggerAction('Catatan tersimpan!'), 160);
        setNoteInput('');
        setSelectedVerses([]);
      } else {
        triggerAction(colorParam === '' ? 'Warna dihapus!' : 'Warna diterapkan!');
      }

      setIsColorPaletteOpen(false);
      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }
    } catch (e: any) {
      triggerAction("Gagal menyambung ke server.");
    }
  };

  const formatSelectedVersesText = (quoteStyle = false) => {
    const selectedObjects = bibleVerses
      .filter(v => selectedVerses.includes(v.id))
      .sort((a, b) => a.verse - b.verse);

    if (selectedObjects.length === 0) return '';

    const toSuperscript = (num: number) => {
      const map: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
      };
      return String(num).split('').map(d => map[d] || d).join('');
    };

    const verseNums = selectedObjects.map(v => v.verse);
    const ranges: string[] = [];
    let start = verseNums[0];
    let end = start;

    for (let i = 1; i < verseNums.length; i++) {
      if (verseNums[i] === end + 1) {
        end = verseNums[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = verseNums[i];
        end = start;
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    const rangeStr = ranges.join(', ');

    let combinedBody = '';
    if (selectedObjects.length === 1) {
      combinedBody = selectedObjects[0].content.replace(/^ \s*/, '').trim();
    } else {
      combinedBody = selectedObjects
        .map(v => `${toSuperscript(v.verse)} ${v.content.replace(/^ \s*/, '').trim()}`)
        .join(' ');
    }

    if (quoteStyle) {
      return `> "${combinedBody}"\n> — ${currentBook.name} ${currentChapter}:${rangeStr} (${currentVersion.shortName})\n\n@bibleonbot`;
    }

    return `"${combinedBody}"\n— ${currentBook.name} ${currentChapter}:${rangeStr} (${currentVersion.shortName})\n\n@bibleonbot`;
  };

  const handleShare = async () => {
    const selectedObjects = bibleVerses
      .filter(v => selectedVerses.includes(v.id))
      .sort((a, b) => a.verse - b.verse);
    if (selectedObjects.length === 0) return;

    const verseNums = selectedObjects.map(v => v.verse);
    const ranges: string[] = [];
    let start = verseNums[0];
    let end = start;
    for (let i = 1; i < verseNums.length; i++) {
      if (verseNums[i] === end + 1) {
        end = verseNums[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = verseNums[i];
        end = start;
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    const rangeStr = ranges.join(', ');

    const items = selectedObjects.map(v => ({
      verse: v.verse,
      text: v.content.replace(/^ \s*/, '').trim()
    }));

    let existingNote = '';
    if (selectedVerses.length === 1) {
      const match = savedVerses.find(sv => String(sv.book) === String(currentBook.name) && String(sv.chapter) === String(currentChapter) && String(sv.verse) === String(selectedObjects[0].verse));
      if (match && match.note) existingNote = match.note;
    }

    try {
      const res = await fetch(`${API_URL}/share-verse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          book: currentBook.name,
          chapter: currentChapter,
          verses: rangeStr,
          version: currentVersion.shortName,
          items: items,
          note: existingNote
        })
      });

      if (res.ok) {
        triggerAction('Ayat terkirim ke chat!');
      } else {
        triggerAction('Gagal mengirim ayat.');
      }
    } catch (e) {
      triggerAction('Gagal mengirim ayat.');
    }

    setSelectedVerses([]);
    setIsColorPaletteOpen(false);
  };

  const handleCopy = async () => {
    const fullText = formatSelectedVersesText(false);
    if (!fullText) return;
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(fullText);
        copied = true;
      } catch (err) {
        console.error('Clipboard API Error:', err);
      }
    }
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback Copy Error:', err);
      }
    }
    triggerAction('Ayat disalin!');
    setSelectedVerses([]);
    setIsColorPaletteOpen(false);
  };

  const handleSelectVersion = (version: BibleVersion) => {
    setCurrentVersion(version);
    localStorage.setItem('bible_preferred_version', version.id);
    setIsSelectorOpen(false);
  };

  const handleNavigateToVerse = (bookName: string, chapter: number, verseNumber?: number) => {
    const matchedBook = BIBLE_BOOKS.find(
      b => b.name.toLowerCase() === String(bookName).toLowerCase() || b.id.toLowerCase() === String(bookName).toLowerCase()
    ) || BIBLE_BOOKS[0];
    setCurrentBook(matchedBook);
    setCurrentChapter(Number(chapter));
    if (verseNumber) {
      setHighlightedVerse(Number(verseNumber));
    }
    setActiveTab('bible');
    setSelectedVerses([]);
    setIsNavVisible(true);
  };

  const switchActiveTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedVerses([]);
    setIsNavVisible(true);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  const hasSelectedHighlight = selectedVerses.some(id => {
    const bv = bibleVerses.find(v => v.id === id);
    if (!bv) return false;
    return savedVerses.some(sv =>
      String(sv.book) === String(currentBook.name) &&
      String(sv.chapter) === String(currentChapter) &&
      String(sv.verse) === String(bv.verse) &&
      Boolean(sv.color)
    );
  });

  const availableBooks = currentVersion.testamentScope === 'NT'
    ? BIBLE_BOOKS.filter(b => b.test === 'PB')
    : BIBLE_BOOKS;

  const currentBookIndex = availableBooks.findIndex(b => b.id === currentBook.id);
  const canGoPrev = currentChapter > 1 || currentBookIndex > 0;
  const canGoNext = currentChapter < currentBook.chapters || currentBookIndex < availableBooks.length - 1;

  const goToPrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else if (currentBookIndex > 0) {
      const prevBook = availableBooks[currentBookIndex - 1];
      setCurrentBook(prevBook);
      setCurrentChapter(prevBook.chapters);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(prev => prev + 1);
    } else if (currentBookIndex < availableBooks.length - 1) {
      const nextBook = availableBooks[currentBookIndex + 1];
      setCurrentBook(nextBook);
      setCurrentChapter(1);
    }
  };

  return (
    <div id="app-container" className={`flex flex-col h-full bg-[#fafafa] dark:bg-[#17211C] text-gray-900 dark:text-[#E3ECE6] ${isDark ? 'dark' : ''}`}>
      {activeTab !== 'bible' && !isSelectorOpen && (
        <div 
          className="absolute top-0 left-0 right-0 bg-[#fafafa]/85 dark:bg-[#17211C]/85 backdrop-blur-xl z-[60] pointer-events-none transition-colors duration-250"
          style={{ height: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3rem)' }}
        />
      )}

      <main 
        ref={mainRef}
        onScroll={handleMainScroll}
        className={isSelectorOpen ? 'hidden' : 'flex-1 scroll-area no-scrollbar relative'} 
        style={{ 
          paddingTop: activeTab === 'bible' ? 0 : 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3rem)',
          paddingBottom: 'calc(max(var(--tg-safe-bottom, 0px), env(safe-area-inset-bottom, 0px)) + 7rem)'
        }}
      >
        {activeTab === 'home' && (
          <HomeTab 
            dailyVerse={dailyVerse} 
            communities={communities} 
            channels={channels} 
            news={news} 
            userName={userName} 
            isAdmin={isAdmin} 
            setActiveTab={setActiveTab}
            isDark={isDark}
            toggleTheme={toggleTheme}
            isLoadingHome={isLoadingHome}
          />
        )}
        
        {activeTab === 'bible' && (
          <BibleTab
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVersion={currentVersion}
            setSelectorStep={setSelectorStep}
            setIsSelectorOpen={setIsSelectorOpen}
            isLoadingBible={isLoadingBible}
            bibleVerses={bibleVerses}
            savedVerses={savedVerses}
            selectedVerses={selectedVerses}
            handleVerseSelect={handleVerseSelect}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
            setViewingNote={openNoteSheet}
            setViewingLabel={(data: any) => {
              const matched = bibleVerses.find(v => String(v.verse) === String(data.verse));
              if (matched) {
                setSelectedVerses([matched.id]);
                setIsLabelPaletteOpen(true);
                setIsColorPaletteOpen(false);
              }
            }}
            goToPrevChapter={goToPrevChapter}
            goToNextChapter={goToNextChapter}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            highlightedVerse={highlightedVerse}
            setHighlightedVerse={setHighlightedVerse}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverTab
            books={BIBLE_BOOKS}
            onNavigateToVerse={handleNavigateToVerse}
            isDark={isDark}
          />
        )}
        {activeTab === 'saved' && <SavedTab savedVerses={savedVerses} fetchSaved={fetchSavedData} onNavigateToVerse={handleNavigateToVerse} />}
        {activeTab === 'admin' && <AdminTab triggerAction={triggerAction} refreshHomeData={fetchHomeData} news={news} communities={communities} channels={channels} dailyVerse={dailyVerse} setActiveTab={setActiveTab} />}
      </main>

      {isSelectorOpen && (
        <div className="absolute inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-gray-900/60 dark:bg-black/70 transition-opacity" onClick={closeSelector}></div>
          
          <div className="relative bg-white dark:bg-[#1E2A23] w-full max-w-[500px] mx-auto rounded-t-[1.5rem] h-[85vh] flex flex-col shadow-2xl animate-[fadeIn_0.25s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-[#2E3F34] shrink-0 bg-white dark:bg-[#1E2A23] rounded-t-[1.5rem]">
              {selectorStep === 'chapter' ? (
                <button onClick={() => setSelectorStep('book')} className="p-2 -ml-2 text-gray-500 dark:text-[#8D9F94] hover:bg-gray-100 dark:hover:bg-[#27382F] rounded-full transition">
                  <i className="ph-bold ph-arrow-left text-xl"></i>
                </button>
              ) : (
                <div className="w-8"></div>
              )}
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-[#E3ECE6]">
                {selectorStep === 'book' ? 'Pilih Kitab' : selectorStep === 'version' ? 'Pilih Terjemahan' : `Pasal ${tempSelectedBook.name}`}
              </h3>
              <button onClick={closeSelector} className="p-2 -mr-2 text-gray-500 dark:text-[#8D9F94] hover:bg-gray-100 dark:hover:bg-[#27382F] rounded-full transition">
                <i className="ph-bold ph-x text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scroll-area no-scrollbar bg-[#fafafa] dark:bg-[#17211C]">
              {selectorStep === 'version' ? (
                <div className="space-y-6">
                  {BIBLE_LANGUAGES.map((group) => (
                    <div key={group.code} className="space-y-2.5">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-extrabold text-gray-400 dark:text-[#8D9F94] uppercase tracking-widest">{group.name}</span>
                        <div className="flex-1 h-[1px] bg-gray-200 dark:bg-[#2E3F34]"></div>
                      </div>
                      <div className="space-y-2">
                        {group.versions.map((ver) => {
                          const isSelected = currentVersion.id === ver.id;
                          return (
                            <button
                              key={ver.id}
                              onClick={() => handleSelectVersion(ver)}
                              className={`w-full p-4 rounded-2xl text-left transition border flex justify-between items-center ${
                                isSelected 
                                  ? 'bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border-gray-900 dark:border-[#74C69D] shadow-md' 
                                  : 'bg-white dark:bg-[#1E2A23] text-gray-800 dark:text-[#E3ECE6] border-gray-100 dark:border-[#2E3F34] hover:border-gray-300 dark:hover:border-[#3C5143] shadow-sm'
                              }`}
                            >
                              <div className="pr-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-[14px]">{ver.name}</span>
                                  {ver.testamentScope === 'NT' && (
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                      isSelected 
                                        ? 'bg-gray-800 dark:bg-[#17211C] text-yellow-300 dark:text-[#74C69D] border border-gray-700 dark:border-[#2E3F34]' 
                                        : 'bg-amber-50 dark:bg-[#26372D] text-amber-700 dark:text-[#74C69D] border border-amber-200 dark:border-[#2E3F34]'
                                    }`}>PB</span>
                                  )}
                                </div>
                                {ver.description && (
                                  <p className={`text-[11px] leading-tight ${isSelected ? 'text-gray-300 dark:text-[#8D9F94]' : 'text-gray-500 dark:text-[#8D9F94]'}`}>{ver.description}</p>
                                )}
                              </div>
                              {isSelected && <i className="ph-bold ph-check-circle text-xl text-green-400 dark:text-[#74C69D] shrink-0"></i>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectorStep === 'book' ? (
                <div className="space-y-6">
                  {currentVersion.testamentScope !== 'NT' && availableBooks.filter(b => b.test === 'PL').length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-[#8D9F94] uppercase tracking-widest">Perjanjian Lama</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableBooks.filter(b => b.test === 'PL').map((book) => (
                          <button
                            key={book.id}
                            onClick={() => { setTempSelectedBook(book); setSelectorStep('chapter'); }}
                            className={`p-3 rounded-xl text-left font-bold text-[13px] transition border ${
                              currentBook.id === book.id 
                                ? 'bg-[#1a1d23] dark:bg-[#26372D] text-white dark:text-[#74C69D] border-[#1a1d23] dark:border-[#74C69D] shadow-md' 
                                : 'bg-white dark:bg-[#1E2A23] text-gray-700 dark:text-[#E3ECE6] border-gray-100 dark:border-[#2E3F34] hover:border-gray-300 dark:hover:border-[#3C5143]'
                            }`}
                          >
                            {book.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableBooks.filter(b => b.test === 'PB').length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-extrabold text-gray-400 dark:text-[#8D9F94] uppercase tracking-widest mb-3 pl-1">Perjanjian Baru</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {availableBooks.filter(b => b.test === 'PB').map((book) => (
                          <button 
                            key={book.id}
                            onClick={() => { setTempSelectedBook(book); setSelectorStep('chapter'); }}
                            className={`p-3 rounded-xl text-left font-bold text-[13px] transition border ${
                              currentBook.id === book.id 
                                ? 'bg-[#1a1d23] dark:bg-[#26372D] text-white dark:text-[#74C69D] border-[#1a1d23] dark:border-[#74C69D] shadow-md' 
                                : 'bg-white dark:bg-[#1E2A23] text-gray-700 dark:text-[#E3ECE6] border-gray-100 dark:border-[#2E3F34] hover:border-gray-300 dark:hover:border-[#3C5143]'
                            }`}
                          >
                            {book.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: tempSelectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <button 
                      key={ch} 
                      onClick={() => { setCurrentBook(tempSelectedBook); setCurrentChapter(ch); closeSelector(); }} 
                      className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition border ${
                        currentBook.id === tempSelectedBook.id && currentChapter === ch 
                          ? 'bg-[#1a1d23] dark:bg-[#26372D] text-white dark:text-[#74C69D] border-[#1a1d23] dark:border-[#74C69D] shadow-md scale-105' 
                          : 'bg-white dark:bg-[#1E2A23] text-gray-700 dark:text-[#E3ECE6] border-gray-100 dark:border-[#2E3F34] hover:border-gray-300 dark:hover:border-[#3C5143]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isNoteSheetOpen && (
        <div 
          className="fixed inset-x-0 top-0 z-[110] flex flex-col bg-[#fafafa] dark:bg-[#17211C]"
          style={{ height: 'var(--tg-viewport-height, 100dvh)' }}
        >
          <div 
            className="px-4 pb-3.5 bg-white dark:bg-[#1E2A23] border-b border-gray-200 dark:border-[#2E3F34] flex items-center justify-between shrink-0"
            style={{
              paddingTop: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3.25rem)'
            }}
          >
            <button
              type="button"
              onClick={closeNoteSheet}
              className="flex items-center gap-1 text-gray-500 dark:text-[#8D9F94] hover:text-gray-900 dark:hover:text-[#E3ECE6] active:scale-90 transition-transform py-1 px-2 -ml-1 text-[14px] font-semibold select-none"
            >
              <i className="ph-bold ph-caret-left text-lg"></i>
              <span>Batal</span>
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f4f5f7] dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full">
              <i className="ph-fill ph-book-open-text text-gray-900 dark:text-[#74C69D] text-xs"></i>
              <span className="text-[12.5px] font-extrabold text-gray-900 dark:text-[#E3ECE6] tracking-tight">
                {noteSheetData ? `${noteSheetData.book} ${noteSheetData.chapter}:${noteSheetData.verse}` : 'Catatan'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => saveVerseData(null, noteInput)}
              className="px-4 py-1.5 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#74C69D] rounded-full text-[13px] font-bold hover:bg-black active:scale-90 transition-transform select-none"
            >
              Selesai
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {noteSheetData && (
              <div className="bg-white dark:bg-[#1E2A23] border border-gray-200 dark:border-[#2E3F34] rounded-2xl p-4 shrink-0">
                <div 
                  onClick={() => {
                    if (noteSheetData.items && noteSheetData.items.length > 1) {
                      setIsNoteRefExpanded(prev => !prev);
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-[#8D9F94]">
                    <i className="ph-bold ph-quotes text-xs"></i>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Ayat Referensi</span>
                    {noteSheetData.items && noteSheetData.items.length > 1 && (
                      <span className="text-[9.5px] font-bold bg-gray-100 dark:bg-[#26372D] text-gray-500 dark:text-[#74C69D] px-2 py-0.5 rounded-full ml-1">
                        {noteSheetData.items.length} Ayat
                      </span>
                    )}
                  </div>
                  {noteSheetData.items && noteSheetData.items.length > 1 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 dark:text-[#8D9F94]">
                      <span>{isNoteRefExpanded ? 'Ciutkan' : 'Lihat'}</span>
                      <i className={`ph-bold ph-caret-down ${isNoteRefExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                  )}
                </div>

                <div className="pt-3 space-y-2">
                  {noteSheetData.items && noteSheetData.items.length > 0 ? (
                    <>
                      <div className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[12px] font-bold text-gray-400 dark:text-[#74C69D] shrink-0 mt-0.5 select-none">
                          {noteSheetData.items[0].verse}
                        </span>
                        <span className="text-[13.5px] text-gray-800 dark:text-[#E3ECE6] font-normal flex-1">
                          {noteSheetData.items[0].text}
                        </span>
                      </div>
                      {isNoteRefExpanded && noteSheetData.items.slice(1).map((item: any, idx: number) => (
                        <div key={item.verse || idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-[12px] font-bold text-gray-400 dark:text-[#74C69D] shrink-0 mt-0.5 select-none">
                            {item.verse}
                          </span>
                          <span className="text-[13.5px] text-gray-800 dark:text-[#E3ECE6] font-normal flex-1">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-start gap-2 leading-relaxed">
                      {noteSheetData.verse && (
                        <span className="text-[12px] font-bold text-gray-400 dark:text-[#74C69D] shrink-0 mt-0.5 select-none">
                          {noteSheetData.verse}
                        </span>
                      )}
                      <span className="text-[13.5px] text-gray-800 dark:text-[#E3ECE6] font-normal flex-1">
                        {noteSheetData.content}
                      </span>
                    </div>
                  )}

                  {!isNoteRefExpanded && noteSheetData.items && noteSheetData.items.length > 1 && (
                    <div 
                      onClick={() => setIsNoteRefExpanded(true)}
                      className="text-[11px] font-bold text-gray-400 dark:text-[#8D9F94] hover:text-gray-700 dark:hover:text-[#E3ECE6] pl-5 cursor-pointer select-none pt-0.5"
                    >
                      +{noteSheetData.items.length - 1} ayat lainnya (ketuk untuk membuka)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#1E2A23] border border-gray-200 dark:border-[#2E3F34] rounded-2xl p-4 space-y-3 shrink-0 focus-within:border-gray-400 dark:focus-within:border-[#74C69D]">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3F34] pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-[#8D9F94]">
                  Tulis Catatan
                </span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-[#8D9F94]">
                  {noteInput.length} karakter
                </span>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Ketik renungan, doa, atau yang lainnya disini..."
                className="w-full bg-transparent text-[14.5px] leading-relaxed text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none resize-none min-h-[170px]"
              />
            </div>
          </div>
        </div>
      )}

      {isCreateLabelOpen && (
        <div 
          className="fixed inset-x-0 top-0 z-[120] flex flex-col bg-[#fafafa] dark:bg-[#17211C]"
          style={{ height: 'var(--tg-viewport-height, 100dvh)' }}
        >
          <div 
            className="px-4 pb-3.5 bg-white dark:bg-[#1E2A23] border-b border-gray-200 dark:border-[#2E3F34] flex items-center justify-between shrink-0"
            style={{
              paddingTop: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 3.25rem)'
            }}
          >
            <button
              type="button"
              onClick={closeCreateLabelSheet}
              className="flex items-center gap-1 text-gray-500 dark:text-[#8D9F94] hover:text-gray-900 dark:hover:text-[#E3ECE6] active:scale-90 transition-transform py-1 px-2 -ml-1 text-[14px] font-semibold select-none"
            >
              <i className="ph-bold ph-caret-left text-lg"></i>
              <span>Batal</span>
            </button>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f4f5f7] dark:bg-[#26372D] border border-gray-200 dark:border-[#2E3F34] rounded-full">
              <i className="ph-fill ph-tag text-gray-900 dark:text-[#74C69D] text-xs"></i>
              <span className="text-[12.5px] font-extrabold text-gray-900 dark:text-[#E3ECE6] tracking-tight">
                Label Baru
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddCustomLabel}
              disabled={isLabelPageLoading || !customLabelInput.trim()}
              className="px-4 py-1.5 bg-gray-900 dark:bg-[#26372D] text-white dark:text-[#74C69D] border border-transparent dark:border-[#74C69D] rounded-full text-[13px] font-bold disabled:opacity-35 disabled:pointer-events-none hover:bg-black active:scale-90 transition-transform select-none"
            >
              Simpan
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
            {isLabelPageLoading ? (
              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-3 bg-gray-200 dark:bg-[#2A3B31] rounded-md animate-pulse"></div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-[#2A3B31] rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-full h-10 border-b-2 border-gray-200 dark:border-[#2E3F34]"></div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="w-36 h-2.5 bg-gray-200 dark:bg-[#2A3B31] rounded-md animate-pulse"></div>
                    <div className="w-12 h-2.5 bg-gray-200 dark:bg-[#2A3B31] rounded-md animate-pulse"></div>
                  </div>
                </div>
                <div className="w-48 h-3 bg-gray-200 dark:bg-[#24332A] rounded-md mx-auto animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-[#8D9F94]">
                      Nama Label
                    </span>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#f0f2f5] dark:bg-[#26372D] text-gray-800 dark:text-[#74C69D] text-[11px] font-bold border border-gray-200/60 dark:border-[#354B3E]">
                      <span className="truncate max-w-[140px]">{customLabelInput.trim() || 'Pratinjau'}</span>
                    </div>
                  </div>
                  <div className="relative pb-1 border-b-2 border-gray-200 dark:border-[#2E3F34] focus-within:border-gray-900 dark:focus-within:border-[#74C69D] transition-colors">
                    <input
                      ref={createLabelInputRef}
                      type="text"
                      value={customLabelInput}
                      onChange={(e) => setCustomLabelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customLabelInput.trim()) {
                          e.preventDefault();
                          handleAddCustomLabel();
                        }
                      }}
                      placeholder="Ketik nama label..."
                      className="w-full bg-transparent py-2 text-[16px] font-medium text-gray-900 dark:text-[#E3ECE6] placeholder-gray-400 dark:placeholder-[#6C8074] focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center px-0.5 pt-0.5">
                    <span className="text-[10px] text-gray-400 dark:text-[#8D9F94]">
                      Gunakan nama yang ringkas & bermakna
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-[#8D9F94]">
                      {customLabelInput.length} karakter
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-gray-400 dark:text-[#8D9F94] leading-relaxed text-center px-3 shrink-0 select-none">
                  Label memudahkan Anda mengelompokkan dan menemukan kembali ayat-ayat Alkitab berdasarkan topik atau tema renungan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`action-menu fixed left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[430px] bg-[#1a1c22]/95 backdrop-blur-2xl text-white rounded-[2rem] shadow-[0_20px_50px_-5px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] p-2 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          selectedVerses.length > 0 && !isNoteSheetOpen && !isCreateLabelOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-8 scale-95 pointer-events-none'
        }`}
        style={{ bottom: 'calc(max(var(--tg-safe-bottom, 0px), env(safe-area-inset-bottom, 0px)) + 1.25rem)' }}
      >
        {!isColorPaletteOpen && !isLabelPaletteOpen ? (
          <div key="action-main" className="action-view-enter flex items-center justify-between gap-1.5 px-1 w-full">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 py-0.5">
              <div
                onTouchStart={handleColorPressStart}
                onTouchEnd={handleColorPressEnd}
                onMouseDown={handleColorPressStart}
                onMouseUp={handleColorPressEnd}
                onMouseLeave={handleColorPressEnd}
                className="flex items-center gap-1.5 bg-white/[0.07] hover:bg-white/[0.1] p-1.5 rounded-full transition-colors duration-150 select-none shrink-0"
              >
                {recentColors.map((colorId, idx) => {
                  const colorObj = ALL_HIGHLIGHT_COLORS.find(c => c.id === colorId) || ALL_HIGHLIGHT_COLORS[0];
                  const isLatest = idx === 0;
                  return (
                    <button
                      key={colorId}
                      onClick={(e) => handleColorClick(e, colorId)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-75 hover:scale-115 relative shrink-0 ${
                        isLatest ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1c22] shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'opacity-85 hover:opacity-100'
                      }`}
                      title={isLatest ? 'Warna Terakhir Digunakan' : undefined}
                    >
                      <div className={`w-5 h-5 rounded-full ${colorObj.bg} shadow-sm`} />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsColorPaletteOpen(true);
                  }}
                  className="w-6 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-transform duration-150 active:scale-75 shrink-0"
                  title="Pilihan Warna Lainnya"
                >
                  <i className="ph-bold ph-caret-right text-xs"></i>
                </button>
              </div>

              <div
                className={`overflow-hidden flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
                  hasSelectedHighlight ? 'max-w-[56px] opacity-100 scale-100 translate-x-0' : 'max-w-0 opacity-0 scale-75 -translate-x-2 pointer-events-none'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveVerseData('', null);
                  }}
                  className="flex flex-col items-center justify-center w-11 h-11 hover:bg-rose-500/15 rounded-2xl transition-colors duration-150 active:scale-75 text-rose-300 hover:text-rose-200 shrink-0"
                  title="Hapus Warna"
                >
                  <i className="ph-bold ph-prohibit text-lg"></i>
                  <span className="text-[8.5px] font-bold tracking-wide mt-0.5">Hapus</span>
                </button>
              </div>

              <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLabelPaletteOpen(true);
                }}
                className="flex flex-col items-center justify-center w-11 h-11 hover:bg-white/[0.08] rounded-2xl transition-colors duration-150 active:scale-75 text-gray-300 hover:text-white shrink-0"
              >
                <i className="ph-bold ph-tag text-lg"></i>
                <span className="text-[8.5px] font-bold tracking-wide mt-0.5">Label</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openNoteSheet();
                }}
                className="flex flex-col items-center justify-center w-11 h-11 hover:bg-white/[0.08] rounded-2xl transition-colors duration-150 active:scale-75 text-gray-300 hover:text-white shrink-0"
              >
                <i className="ph-bold ph-pencil-simple text-lg"></i>
                <span className="text-[8.5px] font-bold tracking-wide mt-0.5">Catat</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="flex flex-col items-center justify-center w-11 h-11 hover:bg-white/[0.08] rounded-2xl transition-colors duration-150 active:scale-75 text-gray-300 hover:text-white shrink-0"
              >
                <i className="ph-bold ph-copy text-lg"></i>
                <span className="text-[8.5px] font-bold tracking-wide mt-0.5">Salin</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="flex flex-col items-center justify-center w-11 h-11 hover:bg-sky-500/15 rounded-2xl transition-colors duration-150 active:scale-75 text-sky-400 hover:text-sky-300 shrink-0"
              >
                <i className="ph-bold ph-telegram-logo text-lg"></i>
                <span className="text-[8.5px] font-bold tracking-wide mt-0.5">Share</span>
              </button>
            </div>

            <div className="flex items-center shrink-0 pl-1 border-l border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVerses([]);
                  setIsColorPaletteOpen(false);
                  setIsLabelPaletteOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-full text-gray-400 hover:text-white transition-colors duration-150 active:scale-75 shrink-0"
                title="Tutup"
              >
                <i className="ph-bold ph-x text-base"></i>
              </button>
            </div>
          </div>
        ) : isColorPaletteOpen ? (
          <div key="action-color" className="action-view-back flex items-center justify-between px-2 py-1 gap-3 w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsColorPaletteOpen(false);
              }}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-gray-200 hover:text-white transition-colors duration-150 active:scale-75 shrink-0"
              title="Kembali"
            >
              <i className="ph-bold ph-arrow-left text-xs"></i>
            </button>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  saveVerseData('', null);
                }}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-500 transition-colors duration-150 active:scale-75 shrink-0"
                title="Hapus Warna"
              >
                <i className="ph-bold ph-prohibit text-xs"></i>
              </button>

              {ALL_HIGHLIGHT_COLORS.map(color => {
                const isLatest = recentColors[0] === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveVerseData(color.id, null);
                    }}
                    className={`w-7 h-7 rounded-full ${color.bg} transition-transform duration-150 hover:scale-125 active:scale-75 shrink-0 relative ${
                      isLatest ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1c22] shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'opacity-90 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div key="action-label" className="action-view-back flex items-center justify-between px-2 py-1 gap-2 w-full">
            {isEditingCustomLabels ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingCustomLabels(false);
                }}
                className="h-8 px-3 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white text-[11.5px] font-bold transition-colors duration-150 active:scale-75 shrink-0"
              >
                Selesai
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLabelPaletteOpen(false);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-gray-200 hover:text-white transition-colors duration-150 active:scale-75 shrink-0"
                title="Kembali"
              >
                <i className="ph-bold ph-arrow-left text-xs"></i>
              </button>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 flex-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreateLabelOpen(true);
                }}
                className="h-8 px-3 rounded-full flex items-center gap-1.5 text-[11.5px] font-bold transition-transform duration-150 active:scale-90 shrink-0 border border-transparent bg-white/10 text-gray-200 hover:bg-white/15"
              >
                <i className="ph-bold ph-plus text-xs text-gray-400"></i>
                <span>Label Baru</span>
              </button>

              {PRESET_LABELS.map(preset => {
                const isSelected = activeLabelsForSelected.has(preset.name);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLabelQuick(preset.name);
                    }}
                    className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-[11.5px] font-bold transition-transform duration-150 active:scale-90 shrink-0 border ${
                      isSelected
                        ? 'bg-white text-gray-950 border-white shadow-xs'
                        : 'bg-white/10 text-gray-200 border-transparent hover:bg-white/15'
                    }`}
                  >
                    <i className={`ph-bold ${preset.icon} text-xs ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}></i>
                    <span>{preset.name}</span>
                    {isSelected && <i className="ph-bold ph-check text-[10px] text-gray-900"></i>}
                  </button>
                );
              })}

              {availableCustomLabels
                .filter(c => !PRESET_LABELS.some(p => p.name.toLowerCase() === c.toLowerCase()))
                .map(cLabel => {
                  const isSelected = activeLabelsForSelected.has(cLabel);
                  return (
                    <div
                      key={cLabel}
                      onTouchStart={handleCustomLabelPressStart}
                      onTouchEnd={handleCustomLabelPressEnd}
                      onMouseDown={handleCustomLabelPressStart}
                      onMouseUp={handleCustomLabelPressEnd}
                      onMouseLeave={handleCustomLabelPressEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCustomLabelHeld.current) {
                          isCustomLabelHeld.current = false;
                          return;
                        }
                        if (isEditingCustomLabels) {
                          handleDeleteCustomLabel(cLabel, e);
                          return;
                        }
                        handleToggleLabelQuick(cLabel);
                      }}
                      className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-[11.5px] font-bold transition-transform duration-150 active:scale-90 shrink-0 border cursor-pointer select-none relative ${
                        isEditingCustomLabels
                          ? 'animate-jiggle border-rose-400/80 bg-rose-950/60 text-rose-200 pr-2'
                          : isSelected
                          ? 'bg-white text-gray-950 border-white shadow-xs'
                          : 'bg-white/10 text-gray-200 border-transparent hover:bg-white/15'
                      }`}
                    >
                      <i className={`ph-bold ph-tag text-xs ${isEditingCustomLabels ? 'text-rose-300' : isSelected ? 'text-gray-900' : 'text-gray-400'}`}></i>
                      <span>{cLabel}</span>
                      {isSelected && !isEditingCustomLabels && <i className="ph-bold ph-check text-[10px] text-gray-900"></i>}
                      {isEditingCustomLabels && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomLabel(cLabel, e)}
                          className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors ml-0.5"
                        >
                          <i className="ph-bold ph-x text-[9px]"></i>
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <nav className={`absolute left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E2A23]/95 backdrop-blur-xl border border-gray-200 dark:border-[#2E3F34] rounded-[2rem] px-5 py-3.5 flex justify-center gap-6 items-center z-40 w-max shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 ${(selectedVerses.length > 0 || isNoteSheetOpen || isCreateLabelOpen || isSelectorOpen || !isNavVisible) ? 'opacity-0 invisible translate-y-24 pointer-events-none' : 'opacity-100 visible translate-y-0'}`} style={{ bottom: 'calc(max(var(--tg-safe-bottom, 0px), env(safe-area-inset-bottom, 0px)) + 1.5rem)' }}>
        <button onClick={() => switchActiveTab('home')} className={`flex flex-col items-center gap-1 transition-transform duration-150 active:scale-90 active:opacity-70 select-none ${activeTab === 'home' ? 'text-gray-900 dark:text-[#74C69D] scale-110' : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-600 dark:hover:text-[#E3ECE6]'}`}><i className={`${activeTab === 'home' ? 'ph-fill' : 'ph'} ph-house text-2xl`}></i><span className="text-[9px] font-extrabold tracking-wider uppercase">Home</span></button>
        <button onClick={() => switchActiveTab('bible')} className={`flex flex-col items-center gap-1 transition-transform duration-150 active:scale-90 active:opacity-70 select-none ${activeTab === 'bible' ? 'text-gray-900 dark:text-[#74C69D] scale-110' : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-600 dark:hover:text-[#E3ECE6]'}`}><i className={`${activeTab === 'bible' ? 'ph-fill' : 'ph'} ph-book-open-text text-2xl`}></i><span className="text-[9px] font-extrabold tracking-wider uppercase">Alkitab</span></button>
        <button onClick={() => switchActiveTab('discover')} className={`flex flex-col items-center gap-1 transition-transform duration-150 active:scale-90 active:opacity-70 select-none ${activeTab === 'discover' ? 'text-gray-900 dark:text-[#74C69D] scale-110' : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-600 dark:hover:text-[#E3ECE6]'}`}><i className={`${activeTab === 'discover' ? 'ph-fill' : 'ph'} ph-compass text-2xl`}></i><span className="text-[9px] font-extrabold tracking-wider uppercase">Temukan</span></button>
        <button onClick={() => switchActiveTab('saved')} className={`flex flex-col items-center gap-1 transition-transform duration-150 active:scale-90 active:opacity-70 select-none ${activeTab === 'saved' ? 'text-gray-900 dark:text-[#74C69D] scale-110' : 'text-gray-400 dark:text-[#8D9F94] hover:text-gray-600 dark:hover:text-[#E3ECE6]'}`}><i className={`${activeTab === 'saved' ? 'ph-fill' : 'ph'} ph-bookmark-simple text-2xl`}></i><span className="text-[9px] font-extrabold tracking-wider uppercase">Simpan</span></button>
      </nav>

      <div 
        className={`fixed inset-x-0 z-[200] flex justify-center pointer-events-none transition-opacity duration-150 ${
          showToast ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          top: 'calc(max(var(--tg-safe-top, 0px), env(safe-area-inset-top, 0px)) + 1.25rem)' 
        }}
      >
        <div className="bg-gray-900 dark:bg-[#1E2A23] text-white dark:text-[#E3ECE6] px-5 py-2.5 rounded-full text-[12.5px] font-bold flex items-center gap-2 border border-gray-700 dark:border-[#2E3F34]">
          <i className="ph-fill ph-check-circle text-green-400 dark:text-[#74C69D] text-base shrink-0"></i>
          <span>{toastMsg}</span>
        </div>
      </div>
    </div>
  );
}