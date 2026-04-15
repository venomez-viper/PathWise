import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Play, Pause, RotateCcw, Coffee, Clock, ChevronDown, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi } from '../../lib/api';
import { Panda } from '../../components/panda';

const TIMER_PRESETS = [
  { label: '15 min', work: 15 * 60, break: 3 * 60 },
  { label: '25 min', work: 25 * 60, break: 5 * 60 },
  { label: '45 min', work: 45 * 60, break: 10 * 60 },
  { label: '60 min', work: 60 * 60, break: 15 * 60 },
];

const AMBIENT_SOUNDS = [
  { id: 'off', label: 'Off', icon: '🔇', file: '' },
  { id: 'rain', label: 'Soft Rain', icon: '🌧️', file: '/audio/rain.mp3' },
  { id: 'ocean', label: 'Ocean Waves', icon: '🌊', file: '/audio/ocean.mp3' },
  { id: 'forest', label: 'Forest', icon: '🌿', file: '/audio/forest.mp3' },
  { id: 'cafe', label: 'Cafe', icon: '☕', file: '/audio/cafe.mp3' },
];

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

const SESSION_KEY = 'pathwise_focus_session';

function loadSession(): { pomodorosCompleted: number; totalFocusSeconds: number; tasksCompleted: number; date: string } {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { pomodorosCompleted: 0, totalFocusSeconds: 0, tasksCompleted: 0, date: '' };
    const data = JSON.parse(raw);
    if (data.date !== new Date().toISOString().split('T')[0]) {
      return { pomodorosCompleted: 0, totalFocusSeconds: 0, tasksCompleted: 0, date: '' };
    }
    return data;
  } catch { return { pomodorosCompleted: 0, totalFocusSeconds: 0, tasksCompleted: 0, date: '' }; }
}

function saveSession(data: { pomodorosCompleted: number; totalFocusSeconds: number; tasksCompleted: number }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, date: new Date().toISOString().split('T')[0] }));
}

