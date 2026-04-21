import { useState } from 'react';
import { X } from 'lucide-react';

export function EmailTagInput({
  label,
  tags,
  onChange,
  placeholder,
  helperText = 'Press Enter, comma, or Space after each email address',
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  helperText?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !tags.includes(email)) {
      onChange([...tags, email]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--on-surface-variant)',
        display: 'block', marginBottom: 6,
      }}>
        {label}
      </label>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          padding: '0.5rem 0.75rem', borderRadius: '0.75rem', minHeight: 42,
          border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
          cursor: 'text',
        }}
        onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px 2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
            background: '#6245a418', color: '#6245a4', whiteSpace: 'nowrap',
          }}>
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(tags.filter(t => t !== tag)); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, color: '#6245a4', lineHeight: 1, display: 'flex',
              }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.88rem', color: 'var(--on-surface)', padding: '2px 0',
          }}
        />
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>
        {helperText}
      </p>
    </div>
  );
}
