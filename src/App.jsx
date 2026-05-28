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
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [currentFile, setCurrentFile] = useState(
		FILE_LIST.length > 0 ? FILE_LIST[0] : null,
	);

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
					<button
						className='theme-toggle'
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						title='Daftar Isi'
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
							<line x1='3' y1='12' x2='21' y2='12'></line>
							<line x1='3' y1='6' x2='21' y2='6'></line>
							<line x1='3' y1='18' x2='21' y2='18'></line>
						</svg>
					</button>
					<span className='brand-title'>MindBook</span>
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

			<div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
				<h2 className='sidebar-title'>Daftar Isi</h2>
				<ul className='file-list'>
					{FILE_LIST.map((file) => (
						<li key={file.id} className='file-item'>
							<button
								className={`file-btn ${currentFile?.id === file.id ? 'active' : ''}`}
								onClick={() => {
									setCurrentFile(file);
									setIsSidebarOpen(false);
								}}
							>
								{file.title}
							</button>
						</li>
					))}
					{FILE_LIST.length === 0 && (
						<li className='file-item' style={{ opacity: 0.5 }}>
							Tidak ada file markdown di src/content/
						</li>
					)}
				</ul>
			</div>
			<div
				className={`overlay ${isSidebarOpen ? 'visible' : ''}`}
				onClick={() => setIsSidebarOpen(false)}
			></div>

			<main>
				{currentFile ? (
					<BookViewer content={currentFile.content} />
				) : (
					<div style={{ padding: '100px', textAlign: 'center' }}>
						Tambahkan file .md ke folder src/content/
					</div>
				)}
			</main>

			{/* Watermark halus di setiap halaman */}
			<div className='watermark'>Buah Pikir @aimeliala</div>
		</div>
	);
}

export default App;
