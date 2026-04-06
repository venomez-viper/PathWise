import { useState, useMemo } from 'react';
import { BookOpen, Shuffle, Check } from 'lucide-react';
import { CATEGORY_LABELS, widgetTitleStyle } from './types';

const RESOURCE_TIPS: Record<string, string> = {
  learning: "Try a focused 25-min study session (Pomodoro technique)",
  portfolio: "Commit one small improvement to a project today",
  networking: "Send one LinkedIn message to someone in your target field",
  interview_prep: "Practice one behavioral question using the STAR method",
  certification: "Review 10 flashcards for your certification exam",
  research: "Read one industry article and summarize key takeaways",
  reflection: "Write a 5-minute journal entry about your career progress",
};

interface ResourceTipProps {
  taskCategories: string[];
}

export default function ResourceTip({ taskCategories }: ResourceTipProps) {
  const [resourceTipIndex, setResourceTipIndex] = useState(0);
  const [tipNoted, setTipNoted] = useState(false);

  const availableTips = useMemo(() => {
    const cats = new Set(taskCategories.filter(Boolean));
    const tips: { category: string; tip: string }[] = [];
    cats.forEach(cat => {
      if (RESOURCE_TIPS[cat]) tips.push({ category: cat, tip: RESOURCE_TIPS[cat] });
    });
    // Always include at least a few
    if (tips.length === 0) {
      Object.entries(RESOURCE_TIPS).forEach(([cat, tip]) => tips.push({ category: cat, tip }));
    }
    return tips;
  }, [taskCategories]);

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <BookOpen size={15} color="#006a62" /> Resource Tip
      </h4>
      <div style={{ marginTop: 10 }}>
        {availableTips.length > 0 ? (
          <>
            <div
              onClick={() => !tipNoted && setTipNoted(true)}
              style={{
                padding: '10px 12px', borderRadius: '0.75rem',
                background: tipNoted ? 'rgba(52,211,153,0.08)' : 'rgba(0,106,98,0.05)',
                border: `1px solid ${tipNoted ? 'rgba(52,211,153,0.2)' : 'rgba(0,106,98,0.1)'}`,
                cursor: tipNoted ? 'default' : 'pointer', transition: 'all 0.2s',
              }}
            >
              <span className={`kanban-badge kanban-badge--${availableTips[resourceTipIndex % availableTips.length].category}`} style={{ marginBottom: 6, display: 'inline-flex' }}>
                {CATEGORY_LABELS[availableTips[resourceTipIndex % availableTips.length].category] ?? availableTips[resourceTipIndex % availableTips.length].category}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface)', margin: '6px 0 0', lineHeight: 1.45 }}>
                {availableTips[resourceTipIndex % availableTips.length].tip}
              </p>
              {tipNoted && (
                <p style={{ fontSize: '0.7rem', color: '#059669', margin: '6px 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> Noted!
                </p>
              )}
            </div>
            <button
              onClick={() => { setResourceTipIndex(i => i + 1); setTipNoted(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                width: '100%', marginTop: 8, padding: '6px',
                border: '1px solid var(--outline-variant)', borderRadius: '0.5rem',
                background: 'transparent', color: 'var(--on-surface-variant)',
                fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              <Shuffle size={11} /> New Tip
            </button>
          </>
        ) : (
          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Add tasks to get personalized tips.</p>
        )}
      </div>
    </div>
  );
}
