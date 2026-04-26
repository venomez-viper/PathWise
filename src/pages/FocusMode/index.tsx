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

// NOTE: All ambient files live in /public/audio/. Tracks loop seamlessly via
// audioRef.loop = true. For the seam to be inaudible each source should be
// 3+ minutes. To add a new track: drop a CC0 mp3 in /public/audio/ at the
// path below and the option lights up.
//
// Where to source CC0 / royalty-free tracks (5–10 min each is ideal):
//   Pixabay     — https://pixabay.com/sound-effects/  (search "ambient", "lofi", "rain", "fireplace")
//   Mixkit      — https://mixkit.co/free-sound-effects/  (high-quality, no attribution)
//   Freesound   — https://freesound.org/  (CC0-filtered)
//   Incompetech — https://incompetech.com/  (Kevin MacLeod, CC-BY)
//   chosic.com  — https://www.chosic.com/free-music/  (lofi & ambient)
//
// rain.mp3 is currently a short clip — replace at /public/audio/rain.mp3 with
// a 5+ min track so the loop is inaudible.
type AmbientGroup = 'nature' | 'spaces' | 'tones';
type AmbientTone = 'light' | 'dark'; // foreground brightness against the gradient
type AmbientTrack = {
  id: string; label: string; icon: string; file: string; group: AmbientGroup;
  /** CSS background applied to the focus-mode page when this track plays. */
  gradient: string;
  /** 'light' = light text on dark gradient, 'dark' = dark text on light gradient. */
  tone: AmbientTone;
};

// Gradients are mood-matched to each track. Smoothly transition between
// them via CSS transition on the page wrapper.
const AMBIENT_SOUNDS: AmbientTrack[] = [
  // Nature
  { id: 'rain',       label: 'Soft Rain',     icon: '🌧️', file: '/audio/rain.mp3',        group: 'nature', tone: 'light',
    gradient: 'radial-gradient(at 20% 0%, #6b8aa8 0%, transparent 55%), radial-gradient(at 80% 100%, #5a738d 0%, transparent 55%), linear-gradient(180deg, #2f4456 0%, #4a6079 100%)' },
  { id: 'ocean',      label: 'Ocean Waves',   icon: '🌊', file: '/audio/ocean.mp3',       group: 'nature', tone: 'light',
    gradient: 'radial-gradient(at 20% 100%, #2a8a8a 0%, transparent 60%), radial-gradient(at 80% 0%, #5cc4c4 0%, transparent 55%), linear-gradient(180deg, #06384a 0%, #1c6b78 100%)' },
  { id: 'forest',     label: 'Forest',        icon: '🌿', file: '/audio/forest.mp3',      group: 'nature', tone: 'light',
    gradient: 'radial-gradient(at 30% 20%, #7ba968 0%, transparent 55%), radial-gradient(at 70% 100%, #345a2c 0%, transparent 60%), linear-gradient(180deg, #1f3a18 0%, #4d7a3c 100%)' },
  { id: 'stream',     label: 'River Stream',  icon: '💧', file: '/audio/stream.mp3',      group: 'nature', tone: 'dark',
    gradient: 'radial-gradient(at 30% 0%, #b6dcd8 0%, transparent 55%), radial-gradient(at 70% 100%, #6ba8a0 0%, transparent 55%), linear-gradient(180deg, #4f8a85 0%, #cfe9e3 100%)' },
  { id: 'birds',      label: 'Birdsong',      icon: '🐦', file: '/audio/birds.mp3',       group: 'nature', tone: 'dark',
    gradient: 'radial-gradient(at 50% 0%, #ffd49a 0%, transparent 55%), radial-gradient(at 20% 100%, #f0a36a 0%, transparent 55%), linear-gradient(180deg, #ffd9a3 0%, #ffb074 100%)' },
  { id: 'fireplace',  label: 'Fireplace',     icon: '🔥', file: '/audio/fireplace.mp3',   group: 'nature', tone: 'light',
    gradient: 'radial-gradient(at 50% 100%, #ff7a3d 0%, transparent 55%), radial-gradient(at 30% 30%, #b8421a 0%, transparent 55%), linear-gradient(180deg, #2b0d05 0%, #6b240e 100%)' },
  { id: 'thunder',    label: 'Thunderstorm',  icon: '⛈️', file: '/audio/thunder.mp3',     group: 'nature', tone: 'light',
    gradient: 'radial-gradient(at 70% 0%, #4b3a6e 0%, transparent 55%), radial-gradient(at 20% 100%, #1f2030 0%, transparent 60%), linear-gradient(180deg, #14152b 0%, #303347 100%)' },
  // Spaces
  { id: 'cafe',       label: 'Cafe',          icon: '☕', file: '/audio/cafe.mp3',        group: 'spaces', tone: 'light',
    gradient: 'radial-gradient(at 30% 20%, #d4a573 0%, transparent 55%), radial-gradient(at 80% 100%, #6e3f21 0%, transparent 55%), linear-gradient(180deg, #3d2415 0%, #8b5a36 100%)' },
  { id: 'library',    label: 'Library',       icon: '📚', file: '/audio/library.mp3',    group: 'spaces', tone: 'light',
    gradient: 'radial-gradient(at 20% 0%, #cdb494 0%, transparent 55%), radial-gradient(at 80% 100%, #7a5a3a 0%, transparent 55%), linear-gradient(180deg, #4d3826 0%, #9a7d57 100%)' },
  // Tones & music
  { id: 'lofi',       label: 'Lo-Fi Beats',   icon: '🎧', file: '/audio/lofi.mp3',        group: 'tones', tone: 'light',
    gradient: 'radial-gradient(at 70% 0%, #ff9aa8 0%, transparent 55%), radial-gradient(at 30% 100%, #6a4ec7 0%, transparent 55%), linear-gradient(180deg, #2b1d4a 0%, #6f47a8 100%)' },
  { id: 'piano',      label: 'Piano',         icon: '🎹', file: '/audio/piano.mp3',       group: 'tones', tone: 'dark',
    gradient: 'radial-gradient(at 30% 20%, #e9dcf2 0%, transparent 55%), radial-gradient(at 70% 100%, #c1a8d6 0%, transparent 55%), linear-gradient(180deg, #f5ecf6 0%, #d6c2dc 100%)' },
  { id: 'brown',      label: 'Brown Noise',   icon: '🟫', file: '/audio/brown-noise.mp3', group: 'tones', tone: 'light',
    gradient: 'radial-gradient(at 20% 100%, #6b4a2b 0%, transparent 60%), linear-gradient(180deg, #2b1a0e 0%, #553820 100%)' },
  { id: 'white',      label: 'White Noise',   icon: '⚪', file: '/audio/white-noise.mp3', group: 'tones', tone: 'dark',
    gradient: 'radial-gradient(at 50% 50%, #ffffff 0%, transparent 60%), linear-gradient(180deg, #d6d8dc 0%, #f3f4f6 100%)' },
];

