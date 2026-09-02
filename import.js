const fs = require('fs');
const path = require('path');

const BIBLE_BOOKS = [
  'Kej', 'Kel', 'Ima', 'Bil', 'Ula', 'Yos', 'Hak', 'Rut', '1Sa', '2Sa',
  '1Ra', '2Ra', '1Ta', '2Ta', 'Ezr', 'Neh', 'Est', 'Ayb', 'Mzm', 'Ams',
  'Pkh', 'Kid', 'Yes', 'Yer', 'Rat', 'Yeh', 'Dan', 'Hos', 'Yoe', 'Amo',
  'Oba', 'Yun', 'Mik', 'Nah', 'Hab', 'Zef', 'Hag', 'Zak', 'Mal',
  'Mat', 'Mrk', 'Luk', 'Yoh', 'Kis', 'Rom', '1Ko', '2Ko', 'Gal', 'Efe',
  'Flp', 'Kol', '1Te', '2Te', '1Ti', '2Ti', 'Tit', 'Flm', 'Ibr', 'Yak',
  '1Pt', '2Pt', '1Yo', '2Yo', '3Yo', 'Yud', 'Why'
];

const CANON_CHAPTER_VERSES = [
  ['Kej', [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]],
  ['Kel', [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38]],
  ['Ima', [17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34]],
  ['Bil', [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40, 16, 54, 42, 56, 29, 34, 13]],
  ['Ula', [46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29, 23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29, 20, 30, 52, 29, 12]],
  ['Yos', [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33]],
  ['Hak', [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25]],
  ['Rut', [22, 23, 18, 22]],
  ['1Sa', [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11, 31, 13]],
  ['2Sa', [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 33, 43, 26, 22, 51, 39, 25]],
  ['1Ra', [53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 53]],
  ['2Ra', [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30]],
  ['1Ta', [54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30]],
  ['2Ta', [17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23]],
  ['Ezr', [11, 70, 13, 24, 17, 22, 28, 36, 15, 44]],
  ['Neh', [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31]],
  ['Est', [22, 23, 15, 17, 14, 14, 10, 17, 32, 3]],
  ['Ayb', [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17]],
  ['Mzm', [6, 12, 8, 8, 12, 10, 17, 9, 20, 18, 7, 8, 6, 7, 5, 11, 15, 50, 14, 9, 13, 31, 6, 10, 22, 12, 14, 9, 11, 12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11, 5, 26, 17, 11, 9, 14, 20, 23, 19, 9, 6, 7, 23, 13, 11, 11, 17, 12, 8, 12, 11, 10, 13, 20, 7, 35, 36, 5, 24, 20, 28, 23, 10, 12, 20, 72, 13, 19, 16, 8, 18, 12, 13, 17, 7, 18, 52, 17, 16, 15, 5, 23, 11, 13, 12, 9, 9, 5, 8, 28, 22, 35, 45, 48, 43, 13, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 13, 10, 7, 12, 15, 21, 10, 20, 14, 9, 6]],
  ['Ams', [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31]],
  ['Pkh', [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14]],
  ['Kid', [17, 17, 11, 16, 16, 13, 13, 14]],
  ['Yes', [31, 22, 26, 6, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 12, 25, 24]],
  ['Yer', [19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34]],
  ['Rat', [22, 22, 66, 22, 22]],
  ['Yeh', [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35]],
  ['Dan', [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13]],
  ['Hos', [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9]],
  ['Yoe', [20, 32, 21]],
  ['Amo', [15, 16, 15, 13, 27, 14, 17, 14, 15]],
  ['Oba', [21]],
  ['Yun', [17, 10, 10, 11]],
  ['Mik', [16, 13, 12, 13, 15, 16, 20]],
  ['Nah', [15, 13, 19]],
  ['Hab', [17, 20, 19]],
  ['Zef', [18, 15, 20]],
  ['Hag', [15, 23]],
  ['Zak', [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21]],
  ['Mal', [14, 17, 18, 6]],
  ['Mat', [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20]],
  ['Mrk', [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20]],
  ['Luk', [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53]],
  ['Yoh', [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25]],
  ['Kis', [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31]],
  ['Rom', [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27]],
  ['1Ko', [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24]],
  ['2Ko', [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14]],
  ['Gal', [24, 21, 29, 31, 26, 18]],
  ['Efe', [23, 22, 21, 32, 33, 24]],
  ['Flp', [30, 30, 21, 23]],
  ['Kol', [29, 23, 25, 18]],
  ['1Te', [10, 20, 13, 18, 28]],
  ['2Te', [12, 17, 18]],
  ['1Ti', [20, 15, 16, 16, 25, 21]],
  ['2Ti', [18, 26, 17, 22]],
  ['Tit', [16, 15, 15]],
  ['Flm', [25]],
  ['Ibr', [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25]],
  ['Yak', [27, 26, 18, 17, 20]],
  ['1Pt', [25, 25, 22, 19, 14]],
  ['2Pt', [21, 22, 18]],
  ['1Yo', [10, 29, 24, 21, 21]],
  ['2Yo', [13]],
  ['3Yo', [14]],
  ['Yud', [25]],
  ['Why', [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]]
];

