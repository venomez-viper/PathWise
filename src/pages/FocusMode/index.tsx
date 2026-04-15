import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi } from '../../lib/api';
import { Panda } from '../../components/panda';

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type TimerPhase = 'work' | 'break';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function FocusMode() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // Timer state
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch tasks
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await tasksApi.list(user.id) as any;
        if (!cancelled) setAllTasks(res.tasks ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Filter: today/overdue tasks, fallback to in_progress
  const now = new Date();
  const todayTasks = allTasks.filter((t: any) => {
    if (t.status === 'done') return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return isSameDay(due, now) || due < now;
  });
  const focusTasks = todayTasks.length > 0
    ? todayTasks
    : allTasks.filter((t: any) => t.status === 'in_progress');

  // Timer tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setRunning(false);
          // Auto-switch phase
          setPhase(p => {
            const next = p === 'work' ? 'break' : 'work';
            setSecondsLeft(next === 'work' ? WORK_SECONDS : BREAK_SECONDS);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStart = useCallback(() => setRunning(true), []);
  const handlePause = useCallback(() => setRunning(false), []);
  const handleReset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(phase === 'work' ? WORK_SECONDS : BREAK_SECONDS);
  }, [phase]);

  const handleMarkDone = useCallback(async (taskId: string) => {
    try {
      await tasksApi.update(taskId, { status: 'done' });
      setJustCompleted(taskId);
      setTimeout(() => setJustCompleted(null), 2000);
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
    } catch (e) {
      console.error('Failed to mark task done', e);
    }
  }, []);

  // Panda mood
  const pandaMood = justCompleted ? 'celebrating' : running ? 'working' : phase === 'break' ? 'happy' : 'thinking';

  // Timer ring
  const totalForPhase = phase === 'work' ? WORK_SECONDS : BREAK_SECONDS;
  const progress = 1 - secondsLeft / totalForPhase;
  const ringSize = 200;
  const ringR = 88;
  const circ = 2 * Math.PI * ringR;
  const strokeOff = circ * (1 - progress);

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
      }}>
        <div style={{
          width: 28, height: 28,
          border: '3px solid var(--surface-container)',
          borderTopColor: 'var(--copper)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem 1.5rem 4rem',
    }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '1.5rem' }}>
        <Link to="/app" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 600,
          color: 'var(--on-surface-variant)', textDecoration: 'none',
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
          color: 'var(--on-surface)', letterSpacing: '-0.03em', marginBottom: 4,
        }}>
          Focus Mode
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
          {phase === 'break' ? 'Time for a short break.' : 'One task at a time. Stay focused.'}
        </p>
      </div>

      {/* Timer */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '3rem',
      }}>
        <div style={{ position: 'relative', width: ringSize, height: ringSize, marginBottom: '1.25rem' }}>
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none" stroke="var(--surface-container)" strokeWidth={6}
            />
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={ringR}
              fill="none"
              stroke={running ? 'var(--copper)' : 'var(--on-surface-variant)'}
              strokeWidth={6} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={strokeOff}
              style={{
                transform: 'rotate(-90deg)', transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease',
              }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
              fontSize: '2.75rem', fontWeight: 700,
              color: running ? 'var(--copper)' : 'var(--on-surface)',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              {formatTime(secondsLeft)}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.1em', marginTop: 6,
              color: phase === 'break' ? 'var(--copper)' : 'var(--on-surface-variant)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {phase === 'break' && <Coffee size={12} />}
              {phase === 'work' ? 'Work Session' : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Timer controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!running ? (
            <button onClick={handleStart} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: 'var(--copper)', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139,79,44,0.25)',
            }}>
              <Play size={16} /> Start
            </button>
          ) : (
            <button onClick={handlePause} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container)', color: 'var(--on-surface)',
              border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              <Pause size={16} /> Pause
            </button>
          )}
          <button onClick={handleReset} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 'var(--radius-full)',
            background: 'var(--surface-container)', color: 'var(--on-surface-variant)',
            border: 'none', cursor: 'pointer',
          }} aria-label="Reset timer">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ width: '100%', maxWidth: 640 }}>
        {focusTasks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
          }}>
            <Panda mood="happy" size={100} animate />
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700,
              color: 'var(--on-surface)', marginTop: '1rem',
            }}>
              All clear for today!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
              No tasks due today. Enjoy the free time or check your full task list.
            </p>
            <Link to="/app/tasks" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: '1rem',
              padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-full)',
              background: 'var(--surface-container)', color: 'var(--on-surface)',
              fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none',
            }}>
              View All Tasks
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--on-surface-variant)',
            }}>
              {todayTasks.length > 0 ? "Today's Tasks" : 'In Progress'}
              <span style={{ marginLeft: 8, fontWeight: 600, color: 'var(--copper)' }}>
                {focusTasks.length}
              </span>
            </p>

            {focusTasks.map((task: any) => {
              const isDone = task.status === 'done';
              const isJustDone = justCompleted === task.id;
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const isOverdue = dueDate && dueDate < now && !isDone;

              return (
                <div key={task.id} style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '1.5rem 1.75rem',
                  display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                  opacity: isDone ? 0.5 : 1,
                  transition: 'opacity 0.4s ease, transform 0.3s ease',
                  transform: isJustDone ? 'scale(0.98)' : 'scale(1)',
                }}>
                  {/* Checkbox */}
                  <button
                    onClick={() => !isDone && handleMarkDone(task.id)}
                    disabled={isDone}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      border: `2.5px solid ${isDone || isJustDone ? 'var(--copper)' : 'var(--surface-container-high)'}`,
                      background: isDone || isJustDone ? 'rgba(139,79,44,0.12)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: isDone ? 'default' : 'pointer', marginTop: 2,
                      transition: 'all 0.3s ease',
                    }}
                    aria-label={`Mark "${task.title}" as done`}
                  >
                    {(isDone || isJustDone) && <Check size={14} color="var(--copper)" strokeWidth={3} />}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700,
                      color: isDone ? 'var(--on-surface-variant)' : 'var(--on-surface)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      lineHeight: 1.3, margin: 0,
                    }}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p style={{
                        fontSize: '0.82rem', color: 'var(--on-surface-variant)',
                        lineHeight: 1.5, marginTop: 6, margin: '6px 0 0',
                      }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                    }}>
                      {isOverdue && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600, color: '#ef4444',
                          background: 'rgba(239,68,68,0.08)', padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}>Overdue</span>
                      )}
                      {dueDate && !isOverdue && !isDone && (
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600,
                          color: 'var(--on-surface-muted)',
                        }}>
                          Due {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {task.priority === 'high' && !isDone && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, color: 'var(--copper)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>High priority</span>
                      )}
                    </div>
                  </div>

                  {/* Mark done button */}
                  {!isDone && (
                    <button
                      onClick={() => handleMarkDone(task.id)}
                      style={{
                        padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
                        background: 'var(--surface-container)',
                        color: 'var(--on-surface)', border: 'none',
                        fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,79,44,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