export default function FocusMode() {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // Timer config
  const [presetIdx, setPresetIdx] = useState(1); // default 25min
  const [showPresets, setShowPresets] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number | null>(null);
  const preset = customMinutes
    ? { label: `${customMinutes} min`, work: customMinutes * 60, break: Math.round(customMinutes * 60 / 5) }
    : TIMER_PRESETS[presetIdx];

  // Timer state
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [secondsLeft, setSecondsLeft] = useState(preset.work);
  const [running, setRunning] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Session stats
  const [session, setSession] = useState(loadSession);

  // Ambient sound (real audio files)
  const [activeSound, setActiveSound] = useState('off');
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  const playSound = useCallback((soundId: string) => {
    stopSound();
    if (soundId === 'off') { setActiveSound('off'); return; }

    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound?.file) return;

    const audio = new Audio(sound.file);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => { /* autoplay blocked, user will click again */ });
    audioRef.current = audio;
    setActiveSound(soundId);
  }, [volume, stopSound]);

  // Update volume live
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => () => stopSound(), [stopSound]);

  // Task notes
  const [noteTaskId, setNoteTaskId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Shortcuts help
  const [showShortcuts, setShowShortcuts] = useState(false);

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
          // Phase complete
          if (phase === 'work') {
            setSession(s => {
              const updated = {
                pomodorosCompleted: s.pomodorosCompleted + 1,
                totalFocusSeconds: s.totalFocusSeconds + preset.work,
                tasksCompleted: s.tasksCompleted,
              };
              saveSession(updated);
              return { ...updated, date: new Date().toISOString().split('T')[0] };
            });
          }

          if (autoAdvance) {
            const next: TimerPhase = phase === 'work' ? 'break' : 'work';
            setPhase(next);
            setSecondsLeft(next === 'work' ? preset.work : preset.break);
            return next === 'work' ? preset.work : preset.break;
          } else {
            setRunning(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, autoAdvance, preset]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); running ? setRunning(false) : setRunning(true); }
      if (e.code === 'KeyR') { setRunning(false); setSecondsLeft(phase === 'work' ? preset.work : preset.break); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [running, phase, preset]);

  // Warn before navigating away while timer is running
  useEffect(() => {
    if (!running) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [running]);

  const handleStart = useCallback(() => setRunning(true), []);
  const handlePause = useCallback(() => setRunning(false), []);
  const handleReset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(phase === 'work' ? preset.work : preset.break);
  }, [phase, preset]);

  const handleMarkDone = useCallback(async (taskId: string) => {
    try {
      await tasksApi.update(taskId, { status: 'done' });
      setJustCompleted(taskId);
      setTimeout(() => setJustCompleted(null), 2000);
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      setSession(s => {
        const updated = { ...s, tasksCompleted: s.tasksCompleted + 1 };
        saveSession(updated);
        return { ...updated, date: new Date().toISOString().split('T')[0] };
      });
    } catch (e) {
      console.error('Failed to mark task done', e);
    }
  }, []);

  const handleSaveNote = useCallback(async (taskId: string) => {
    try {
      await tasksApi.update(taskId, { description: noteText });
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, description: noteText } : t));
      setNoteTaskId(null);
      setNoteText('');
    } catch { /* silent */ }
  }, [noteText]);

  const selectPreset = (idx: number) => {
    setPresetIdx(idx);
    setCustomMinutes(null);
    setRunning(false);
    setPhase('work');
    setSecondsLeft(TIMER_PRESETS[idx].work);
    setShowPresets(false);
  };

  const setCustomTimer = (mins: number) => {
    const clamped = Math.max(1, Math.min(120, mins));
    setCustomMinutes(clamped);
    setRunning(false);
    setPhase('work');
    setSecondsLeft(clamped * 60);
    setShowPresets(false);
  };

  // Timer ring
  const totalForPhase = phase === 'work' ? preset.work : preset.break;
  const progress = 1 - secondsLeft / totalForPhase;
  const ringSize = 200;
  const ringR = 88;
  const circ = 2 * Math.PI * ringR;
  const strokeOff = circ * (1 - progress);

  // Format session stats
  const focusMinutes = Math.floor(session.totalFocusSeconds / 60);
  const focusHours = Math.floor(focusMinutes / 60);
  const focusRemainder = focusMinutes % 60;
  const focusTimeLabel = focusHours > 0 ? `${focusHours}h ${focusRemainder}m` : `${focusMinutes}m`;

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
      {/* Back link + shortcuts */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/app" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 600,
          color: 'var(--on-surface-variant)', textDecoration: 'none',
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button
          onClick={() => setShowShortcuts(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.72rem', color: 'var(--on-surface-muted)', fontWeight: 600,
          }}
          aria-label="Keyboard shortcuts"
        >
          <Keyboard size={14} /> Shortcuts
        </button>
      </div>

      {/* Shortcuts tooltip */}
      {showShortcuts && (
        <div style={{
          width: '100%', maxWidth: 640, marginBottom: '1rem',
          background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--on-surface-variant)',
          display: 'flex', gap: 24,
        }}>
          <span><kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-container)', fontFamily: 'monospace', fontSize: '0.72rem' }}>Space</kbd> Play / Pause</span>
          <span><kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-container)', fontFamily: 'monospace', fontSize: '0.72rem' }}>R</kbd> Reset timer</span>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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

      {/* Session stats bar */}
      {(session.pomodorosCompleted > 0 || session.tasksCompleted > 0) && (
        <div style={{
          display: 'flex', gap: 20, marginBottom: '1.5rem',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface-variant)',
        }}>
          <span>{session.pomodorosCompleted} pomodoro{session.pomodorosCompleted !== 1 ? 's' : ''}</span>
          <span>{focusTimeLabel} focused</span>
          <span>{session.tasksCompleted} task{session.tasksCompleted !== 1 ? 's' : ''} done</span>
        </div>
      )}

      {/* Timer duration selector */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowPresets(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)', cursor: 'pointer',
          }}
        >
          <Clock size={14} /> {preset.label} <ChevronDown size={14} />
        </button>
        {showPresets && (
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 4, background: 'var(--surface-container-lowest)',
            border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)', overflow: 'hidden', zIndex: 10,
          }}>
            {TIMER_PRESETS.map((p, i) => (
              <button key={i} onClick={() => selectPreset(i)} style={{
                display: 'block', width: '100%', padding: '8px 24px', border: 'none',
                background: !customMinutes && i === presetIdx ? 'rgba(139,79,44,0.08)' : 'transparent',
                color: !customMinutes && i === presetIdx ? 'var(--copper)' : 'var(--on-surface)',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left',
              }}>
                {p.label}
              </button>
            ))}
            <div style={{
              borderTop: '1px solid var(--outline-variant)',
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <input
                type="number" min={1} max={120} placeholder="Custom"
                style={{
                  width: 60, padding: '4px 8px', border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                  background: 'var(--surface)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val > 0) setCustomTimer(val);
                  }
                }}
                aria-label="Custom minutes"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>min</span>
            </div>
          </div>
        )}
      </div>

      {/* Timer */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginBottom: '2rem',
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

        {/* Auto-advance toggle */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.75rem',
          fontSize: '0.75rem', color: 'var(--on-surface-variant)', cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
            style={{ accentColor: 'var(--copper)' }}
          />
          Auto-start next phase
        </label>
      </div>

      {/* Panda - mood changes with timer state */}
      <div style={{ marginBottom: '1rem', transition: 'opacity 0.5s ease' }}>
        <Panda
          mood={
            justCompleted ? 'celebrating'
            : running && phase === 'work' ? 'working'
            : running && phase === 'break' ? 'sleepy'
            : phase === 'break' && !running ? 'happy'
            : secondsLeft === 0 ? 'celebrating'
            : 'thinking'
          }
          size={64}
          animate
        />
      </div>

      {/* Ambient Sound */}
      <div style={{
        width: '100%', maxWidth: 640, marginBottom: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeSound !== 'off' ? <Volume2 size={14} color="var(--copper)" /> : <VolumeX size={14} color="var(--on-surface-muted)" />}
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>
            Ambient Sound
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {AMBIENT_SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => playSound(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                border: activeSound === s.id ? '1.5px solid var(--copper)' : '1px solid var(--outline-variant)',
                background: activeSound === s.id ? 'rgba(139,79,44,0.08)' : 'var(--surface-container-lowest)',
                color: activeSound === s.id ? 'var(--copper)' : 'var(--on-surface)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {activeSound !== 'off' && (
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 160, accentColor: 'var(--copper)' }}
            aria-label="Volume"
          />
        )}
      </div>

      {/* Tasks */}
      <div style={{ width: '100%', maxWidth: 640 }}>
        {focusTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
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
                    {task.description && noteTaskId !== task.id && (
                      <p style={{
                        fontSize: '0.82rem', color: 'var(--on-surface-variant)',
                        lineHeight: 1.5, margin: '6px 0 0',
                      }}>
                        {task.description}
                      </p>
                    )}

                    {/* Quick note */}
                    {noteTaskId === task.id ? (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(task.id); if (e.key === 'Escape') setNoteTaskId(null); }}
                          placeholder="Add a quick note..."
                          autoFocus
                          style={{
                            flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--outline-variant)', fontSize: '0.82rem',
                            fontFamily: 'var(--font-body)', background: 'var(--surface)',
                          }}
                        />
                        <button onClick={() => handleSaveNote(task.id)} style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--copper)', color: '#fff', border: 'none',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        }}>Save</button>
                      </div>
                    ) : (
                      !isDone && (
                        <button
                          onClick={() => { setNoteTaskId(task.id); setNoteText(task.description || ''); }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.72rem', color: 'var(--on-surface-muted)', fontWeight: 600,
                            marginTop: 6, padding: 0,
                          }}
                        >
                          {task.description ? 'Edit note' : '+ Add note'}
                        </button>
                      )
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

      {/* Daily summary */}
      {session.pomodorosCompleted >= 2 && (
        <div style={{
          width: '100%', maxWidth: 640, marginTop: '2rem',
          background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Today's Summary
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface)', lineHeight: 1.5 }}>
            You focused for <strong>{focusTimeLabel}</strong> across {session.pomodorosCompleted} session{session.pomodorosCompleted !== 1 ? 's' : ''} and completed <strong>{session.tasksCompleted} task{session.tasksCompleted !== 1 ? 's' : ''}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