/** Default background when no track is playing. Inherits the page surface. */
const AMBIENT_IDLE_GRADIENT = 'linear-gradient(180deg, var(--surface) 0%, var(--surface-container-low) 100%)';

const AMBIENT_GROUPS: { id: AmbientGroup; label: string; icon: string }[] = [
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'spaces', label: 'Spaces', icon: '🏛' },
  { id: 'tones',  label: 'Tones',  icon: '🎧' },
];

function AmbientPicker({
  active, volume, onPick, onStop, onVolume,
}: {
  active: string;
  volume: number;
  onPick: (id: string) => void;
  onStop: () => void;
  onVolume: (v: number) => void;
}) {
  const [group, setGroup] = useState<AmbientGroup>(() => {
    const found = AMBIENT_SOUNDS.find(s => s.id === active);
    return found?.group ?? 'nature';
  });
  const isPlaying = active !== 'off';
  const activeTrack = AMBIENT_SOUNDS.find(s => s.id === active);
  const visible = AMBIENT_SOUNDS.filter(s => s.group === group);

  return (
    <div style={{
      width: '100%', maxWidth: 640, marginBottom: '2rem',
      borderRadius: 'var(--radius-lg, 16px)',
      border: '1px solid var(--outline-variant)',
      background: 'var(--surface-container-lowest)',
      overflow: 'hidden',
    }}>
      {/* Header / mini-player */}
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--outline-variant)',
        background: isPlaying ? 'rgba(139,79,44,0.06)' : 'var(--surface-container-low)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: isPlaying ? 'rgba(139,79,44,0.15)' : 'var(--surface-container)',
          color: isPlaying ? 'var(--copper)' : 'var(--on-surface-variant)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--on-surface-variant)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            Ambient sound
            {isPlaying && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--copper)',
                animation: 'spin 1.6s ease-in-out infinite',
                opacity: 0.85,
              }} />
            )}
          </div>
          <div style={{
            fontSize: '0.92rem', fontWeight: 700, color: 'var(--on-surface)', marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isPlaying && activeTrack ? `${activeTrack.icon}  ${activeTrack.label}` : 'Silent'}
          </div>
        </div>
        {isPlaying && (
          <button
            onClick={onStop}
            aria-label="Stop ambient sound"
            style={{
              height: 30, padding: '0 12px', borderRadius: 9,
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface)', color: 'var(--on-surface)',
              fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
          >
            Stop
          </button>
        )}
      </div>

      {/* Group tabs */}
      <div style={{
        display: 'flex', padding: '8px 8px 0', gap: 4,
        borderBottom: '1px solid var(--outline-variant)',
      }}>
        {AMBIENT_GROUPS.map(g => {
          const on = group === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              role="tab"
              aria-selected={on}
              style={{
                flex: 1, height: 36, padding: '0 10px',
                borderRadius: '10px 10px 0 0',
                border: 'none', borderBottom: on ? '2px solid var(--copper)' : '2px solid transparent',
                background: on ? 'rgba(139,79,44,0.06)' : 'transparent',
                color: on ? 'var(--copper)' : 'var(--on-surface-variant)',
                fontSize: '0.78rem', fontWeight: on ? 700 : 600,
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
            >
              <span aria-hidden="true">{g.icon}</span>{g.label}
            </button>
          );
        })}
      </div>

      {/* Track grid */}
      <div style={{
        padding: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 8,
      }}>
        {visible.map(s => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              aria-pressed={on}
              style={{
                aspectRatio: '1 / 1', minHeight: 84,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: 8, borderRadius: 12, cursor: 'pointer',
                border: on ? '1.5px solid var(--copper)' : '1px solid var(--outline-variant)',
                background: on ? 'rgba(139,79,44,0.08)' : 'var(--surface)',
                color: on ? 'var(--copper)' : 'var(--on-surface)',
                fontSize: '0.72rem', fontWeight: on ? 700 : 600,
                boxShadow: on ? '0 1px 2px rgba(139,79,44,0.18)' : 'none',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-container)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'var(--surface)'; }}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }} aria-hidden="true">{s.icon}</span>
              <span style={{
                textAlign: 'center', lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {s.label}
              </span>
              {on && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--copper)',
                  boxShadow: '0 0 0 3px rgba(139,79,44,0.18)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Volume slider — only when playing */}
      {isPlaying && (
        <div style={{
          padding: '10px 14px 14px',
          borderTop: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-container-low)',
        }}>
          <VolumeX size={13} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={e => onVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{
              flex: 1, accentColor: 'var(--copper)', cursor: 'pointer',
            }}
          />
          <Volume2 size={13} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)',
            minWidth: 32, textAlign: 'right',
          }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

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
    // Warn the developer if a track is shorter than 3 minutes — the loop
    // becomes audible at that length. Replace at /public/audio/<file>.
    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration < 180) {
        console.warn(
          `[FocusMode] "${sound.label}" (${sound.file}) is only ${audio.duration.toFixed(1)}s — ` +
          `loops will be audible. Replace with a 3+ minute CC0 track. See /public/audio/SOURCES.md.`
        );
      }
    }, { once: true });
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

  // Mood-matched background driven by the active ambient track. Falls back
  // to the page surface when nothing is playing. We layer the gradient on
  // top of the surface and dim it via opacity-on-overlay so text legibility
  // stays solid.
  const activeTrack = AMBIENT_SOUNDS.find(s => s.id === activeSound);
  const isAmbientActive = activeSound !== 'off' && !!activeTrack;

  // Adaptive foreground tone — let text and chrome stay legible on every
  // gradient. `light` tracks (dark gradients) → near-white text; `dark`
  // tracks (light gradients) → near-black text. The wrapper exposes the
  // value as a `--ambient-fg` CSS variable so descendants can opt in:
  // `color: 'var(--ambient-fg, var(--on-surface))'`.
  const ambientTone: AmbientTone = isAmbientActive ? activeTrack.tone : 'dark';
  const ambientFg = ambientTone === 'light' ? '#f5f7fb' : '#1a1c1f';
  const ambientFgMuted = ambientTone === 'light' ? 'rgba(245,247,251,0.78)' : 'rgba(26,28,31,0.7)';
  const scrimGradient = ambientTone === 'light'
    // Dark tracks → soft dark scrim with bright top fade so dark gradient
    // breathes and white text retains contrast.
    ? 'linear-gradient(180deg, rgba(15,17,22,0.18) 0%, rgba(15,17,22,0.34) 100%)'
    // Light tracks → soft surface scrim so dark text stays readable.
    : 'linear-gradient(180deg, rgba(238,252,254,0.55) 0%, rgba(238,252,254,0.35) 100%)';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: isAmbientActive
        ? `${activeTrack.gradient}, ${AMBIENT_IDLE_GRADIENT}`
        : AMBIENT_IDLE_GRADIENT,
      backgroundColor: 'var(--surface)',
      backgroundAttachment: 'fixed',
      transition: 'background-image 0.6s ease-in-out, color 0.4s ease-in-out',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem 1.5rem 4rem',
      position: 'relative',
      color: ambientFg,
      // CSS custom properties for descendants that opt in.
      ['--ambient-fg' as string]: ambientFg,
      ['--ambient-fg-muted' as string]: ambientFgMuted,
    }}>
      {/* Surface scrim — adapts to track tone for legibility. */}
      {isAmbientActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none',
            background: scrimGradient,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 0,
            transition: 'background 0.6s ease-in-out',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.5s ease',
      }}>
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
          style={{ display: 'block' }}
        />
      </div>

      {/* Ambient Sound — modern picker */}
      <AmbientPicker
        active={activeSound}
        volume={volume}
        onPick={playSound}
        onStop={() => playSound('off')}
        onVolume={setVolume}
      />

      {/* Tasks */}
      <div style={{ width: '100%', maxWidth: 640 }}>
        {focusTasks.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '3rem 1rem', textAlign: 'center',
          }}>
            <Panda mood="happy" size={100} animate style={{ display: 'block' }} />
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
    </div>
  );
}
