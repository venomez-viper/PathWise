import { useState } from 'react';
import { MessageCircle, Shuffle } from 'lucide-react';
import { widgetTitleStyle } from './types';

const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your career is a marathon, not a sprint. Pace yourself and keep moving.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Your limitation is only your imagination.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Dream big, start small, act now.", author: "Robin Sharma" },
];

export default function MotivationalQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <MessageCircle size={15} color="#8b4f2c" /> Motivation
      </h4>
      <div style={{ marginTop: 10 }}>
        <div style={{ position: 'relative', padding: '0 4px' }}>
          <span style={{ position: 'absolute', top: -4, left: -2, fontSize: '1.8rem', color: 'rgba(139,79,44,0.15)', fontFamily: 'Georgia, serif', lineHeight: 1 }}>&ldquo;</span>
          <p style={{
            fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--on-surface)',
            lineHeight: 1.55, margin: '0 0 6px', paddingLeft: 14,
          }}>
            {MOTIVATIONAL_QUOTES[currentQuoteIndex].text}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: 0, paddingLeft: 14, fontWeight: 600 }}>
            -- {MOTIVATIONAL_QUOTES[currentQuoteIndex].author}
          </p>
        </div>
        <button
          onClick={() => setCurrentQuoteIndex((currentQuoteIndex + 1) % MOTIVATIONAL_QUOTES.length)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
            width: '100%', marginTop: 10, padding: '6px',
            border: '1px solid var(--outline-variant)', borderRadius: '0.5rem',
            background: 'transparent', color: 'var(--on-surface-variant)',
            fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
        >
          <Shuffle size={11} /> Next
        </button>
      </div>
    </div>
  );
}
