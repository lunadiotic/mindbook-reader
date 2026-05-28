import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function BookViewer({ content }) {
  const viewportRef = useRef(null);

  // Reset scroll when content changes
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollLeft = 0;
    }
  }, [content]);

  const scrollPrev = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: -viewportRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollBy({ left: viewportRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="book-container">
      <div className="book-viewport" ref={viewportRef}>
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      
      <div className="nav-controls">
        <button className="nav-btn" onClick={scrollPrev}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Prev
        </button>
        <button className="nav-btn" onClick={scrollNext}>
          Next
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}
