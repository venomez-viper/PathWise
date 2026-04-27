import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Play, Pause, RotateCcw, Coffee, Clock, ChevronDown, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { tasks as tasksApi } from '../../lib/api';
import { Panda } from '../../components/panda';
import { useChime } from './hooks/useChime';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { usePomodoroNotification } from './hooks/usePomodoroNotification';
import { useDailyTarget } from './hooks/useDailyTarget';
import { useStreakSync } from './hooks/useStreakSync';
import { AmbientParticles } from './components/AmbientParticles';
import { BreathworkInterlude } from './components/BreathworkInterlude';
import { TaskFocusBinding } from './components/TaskFocusBinding';
import { MiniPlayer } from './components/MiniPlayer';
import { DailyTargetCard } from './components/DailyTargetCard';

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
type AmbientTrack = {
  id: string; label: string; icon: string; file: string; group: AmbientGroup;
  /** Card-level CSS gradient — used as album-art on the picker. */
  gradient: string;
};

/** Real photo wallpaper path for an ambient track. The file may or may not
 *  exist on disk — page CSS falls back to the surface colour if it 404s. */
function trackWallpaper(id: string): string {
  return `/wallpapers/${id}.jpg`;
}

// Gradients are mood-matched to each track. Smoothly transition between
// them via CSS transition on the page wrapper.
const AMBIENT_SOUNDS: AmbientTrack[] = [
  // Nature
  { id: 'rain',       label: 'Soft Rain',     icon: '🌧️', file: '/audio/rain.mp3',        group: 'nature',
    gradient: 'radial-gradient(at 20% 0%, #6b8aa8 0%, transparent 55%), radial-gradient(at 80% 100%, #5a738d 0%, transparent 55%), linear-gradient(180deg, #2f4456 0%, #4a6079 100%)' },
  { id: 'ocean',      label: 'Ocean Waves',   icon: '🌊', file: '/audio/ocean.mp3',       group: 'nature',
    gradient: 'radial-gradient(at 20% 100%, #2a8a8a 0%, transparent 60%), radial-gradient(at 80% 0%, #5cc4c4 0%, transparent 55%), linear-gradient(180deg, #06384a 0%, #1c6b78 100%)' },
  { id: 'forest',     label: 'Forest',        icon: '🌿', file: '/audio/forest.mp3',      group: 'nature',
    gradient: 'radial-gradient(at 30% 20%, #7ba968 0%, transparent 55%), radial-gradient(at 70% 100%, #345a2c 0%, transparent 60%), linear-gradient(180deg, #1f3a18 0%, #4d7a3c 100%)' },
  { id: 'wind',       label: 'Wind',          icon: '🍃', file: '/audio/wind.mp3',        group: 'nature',
    gradient: 'radial-gradient(at 30% 0%, #d6e7f0 0%, transparent 55%), radial-gradient(at 70% 100%, #f5ecdc 0%, transparent 55%), linear-gradient(180deg, #b6cfe0 0%, #f0e5c8 100%)' },
  { id: 'crickets',   label: 'Crickets',      icon: '🦗', file: '/audio/crickets.mp3',    group: 'nature',
    gradient: 'radial-gradient(at 30% 0%, #2a3f6e 0%, transparent 55%), radial-gradient(at 70% 100%, #0c1733 0%, transparent 60%), linear-gradient(180deg, #060a1c 0%, #1a2649 100%)' },
  { id: 'fireplace',  label: 'Fireplace',     icon: '🔥', file: '/audio/fireplace.mp3',   group: 'nature',
    gradient: 'radial-gradient(at 50% 100%, #ff7a3d 0%, transparent 55%), radial-gradient(at 30% 30%, #b8421a 0%, transparent 55%), linear-gradient(180deg, #2b0d05 0%, #6b240e 100%)' },
  { id: 'thunder',    label: 'Thunderstorm',  icon: '⛈️', file: '/audio/thunder.mp3',     group: 'nature',
    gradient: 'radial-gradient(at 70% 0%, #4b3a6e 0%, transparent 55%), radial-gradient(at 20% 100%, #1f2030 0%, transparent 60%), linear-gradient(180deg, #14152b 0%, #303347 100%)' },
  // Spaces
  { id: 'cafe',       label: 'Cafe',          icon: '☕', file: '/audio/cafe.mp3',        group: 'spaces',
    gradient: 'radial-gradient(at 30% 20%, #d4a573 0%, transparent 55%), radial-gradient(at 80% 100%, #6e3f21 0%, transparent 55%), linear-gradient(180deg, #3d2415 0%, #8b5a36 100%)' },
  // Tones
  { id: 'piano',      label: 'Piano',         icon: '🎹', file: '/audio/piano.mp3',       group: 'tones',
    gradient: 'radial-gradient(at 30% 20%, #e9dcf2 0%, transparent 55%), radial-gradient(at 70% 100%, #c1a8d6 0%, transparent 55%), linear-gradient(180deg, #f5ecf6 0%, #d6c2dc 100%)' },
  { id: 'brown',      label: 'Brown Noise',   icon: '🟫', file: '/audio/brown-noise.mp3', group: 'tones',
    gradient: 'radial-gradient(at 20% 100%, #6b4a2b 0%, transparent 60%), linear-gradient(180deg, #2b1a0e 0%, #553820 100%)' },
  { id: 'white',      label: 'White Noise',   icon: '⚪', file: '/audio/white-noise.mp3', group: 'tones',
    gradient: 'radial-gradient(at 50% 50%, #ffffff 0%, transparent 60%), linear-gradient(180deg, #d6d8dc 0%, #f3f4f6 100%)' },
];

