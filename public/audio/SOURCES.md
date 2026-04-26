# Focus Mode — ambient track sources

All tracks loop seamlessly via `audioRef.loop = true` in
`src/pages/FocusMode/index.tsx`. Each file is at least 3 minutes long
so the loop seam is inaudible. The dev console logs a
`[FocusMode] … loops will be audible` warning if a track is shorter.

Curation rule: **pure ambient soundscapes only — no music underlayer,
no melodic content.** Source must be CC0 / Public Domain. Real field
recordings only — no AI, no synth.

## Current catalogue

| id          | filename            | length | size  | source                                                                                                            | license |
| ----------- | ------------------- | ------ | ----- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| `rain`      | `rain.mp3`          | 9:00   | 5.8 MB | archive.org `rain-sounds-gentle-rain-thunderstorms` / `Light Gentle Rain Part 1.mp3` (trimmed)                    | CC0 1.0 |
| `ocean`     | `ocean.mp3`         | 9:00   | 6.2 MB | archive.org `ocean-sea-sounds` / `Gentle Ocean.mp3` (trimmed)                                                     | CC0 1.0 |
| `forest`    | `forest.mp3`        | 4:55   | 5.6 MB | archive.org `various-bird-sounds` / `birds-singing-in-and-leaves-rustling-with-the-wind-14557.mp3`                | CC0 1.0 |
| `wind`      | `wind.mp3`          | 6:00   | 8.1 MB | archive.org `aporee_62755_72426` / `020520240205AMwindrecambimics.mp3` (Soundctuary Cappaduff, Co. Clare, IE)     | CC PD Mark 1.0 |
| `crickets`  | `crickets.mp3`      | 6:40   | 9.2 MB | archive.org `CricketsAndFrogs` / `CheesyNirvosa-CricketsAndFrogs.mp3` (trimmed)                                   | Public Domain |
| `fireplace` | `fireplace.mp3`     | 4:23   | 4.0 MB | archive.org `FireFavorite` / `Fire Favorite.mp3` (Sennheiser MKH60 recording)                                     | CC0 1.0 |
| `thunder`   | `thunder.mp3`       | 8:00   | 9.2 MB | archive.org `rain-sounds-gentle-rain-thunderstorms` / `rain-and-thunder-16705.mp3` (trimmed)                      | CC0 1.0 |
| `cafe`      | `cafe.mp3`          | 10:00  | 5.4 MB | archive.org `HeySoundsFromACafe0101010` / `Voice027.mp3`                                                          | CC0 1.0 |
| `brown`     | `brown-noise.mp3`   | ~10:00 | 4.6 MB | original; clean broadband brown noise                                                                             | (synth) |
| `white`     | `white-noise.mp3`   | ~10:00 | 4.6 MB | original; clean broadband white noise                                                                             | (synth) |

## Curation notes

- **Dropped** lo-fi / piano / library / birdsong / stream from the
  prior batch. Lo-fi and piano were music, not ambient. Library was
  too quiet to be useful as a background. Birdsong / stream overlapped
  with forest and rain.
- **Trimming** is done with `scripts/mp3trunc.py` (frame-aligned
  truncation; keeps ID3v2 header and copies whole MPEG Layer III
  frames up to the target duration). No re-encoding, so quality is
  preserved.
- White noise / brown noise are synthetic but acceptable: they aren't
  music, they're constant broadband signals.

## Reproducing the trims

```bash
# example: re-trim rain to 9 min
curl -L -A 'Mozilla/5.0' \
  'https://archive.org/download/rain-sounds-gentle-rain-thunderstorms/Light%20Gentle%20Rain%20Part%201.mp3' \
  -o /tmp/rain-src.mp3
python3 scripts/mp3trunc.py /tmp/rain-src.mp3 public/audio/rain.mp3 540
```

## Where to source CC0 / public-domain ambient (for future swaps)

- archive.org advanced search:
  `licenseurl:"http://creativecommons.org/publicdomain/zero/1.0/"
  AND mediatype:audio AND title:<term>`
- Pixabay sound effects (no attribution required) —
  https://pixabay.com/sound-effects/
- Mixkit (no attribution required) —
  https://mixkit.co/free-sound-effects/
- Freesound, filtered to "Creative Commons 0" —
  https://freesound.org/

## Adding a new track

1. Drop a CC0 mp3 into `/public/audio/<id>.mp3` (≥ 3 minutes,
   ≤ 10 MB after compression).
2. Add an `AmbientTrack` entry to `AMBIENT_SOUNDS` in
   `src/pages/FocusMode/index.tsx` (`id`, `label`, `icon`, `file`,
   `group`, `gradient`).
3. List the source + license in this file.
