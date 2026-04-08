/**
 * Lightweight client-side archetype preview.
 * Runs entirely in the browser — no backend import.
 *
 * Supports two question-ID conventions:
 *   1. Prefixed:  ri_r*, ri_i*, ri_a*, ri_s*, ri_e*, ri_c*
 *   2. Positional: r1=R, r2=I, r3=A, r4=S, r5=E, r6=C  (current placeholder data)
 *
 * The dominant RIASEC type drives the archetype preview shown between
 * Phase 4 (Work DNA) and Phase 5 — the 2.7x completion retention moment.
 */

const POSITIONAL_MAP: Record<string, string> = {
  r1: 'R',
  r2: 'I',
  r3: 'A',
  r4: 'S',
  r5: 'E',
  r6: 'C',
};

export interface ArchetypePreview {
  name: string;
  tagline: string;
}

const PREVIEW_MAP: Record<string, ArchetypePreview> = {
  R: { name: 'The Builder',   tagline: 'You create tangible things that work.' },
  I: { name: 'The Analyst',   tagline: 'You solve problems others cannot see.' },
  A: { name: 'The Creator',   tagline: 'You bring ideas to life.' },
  S: { name: 'The Connector', tagline: 'You make others better.' },
  E: { name: 'The Leader',    tagline: 'You turn vision into action.' },
  C: { name: 'The Architect', tagline: 'You build systems that scale.' },
};

const FALLBACK: ArchetypePreview = { name: 'The Explorer', tagline: 'Your path is uniquely yours.' };

function scoreValue(val: string | string[]): number {
  if (Array.isArray(val)) return 0;
  if (val === 'like')    return 2;
  if (val === 'neutral') return 1;
  return 0;
}

export function getArchetypePreview(
  answers: Record<string, string | string[] | number>,
): ArchetypePreview {
  const counts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const [key, val] of Object.entries(answers)) {
    const strVal = typeof val === 'number' ? String(val) : (val as string | string[]);

    // Convention 1 — prefixed IDs (ri_r*, ri_i*, etc.)
    if (key.startsWith('ri_r')) { counts.R += scoreValue(strVal); continue; }
    if (key.startsWith('ri_i')) { counts.I += scoreValue(strVal); continue; }
    if (key.startsWith('ri_a')) { counts.A += scoreValue(strVal); continue; }
    if (key.startsWith('ri_s')) { counts.S += scoreValue(strVal); continue; }
    if (key.startsWith('ri_e')) { counts.E += scoreValue(strVal); continue; }
    if (key.startsWith('ri_c')) { counts.C += scoreValue(strVal); continue; }

    // Convention 2 — positional IDs (r1–r6)
    const riasecType = POSITIONAL_MAP[key];
    if (riasecType) {
      counts[riasecType] += scoreValue(strVal);
    }
  }

  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!dominant || dominant[1] === 0) return FALLBACK;

  return PREVIEW_MAP[dominant[0]] ?? FALLBACK;
}
