import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import type { Task } from './types';
import { widgetTitleStyle } from './types';

interface QuickStartProps {
  todoTasks: Task[];
  onMoveTask: (task: Task, status: Task['status']) => void;
}

export default function QuickStart({ todoTasks, onMoveTask }: QuickStartProps) {
  const [shuffleAnimating, setShuffleAnimating] = useState(false);
  const todoCount = todoTasks.length;

  const pickRandomTask = () => {
    if (todoCount === 0) return;
    setShuffleAnimating(true);
    setTimeout(() => {
      const random = todoTasks[Math.floor(Math.random() * todoTasks.length)];
      onMoveTask(random, 'in_progress');
      setShuffleAnimating(false);
    }, 400);
  };

  return (
    <div className="panel" style={{ borderRadius: '1.5rem', padding: '1.1rem 1.2rem' }}>
      <h4 style={widgetTitleStyle}>
        <Shuffle size={15} color="#006a62" /> Quick Start
      </h4>
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface)', margin: '0 0 10px' }}>
          You have <strong style={{ color: '#8b4f2c' }}>{todoCount}</strong> task{todoCount !== 1 ? 's' : ''} ready
        </p>
        <button
          onClick={pickRandomTask}
          disabled={todoCount === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            width: '100%', padding: '8px 12px',
            border: '1.5px solid rgba(0,106,98,0.2)', borderRadius: '0.75rem',
            background: 'rgba(0,106,98,0.06)', color: '#006a62',
            fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-body)',
            cursor: todoCount > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', opacity: todoCount === 0 ? 0.5 : 1,
          }}
        >
          <Shuffle size={13} style={{ transition: 'transform 0.4s', transform: shuffleAnimating ? 'rotate(360deg)' : 'none' }} />
          {shuffleAnimating ? 'Picking...' : 'Pick a random task'}
        </button>
      </div>
    </div>
  );
}
