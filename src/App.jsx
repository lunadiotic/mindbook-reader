import React, { useState, useEffect } from 'react';
import BookViewer from './components/BookViewer';
import './index.css';

// Auto-load all markdown files in src/content
const markdownFiles = import.meta.glob('./content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const fileMap = {};

// Group files by base name (e.g. bab-1-id.md and bab-1-en.md -> bab-1)
Object.keys(markdownFiles).forEach((path) => {
  let fileName = path.split('/').pop().replace('.md', '');
  let lang = 'id';
  let baseName = fileName;

  if (fileName.endsWith('-id')) {
    baseName = fileName.slice(0, -3);
    lang = 'id';
  } else if (fileName.endsWith('-en')) {
    baseName = fileName.slice(0, -3);
    lang = 'en';
  }

  if (!fileMap[baseName]) {
    fileMap[baseName] = {
      id: baseName,
      content: {},
      titles: {} // Simpan judul terjemahan di sini
    };
  }

  const rawContent = markdownFiles[path];
  let contentStr = rawContent;
  let extractedTitle = null;

  // 1. Coba baca dari format standar Frontmatter (---)
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const fmMatch = contentStr.match(frontmatterRegex);
  
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/^title:\s*(.*)$/m);
    if (titleMatch) extractedTitle = titleMatch[1].trim();
    
    // Hapus blok metadata agar tidak muncul saat dibaca
    contentStr = contentStr.replace(frontmatterRegex, '');
  } else {
    // 2. Coba baca dari format HTML Comment sebagai alternatif
    const commentMatch = contentStr.match(/<!--\s*title:\s*(.*?)\s*-->/i);
    if (commentMatch) {
      extractedTitle = commentMatch[1].trim();
    }
  }

  fileMap[baseName].content[lang] = contentStr;

  if (extractedTitle) {
    fileMap[baseName].titles[lang] = extractedTitle;
  } else {
    fileMap[baseName].titles[lang] = baseName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
});

const FILE_LIST = Object.values(fileMap);

function App() {
  const getSystemTheme = () => {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  };

  const [theme, setTheme] = useState(getSystemTheme);
  const [currentFile, setCurrentFile] = useState(null);
  const [lang, setLang] = useState('id'); // Global language state

  // Initialize state from URL on first load and listen to browser Back/Forward
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const bookId = params.get('buku');
      if (bookId) {
        const file = FILE_LIST.find((f) => f.id === bookId);
        setCurrentFile(file || null);
      } else {
        setCurrentFile(null);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const openBook = (file) => {
    setCurrentFile(file);
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('buku', file.id);
    window.history.pushState({}, '', newUrl);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: file.title,
      });
    }
  };

  const goHome = () => {
    setCurrentFile(null);
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('buku');
    window.history.pushState({}, '', newUrl);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: 'Kumpulan Buah Pikir | Rak Buku',
      });
    }
  };

  // Helper to get the content based on selected language or fallback
  const getDisplayContent = (file) => {
    if (!file) return '';
    return file.content[lang] || file.content['id'] || file.content['en'] || '';
  };

  // Helper to get the translated title
  const getDisplayTitle = (file) => {
    if (!file) return '';
    return file.titles[lang] || file.titles['id'] || file.titles['en'] || file.id;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Dynamic SEO & Title Update
  useEffect(() => {
    const updateMeta = (selector, content) => {
      const tag = document.querySelector(selector);
      if (tag) tag.setAttribute('content', content);
    };

    if (currentFile) {
      const displayTitle = getDisplayTitle(currentFile);
      document.title = `${displayTitle} | Kumpulan Buah Pikir`;
      const displayContent = getDisplayContent(currentFile);
      const desc = displayContent.substring(0, 160).replace(/[#*_>]/g, '').replace(/\n/g, ' ').trim() + '...';
      
      updateMeta('meta[name="description"]', desc);
      updateMeta('meta[property="og:title"]', displayTitle);
      updateMeta('meta[property="og:description"]', desc);
      updateMeta('meta[property="og:url"]', window.location.href);
    } else {
      document.title = 'Kumpulan Buah Pikir | by @aimeliala';
      const defaultDesc = "Sebuah ruang membaca tulisan dan buah pikir yang dibagikan kepada khalayak umum. Dibuat oleh @aimeliala.";
      
      updateMeta('meta[name="description"]', defaultDesc);
      updateMeta('meta[property="og:title"]', 'Kumpulan Buah Pikir | by @aimeliala');
      updateMeta('meta[property="og:description"]', defaultDesc);
      const baseUrl = window.location.origin + window.location.pathname;
      updateMeta('meta[property="og:url"]', baseUrl);
    }
  }, [currentFile, lang]); // Also update if language changes!

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  return (
    <div className='app-container'>
      <header className='app-header'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentFile && (
            <button
              className='theme-toggle'
              onClick={goHome}
              title='Kembali ke Beranda'
            >
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'></path>
                <polyline points='9 22 9 12 15 12 15 22'></polyline>
              </svg>
            </button>
          )}
          {!currentFile && (
            <span className='brand-title' style={{ marginLeft: '8px' }}>
              Kumpulan Buah Pikir
            </span>
          )}
          {currentFile && (
            <span
              className='brand-title'
              style={{ fontSize: '1rem', color: 'var(--text-muted)' }}
            >
              {getDisplayTitle(currentFile)}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className='lang-toggle'
            onClick={toggleLang}
            title='Ganti Bahasa (Translate)'
          >
            {lang.toUpperCase()}
          </button>
          
          <button
            className='theme-toggle'
            onClick={toggleTheme}
            title='Ganti Tema'
          >
            {theme === 'light' ? (
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path>
              </svg>
            ) : (
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='12' cy='12' r='5'></circle>
                <line x1='12' y1='1' x2='12' y2='3'></line>
                <line x1='12' y1='21' x2='12' y2='23'></line>
                <line x1='4.22' y1='4.22' x2='5.64' y2='5.64'></line>
                <line x1='18.36' y1='18.36' x2='19.78' y2='19.78'></line>
                <line x1='1' y1='12' x2='3' y2='12'></line>
                <line x1='21' y1='12' x2='23' y2='12'></line>
                <line x1='4.22' y1='19.78' x2='5.64' y2='18.36'></line>
                <line x1='18.36' y1='4.22' x2='19.78' y2='5.64'></line>
              </svg>
            )}
          </button>
        </div>
      </header>

      <main>
        {currentFile ? (
          <BookViewer content={getDisplayContent(currentFile)} />
        ) : (
          <div className='library-container'>
            <h1 className='library-heading'>Rak Buku</h1>
            <div className='library-grid'>
              {FILE_LIST.filter(file => file.content[lang]).map((file) => (
                <div
                  key={file.id}
                  className='library-card'
                  onClick={() => openBook(file)}
                >
                  <div className='book-spine'></div>
                  <div className='book-cover-content'>
                    <h3>{getDisplayTitle(file)}</h3>
                    <div className='book-divider'></div>
                    <p className='book-author'>@aimeliala</p>
                  </div>
                </div>
              ))}
              {FILE_LIST.filter(file => file.content[lang]).length === 0 && (
                <p style={{ opacity: 0.6 }}>
                  Belum ada tulisan dalam bahasa {lang.toUpperCase()}. Tambahkan file Markdown dengan akhiran <code>-{lang}.md</code>.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Watermark halus di setiap halaman */}
      <div className='watermark'>Buah Pikir oleh @aimeliala</div>
    </div>
  );
}

export default App;
