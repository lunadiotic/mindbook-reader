import React, { useState, useEffect } from 'react';
import BookViewer from './components/BookViewer';
import './index.css';

// Auto-load all markdown files in src/content
const markdownFiles = import.meta.glob('./content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
});

const FILE_LIST = Object.keys(markdownFiles).map((path) => {
	const fileName = path.split('/').pop().replace('.md', '');
	// Format string: "bab-1" -> "Bab 1"
	const title = fileName
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	return {
		id: fileName,
		title: title,
		content: markdownFiles[path],
	};
});

function App() {
	const getSystemTheme = () => {
		return window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	};

	const [theme, setTheme] = useState(getSystemTheme);
	const [currentFile, setCurrentFile] = useState(null); // Mulai dari beranda

	// Update theme automatically if user changes their system setting
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	return (
		<div className='app-container'>
			<header className='app-header'>
				<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
					{currentFile && (
						<button
							className='theme-toggle'
							onClick={() => setCurrentFile(null)}
							title='Kembali ke Beranda'
						>
							<svg
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'></path>
								<polyline points='9 22 9 12 15 12 15 22'></polyline>
							</svg>
						</button>
					)}
					{!currentFile && (
						<span className='brand-title' style={{ marginLeft: '8px' }}>
							Mindbook
						</span>
					)}
					{currentFile && (
						<span
							className='brand-title'
							style={{ fontSize: '1rem', color: 'var(--text-muted)' }}
						>
							{currentFile.title}
						</span>
					)}
				</div>
				<button
					className='theme-toggle'
					onClick={toggleTheme}
					title='Ganti Tema'
				>
					{theme === 'light' ? (
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path>
						</svg>
					) : (
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
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
			</header>

			<main>
				{currentFile ? (
					<BookViewer content={currentFile.content} />
				) : (
					<div className='library-container'>
						<h1 className='library-heading'>Rak Buku</h1>
						<div className='library-grid'>
							{FILE_LIST.map((file) => (
								<div
									key={file.id}
									className='library-card'
									onClick={() => setCurrentFile(file)}
								>
									<div className='book-cover-content'>
										<h3>{file.title}</h3>
										<div className='book-divider'></div>
										<p className='book-author'>@aimeliala</p>
									</div>
								</div>
							))}
							{FILE_LIST.length === 0 && (
								<p style={{ opacity: 0.6 }}>
									Belum ada tulisan. Tambahkan file Markdown (.md) ke dalam
									folder <code>src/content/</code>.
								</p>
							)}
						</div>
					</div>
				)}
			</main>

			{/* Watermark halus di setiap halaman */}
			<div className='watermark'>Buah Pikir @aimeliala</div>
		</div>
	);
}

export default App;