function getCanonicalIndexMap() {
  const map = [];
  for (const [book, chapters] of CANON_CHAPTER_VERSES) {
    for (let ch = 1; ch <= chapters.length; ch++) {
      const verseCount = chapters[ch - 1];
      for (let v = 1; v <= verseCount; v++) {
        map.push({ book, chapter: ch, verse: v });
      }
    }
  }
  return map;
}

function findFile(possiblePaths) {
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseCsv(text) {
  let rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentCell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      if (currentRow.length > 1) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentRow.length > 0 || currentCell !== '') {
    currentRow.push(currentCell);
    if (currentRow.length > 1) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function processAytPipe(filePath) {
  console.log(`[PROCESSING] Reading ${path.basename(filePath)} for translation: AYT...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const canonMap = getCanonicalIndexMap();

  let sqlStatements = '';
  let count = 0;

  for (let i = 0; i < lines.length && i < canonMap.length; i++) {
    const parts = lines[i].split('|');
    const rawContent = parts[1] || '';
    const rawTitle = parts[2] || '';

    const cleanContent = rawContent.replace(/<t\s*\/>/g, '').trim().replace(/'/g, "''");
    const cleanTitle = rawTitle.replace(/<br\s*\/?>/gi, ' - ').trim().replace(/'/g, "''");

    const target = canonMap[i];
    sqlStatements += `INSERT INTO bible_verses (book, chapter, verse, content, translation, title) VALUES ('${target.book}', ${target.chapter}, ${target.verse}, '${cleanContent}', 'AYT', '${cleanTitle}');\n`;
    count++;
  }

  console.log(`[SUCCESS] Processed ${count} verses for [AYT].`);
  return sqlStatements;
}

function processBibleCsv(filePath, translationCode) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.log(`[SKIPPED] File not found for: ${translationCode}`);
    return '';
  }

  if (translationCode === 'AYT') {
    return processAytPipe(filePath);
  }

  console.log(`[PROCESSING] Reading ${path.basename(filePath)} for translation: ${translationCode}...`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCsv(content);

  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i].map(c => c.trim().toLowerCase());
    if (r.includes('verse id') || r.includes('book name') || r.includes('kitab') || r.includes('firman')) {
      headerIndex = i;
      break;
    }
  }

  let sqlStatements = '';
  const startIndex = headerIndex >= 0 ? headerIndex + 1 : 0;
  let count = 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;

    let book = '';
    let chapter = 0;
    let verse = 0;
    let textContent = '';

    if (row.length >= 6) {
      const bookNum = parseInt(row[2].trim(), 10);
      if (!isNaN(bookNum) && bookNum >= 1 && bookNum <= BIBLE_BOOKS.length) {
        book = BIBLE_BOOKS[bookNum - 1];
      } else {
        book = row[1].trim();
      }
      chapter = parseInt(row[3].trim(), 10);
      verse = parseInt(row[4].trim(), 10);
      textContent = row[5].trim();
    } else {
      book = row[1].trim();
      chapter = parseInt(row[2].trim(), 10);
      verse = parseInt(row[3].trim(), 10);
      textContent = row[4].trim();
    }

    if (!book || isNaN(chapter) || isNaN(verse)) continue;

    const cleanContent = textContent.replace(/'/g, "''");
    sqlStatements += `INSERT INTO bible_verses (book, chapter, verse, content, translation) VALUES ('${book}', ${chapter}, ${verse}, '${cleanContent}', '${translationCode}');\n`;
    count++;
  }

  console.log(`[SUCCESS] Processed ${count} verses for [${translationCode}].`);
  return sqlStatements;
}

function main() {
  console.log("=== BIBLE CSV TO SQL CONVERTER ===");

  const translations = [
    {
      code: 'TB',
      paths: [
        path.join(__dirname, 'tb.csv'),
        path.join(__dirname, 'alkitab', 'id', 'tb.csv')
      ]
    },
    {
      code: 'TL',
      paths: [
        path.join(__dirname, 'indo_tm.csv'),
        path.join(__dirname, 'tl.csv'),
        path.join(__dirname, 'alkitab', 'id', 'tl.csv'),
        path.join(__dirname, 'alkitab', 'id', 'indo_tm.csv')
      ]
    },
    {
      code: 'AYT',
      paths: [
        path.join(__dirname, 'bib_id_ayt_texts.csv'),
        path.join(__dirname, 'ayt.csv'),
        path.join(__dirname, 'alkitab', 'id', 'bib_id_ayt_texts.csv'),
        path.join(__dirname, 'alkitab', 'id', 'ayt.csv')
      ]
    },
    {
      code: 'JVN',
      paths: [
        path.join(__dirname, 'jv_jvn.csv'),
        path.join(__dirname, 'jvn.csv'),
        path.join(__dirname, 'alkitab', 'jv', 'jv_jvn.csv'),
        path.join(__dirname, 'alkitab', 'jv', 'jvn.csv')
      ]
    },
    {
      code: 'KJV',
      paths: [
        path.join(__dirname, 'kjv.csv'),
        path.join(__dirname, 'alkitab', 'en', 'kjv.csv')
      ]
    },
    {
      code: 'KJVS',
      paths: [
        path.join(__dirname, 'kjv_strongs.csv'),
        path.join(__dirname, 'kjvs.csv'),
        path.join(__dirname, 'alkitab', 'en', 'kjv_strongs.csv'),
        path.join(__dirname, 'alkitab', 'en', 'kjvs.csv')
      ]
    },
    {
      code: 'TR',
      paths: [
        path.join(__dirname, 'tr.csv'),
        path.join(__dirname, 'alkitab', 'grc', 'tr.csv')
      ]
    },
    {
      code: 'TRP',
      paths: [
        path.join(__dirname, 'trparsed.csv'),
        path.join(__dirname, 'tr_parsed.csv'),
        path.join(__dirname, 'alkitab', 'grc', 'tr_parsed.csv'),
        path.join(__dirname, 'alkitab', 'grc', 'trparsed.csv')
      ]
    }
  ];

  let headerSql = 'CREATE TABLE IF NOT EXISTS bible_verses (id INTEGER PRIMARY KEY AUTOINCREMENT, book TEXT, chapter INTEGER, verse INTEGER, content TEXT, translation TEXT);\n';
  headerSql += 'CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_verses(translation, book, chapter, verse);\n';
  headerSql += 'DELETE FROM bible_verses;\n';

  let fullSql = headerSql;
  let totalCount = 0;

  for (const item of translations) {
    const filePath = findFile(item.paths);
    if (!filePath) {
      console.warn(`[WARNING] File for ${item.code} not found! Check your file placement.`);
      continue;
    }
    const sql = processBibleCsv(filePath, item.code);
    if (sql) {
      fullSql += sql;
      const count = (sql.match(/INSERT INTO/g) || []).length;
      totalCount += count;
      fs.writeFileSync(path.join(__dirname, `seed_${item.code.toLowerCase()}.sql`), sql);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'seed.sql'), fullSql);
  console.log(`=============================================`);
  console.log(`ALL DONE! Created seed.sql with ${totalCount} total verses.`);
  console.log(`Also generated individual files: seed_tb.sql, seed_tl.sql, seed_tr.sql, seed_trp.sql`);
  console.log(`=============================================`);
}

main();