export interface BibleVersion {
  id: string;
  name: string;
  shortName: string;
  language: string;
  langCode: string;
  testamentScope: 'ALL' | 'NT' | 'OT';
  description?: string;
}

export interface LanguageGroup {
  code: string;
  name: string;
  versions: BibleVersion[];
}

export const BIBLE_LANGUAGES: LanguageGroup[] = [
  {
    code: 'id',
    name: 'Bahasa Indonesia',
    versions: [
      {
        id: 'TB',
        name: 'Terjemahan Baru (TB)',
        shortName: 'TB',
        language: 'Bahasa Indonesia',
        langCode: 'id',
        testamentScope: 'ALL',
        description: 'Standar Lembaga Alkitab Indonesia (LAI)'
      },
      {
        id: 'TL',
        name: 'Terjemahan Lama (TL)',
        shortName: 'TL',
        language: 'Bahasa Indonesia',
        langCode: 'id',
        testamentScope: 'ALL',
        description: 'Klinkert / Bode 1958'
      },
      {
        id: 'AYT',
        name: 'Alkitab Yang Terbuka (AYT)',
        shortName: 'AYT',
        language: 'Bahasa Indonesia',
        langCode: 'id',
        testamentScope: 'ALL',
        description: 'Bahasa Indonesia Terbuka © 2018-2022 Yayasan Lembaga SABDA'
      }
    ]
  },
  {
    code: 'jv',
    name: 'Basa Jawa',
    versions: [
      {
        id: 'JVN',
        name: 'Basa Jawa Suriname (PB)',
        shortName: 'JVN',
        language: 'Basa Jawa',
        langCode: 'jv',
        testamentScope: 'NT',
        description: 'Kitab Sutji Prejanjian Anyar'
      }
    ]
  },
  {
    code: 'en',
    name: 'English',
    versions: [
      {
        id: 'KJV',
        name: 'King James Version (KJV)',
        shortName: 'KJV',
        language: 'English',
        langCode: 'en',
        testamentScope: 'ALL',
        description: 'Authorized King James Version'
      },
      {
        id: 'KJVS',
        name: 'KJV with Strong Numbers',
        shortName: 'KJV-S',
        language: 'English',
        langCode: 'en',
        testamentScope: 'ALL',
        description: 'KJV dengan Nomor Strong Ibrani/Yunani'
      }
    ]
  },
  {
    code: 'grc',
    name: 'Yunani (Greek)',
    versions: [
      {
        id: 'TR',
        name: 'Textus Receptus (Greek NT)',
        shortName: 'TR',
        language: 'Yunani Kuno (Greek)',
        langCode: 'grc',
        testamentScope: 'NT',
        description: 'Perjanjian Baru Teks Yunani'
      },
      {
        id: 'TRP',
        name: 'Textus Receptus Parsed (Greek NT)',
        shortName: 'TRP',
        language: 'Yunani Kuno (Greek)',
        langCode: 'grc',
        testamentScope: 'NT',
        description: 'Dilengkapi Kode Strong & Morfologi'
      }
    ]
  }
];

export const ALL_BIBLE_VERSIONS: BibleVersion[] = BIBLE_LANGUAGES.flatMap(lang => lang.versions);
export const DEFAULT_BIBLE_VERSION: BibleVersion = ALL_BIBLE_VERSIONS.find(v => v.id === 'AYT') || ALL_BIBLE_VERSIONS[0];

export interface VerseLabel {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const PRESET_LABELS: VerseLabel[] = [
  { id: 'Ketaatan', name: 'Ketaatan', icon: 'ph-shield-check', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' },
  { id: 'Penyembahan', name: 'Penyembahan', icon: 'ph-hands-praying', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' },
  { id: 'Dorongan', name: 'Dorongan', icon: 'ph-lightning', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' },
  { id: 'Kasih', name: 'Kasih', icon: 'ph-heart', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' },
  { id: 'Doa', name: 'Doa', icon: 'ph-chat-circle-dots', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' },
  { id: 'Janji Allah', name: 'Janji Allah', icon: 'ph-cross', color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90' }
];

export const parseLabels = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export const getLabelMeta = (labelName: string): VerseLabel => {
  const match = PRESET_LABELS.find(p => p.name.toLowerCase() === labelName.trim().toLowerCase());
  if (match) return match;
  return {
    id: labelName,
    name: labelName,
    icon: 'ph-tag',
    color: 'bg-[#f4f5f7] text-gray-800 border-gray-200/90'
  };
};