// (Group metadata stays on each track for filtered views; the coverflow
// renders all tracks in a single rail so we no longer surface the tabs.)

function AmbientPicker({
  active, volume, onPick, onStop, onVolume,
}: {
  active: string;
  volume: number;
  onPick: (id: string) => void;
  onStop: () => void;
  onVolume: (v: number) => void;
}) {
  const isPlaying = active !== 'off';
  const activeTrack = AMBIENT_SOUNDS.find(s => s.id === active);
  const trackRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Centre the active card whenever the user picks a new one — gives the
  // iPod-album feel where the chosen track slides to the middle.
  useEffect(() => {
    const el = trackRefs.current[active];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [active]);

  return (
    <div style={{
      width: '100%', maxWidth: 720, marginBottom: '2rem',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Now-playing strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {isPlaying ? <Volume2 size={14} color="var(--copper)" /> : <VolumeX size={14} color="var(--on-surface-muted)" />}
          <span style={{
            fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--on-surface-variant)',
          }}>
            Ambient
          </span>
          {isPlaying && activeTrack && (
            <>
              <span style={{ color: 'var(--on-surface-variant)' }}>·</span>
              <span style={{
                fontSize: '0.84rem', fontWeight: 700, color: 'var(--on-surface)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {activeTrack.label}
              </span>
            </>
          )}
        </div>
        {isPlaying && (
          <button
            onClick={onStop}
            aria-label="Stop ambient sound"
            style={{
              height: 28, padding: '0 12px', borderRadius: 999,
              border: '1px solid var(--outline-variant)',
              background: 'transparent', color: 'var(--on-surface-variant)',
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.color = 'var(--on-surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}
          >
            Stop
          </button>
        )}
      </div>

      {/* Coverflow rail — horizontal scroll-snap of "album" cards. The
          active card scales up to mimic the iPod Albums centre-stage card
          while the rest sit a touch smaller. */}
      <div style={{
        display: 'flex', gap: 14,
        padding: '20px 24px 24px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        // Edge fade so the rail feels infinite.
        maskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent)',
      }}>
        {/* hide WebKit scrollbar */}
        <style>{`.ambient-rail::-webkit-scrollbar{display:none;}`}</style>
        {AMBIENT_SOUNDS.map(s => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              ref={(el) => { trackRefs.current[s.id] = el; }}
              onClick={() => onPick(s.id)}
              aria-pressed={on}
              aria-label={s.label}
              style={{
                flex: '0 0 auto',
                width: on ? 152 : 120,
                height: on ? 152 : 120,
                marginTop: on ? 0 : 16,
                borderRadius: 18,
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                scrollSnapAlign: 'center',
                backgroundImage: s.gradient,
                backgroundSize: 'cover',
                boxShadow: on
                  ? '0 18px 42px rgba(15,17,30,0.28), 0 4px 10px rgba(15,17,30,0.18), 0 0 0 2px rgba(255,255,255,0.5) inset'
                  : '0 6px 18px rgba(15,17,30,0.14)',
                transition: 'width 0.35s ease, height 0.35s ease, margin-top 0.35s ease, box-shadow 0.35s ease',
                outline: 'none',
              }}
            >
              {/* glossy highlight (top half lighter) */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }}
              />
              {/* large emoji "album art" */}
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: on ? '3.15rem' : '2.35rem',
                filter: on ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
                transition: 'font-size 0.35s ease',
              }} aria-hidden="true">
                {s.icon}
              </span>
              {/* now-playing pulse on the active card */}
              {on && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 0 0 4px rgba(255,255,255,0.35), 0 0 8px rgba(255,255,255,0.6)',
                  animation: 'spin 1.8s ease-in-out infinite',
                }} aria-hidden="true" />
              )}
              {/* label band */}
              <span style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '20px 10px 8px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)',
                color: '#fff',
                fontSize: on ? '0.78rem' : '0.7rem',
                fontWeight: 700,
                textAlign: 'center', letterSpacing: '0.02em',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                transition: 'font-size 0.35s ease',
              }}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Volume slider — always visible, subtle when nothing's playing */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 8px',
        opacity: isPlaying ? 1 : 0.55,
        transition: 'opacity 0.2s',
      }}>
        <VolumeX size={13} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
        <input
          type="range" min={0} max={1} step={0.05} value={volume}
          onChange={e => onVolume(parseFloat(e.target.value))}
          aria-label="Volume"
          disabled={!isPlaying}
          style={{
            flex: 1, accentColor: 'var(--copper)',
            cursor: isPlaying ? 'pointer' : 'default',
          }}
        />
        <Volume2 size={13} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, color: 'var(--on-surface-variant)',
          minWidth: 32, textAlign: 'right',
        }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
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
  // Wallpaper availability cache. Wallpapers live at /public/wallpapers/<id>.jpg
  // but the file is optional — so we probe it the first time a track plays
  // and only swap the page background if it actually loads. While the file
  // is missing the browser keeps the default surface, so the page never
  // looks broken or flashes.
  const [hasWallpaper, setHasWallpaper] = useState<Record<string, boolean>>({});
  const [volume, setVolume] = useState(0.4);
  // Per-pick `new Audio(...)` — same approach we used before the
  // persistent-element refactor. It survives every autoplay policy +
  // visibility-change quirk we tried to handle, with no fade plumbing
  // to race the volume slider.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const warnedRef = useRef<Set<string>>(new Set());

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch { /* noop */ }
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
    if (!warnedRef.current.has(sound.file)) {
      audio.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration < 180) {
          console.warn(
            `[FocusMode] "${sound.label}" (${sound.file}) is only ${audio.duration.toFixed(1)}s — ` +
            `loops will be audible. Replace with a 3+ minute CC0 track. See /public/audio/SOURCES.md.`
          );
        }
        warnedRef.current.add(sound.file);
      }, { once: true });
    }
    audio.play().catch(() => { /* autoplay blocked, user will click again */ });
    audioRef.current = audio;
    setActiveSound(soundId);
  }, [volume, stopSound]);

  // Update volume live on the active audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Probe the wallpaper for the active track, exactly once per track id.
  // We don't apply the image as the page background until the probe loads,
  // so a missing file never blanks out the page — it stays on the
  // default surface.
  useEffect(() => {
    if (activeSound === 'off') return;
    if (hasWallpaper[activeSound] !== undefined) return;
    const img = new Image();
    let cancelled = false;
    img.onload = () => { if (!cancelled) setHasWallpaper(s => ({ ...s, [activeSound]: true })); };
    img.onerror = () => { if (!cancelled) setHasWallpaper(s => ({ ...s, [activeSound]: false })); };
    img.src = trackWallpaper(activeSound);
    return () => { cancelled = true; };
  }, [activeSound, hasWallpaper]);

  // Cleanup on unmount
  useEffect(() => () => stopSound(), [stopSound]);

  // Task notes
  const [noteTaskId, setNoteTaskId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Shortcuts help
  const [showShortcuts, setShowShortcuts] = useState(false);

  // --- Enhancement features state ---
  const [lockedTask, setLockedTask] = useState<{ id: string; title: string } | null>(null);
  const [secondsOnLocked, setSecondsOnLocked] = useState(0);
  const [showBreathwork, setShowBreathwork] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied'
  );

  // Hooks
  const chime = useChime();
  useDocumentTitle(secondsLeft, phase, running);
  const notification = usePomodoroNotification();
  const { target, setTarget } = useDailyTarget();
  const { recordPomodoro } = useStreakSync(user?.id);

  // Page visibility — for the floating mini-player
  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    onVis();
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Mark a locked task as in_progress the moment the user starts running
  const lockedTaskMarkedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!running || !lockedTask || !user) return;
    if (lockedTaskMarkedRef.current.has(lockedTask.id)) return;
    lockedTaskMarkedRef.current.add(lockedTask.id);
    void tasksApi.update(lockedTask.id, { status: 'in_progress' }).catch(() => {
      // best-effort; fall back silently
      lockedTaskMarkedRef.current.delete(lockedTask.id);
    });
  }, [running, lockedTask, user]);

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
      // Drive the locked-task counter only while a work phase is actively
      // running. Break time isn't counted toward the task, by design.
      if (phase === 'work' && lockedTask) {
        setSecondsOnLocked(s => s + 1);
      }

      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Phase complete
          const wasWork = phase === 'work';
          if (wasWork) {
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

          // End-of-phase signals: chime + system notification.
          chime.play();
          if (wasWork) {
            notification.notify('Focus session complete', 'Time for a short break.');
            recordPomodoro();
          } else {
            notification.notify('Break over', 'Back to focus when you’re ready.');
          }

          // On a work→break boundary, surface the breathwork interlude
          // (unless the user prefers reduced motion). The breathwork
          // callbacks own the actual phase advance in that case.
          const reducedMotion =
            typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          if (wasWork && autoAdvance && !reducedMotion) {
            setShowBreathwork(true);
            // Hold timer at zero — breathwork callbacks flip phase to 'break'.
            setRunning(false);
            return 0;
          }

          if (autoAdvance) {
            const next: TimerPhase = wasWork ? 'break' : 'work';
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
  }, [running, phase, autoAdvance, preset, lockedTask, chime, notification, recordPomodoro]);

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

  // After breathwork resolves (complete or skip), advance into the break.
  const advanceAfterBreathwork = useCallback(() => {
    setShowBreathwork(false);
    setPhase('break');
    setSecondsLeft(preset.break);
    if (autoAdvance) setRunning(true);
  }, [preset, autoAdvance]);

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

  // Optional photo wallpaper per active track. The image lives at
  // /public/wallpapers/<id>.jpg — drop a real photograph there and the
  // background lights up automatically. While the file is missing, the
  // browser keeps the default surface, so the page never looks broken or
  // flashes when a track without a wallpaper is selected.
  const activeTrack = AMBIENT_SOUNDS.find(s => s.id === activeSound);
  const isAmbientActive = activeSound !== 'off' && !!activeTrack;
  const wallpaperUrl = isAmbientActive && hasWallpaper[activeTrack.id]
    ? trackWallpaper(activeTrack.id)
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      transition: 'background-image 0.5s ease-in-out',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem 1.5rem 4rem',
      position: 'relative',
    }}>
      {/* Ambient mood particles (rain droplets, leaves, embers, etc.) — sits
          above the wallpaper but below the scrim and UI. Renders nothing for
          tracks without a configured particle behaviour. */}
      <AmbientParticles trackId={activeSound} active={isAmbientActive} />

      {/* Constant readability scrim — only when a wallpaper is showing.
          Tones the photo down to the surface palette so every UI element
          retains its designed contrast. No animation, no flashing. */}
      {wallpaperUrl && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(238,252,254,0.42) 0%, rgba(238,252,254,0.28) 100%)',
            backdropFilter: 'saturate(0.85) blur(1px)',
            WebkitBackdropFilter: 'saturate(0.85) blur(1px)',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span><kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-container)', fontFamily: 'monospace', fontSize: '0.72rem' }}>Space</kbd> Play / Pause</span>
          <span><kbd style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-container)', fontFamily: 'monospace', fontSize: '0.72rem' }}>R</kbd> Reset timer</span>
          {notifEnabled === 'default' && (
            <button
              onClick={() => { void notification.request().then(setNotifEnabled); }}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--copper)', padding: 0,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              Enable alerts
            </button>
          )}
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

      {/* Daily target — progress ring + editable goal, sits directly below
          the timer card. Pulses on each completed pomodoro. */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '1rem' }}>
        <DailyTargetCard
          pomodorosCompleted={session.pomodorosCompleted}
          totalFocusSeconds={session.totalFocusSeconds}
          target={target}
          onTargetChange={setTarget}
        />
      </div>

      {/* Task lock — bind the timer to a single task and accumulate its
          focus seconds. Sits between the timer/target and the ambient picker. */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: '1.5rem' }}>
        <TaskFocusBinding
          tasks={focusTasks.map((t: any) => ({ id: t.id as string, title: t.title as string }))}
          selected={lockedTask}
          onSelect={setLockedTask}
          onClear={() => { setLockedTask(null); setSecondsOnLocked(0); }}
          totalSecondsOnSelected={secondsOnLocked}
        />
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

      {/* Breathwork interlude — full-screen pacer between work→break. The
          callbacks here own the actual phase advance (timer holds at 0
          until the interlude resolves). */}
      {showBreathwork && (
        <BreathworkInterlude
          onComplete={advanceAfterBreathwork}
          onSkip={advanceAfterBreathwork}
        />
      )}
      </div>

      {/* Floating mini-player — only when the page is hidden / backgrounded. */}
      <MiniPlayer
        visible={pageHidden}
        secondsLeft={secondsLeft}
        phase={phase}
        running={running}
        ambientLabel={activeTrack?.label ?? null}
        ambientIcon={activeTrack?.icon ?? null}
        onTogglePlay={() => setRunning(r => !r)}
        onDismiss={() => setPageHidden(false)}
      />
    </div>
  );
}
