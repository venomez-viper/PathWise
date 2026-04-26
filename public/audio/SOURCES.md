# Focus Mode — ambient track sources

All tracks loop seamlessly via `audioRef.loop = true` in
`src/pages/FocusMode/index.tsx`. **Each file should be at least 3
minutes long** so the loop seam is inaudible. The dev console logs a
`[FocusMode] … loops will be audible` warning if a track is shorter.

| id          | filename               | currently | recommended length |
| ----------- | ---------------------- | --------- | ------------------ |
| `rain`      | `rain.mp3`             | ~14 s 🔴  | 5–10 min           |
| `ocean`     | `ocean.mp3`            | ~3 min ✅ | 5–10 min           |
| `forest`    | `forest.mp3`           | ~1.5 min 🟡 | 5–10 min          |
| `stream`    | `stream.mp3`           | missing 🔴 | 5–10 min           |
| `birds`     | `birds.mp3`            | missing 🔴 | 5–10 min           |
| `fireplace` | `fireplace.mp3`        | missing 🔴 | 5–10 min           |
| `thunder`   | `thunder.mp3`          | missing 🔴 | 5–10 min           |
| `cafe`      | `cafe.mp3`             | ~2 min 🟡 | 5–10 min           |
| `library`   | `library.mp3`          | missing 🔴 | 5–10 min           |
| `lofi`      | `lofi.mp3`             | missing 🔴 | 5–10 min           |
| `piano`     | `piano.mp3`            | missing 🔴 | 5–10 min           |
| `brown`     | `brown-noise.mp3`      | missing 🔴 | 5–10 min           |
| `white`     | `white-noise.mp3`      | missing 🔴 | 5–10 min           |

## Where to grab CC0 / royalty-free tracks

These platforms host genuine CC0 / no-attribution-required audio. Pick
something **5–10 minutes** for each track id. Save to the path shown
in the table.

### Pixabay (no attribution required)
Search pages — pick any 5+ min result and download as MP3.

- Rain → https://pixabay.com/sound-effects/search/rain/?duration=120-300+
- Ocean → https://pixabay.com/sound-effects/search/ocean%20waves/?duration=120-300+
- Forest → https://pixabay.com/sound-effects/search/forest/?duration=120-300+
- Stream / river → https://pixabay.com/sound-effects/search/river/?duration=120-300+
- Birds → https://pixabay.com/sound-effects/search/birds/?duration=120-300+
- Fireplace → https://pixabay.com/sound-effects/search/fireplace/?duration=120-300+
- Thunderstorm → https://pixabay.com/sound-effects/search/thunderstorm/?duration=120-300+
- Cafe → https://pixabay.com/sound-effects/search/cafe%20ambience/?duration=120-300+
- Library / quiet room → https://pixabay.com/sound-effects/search/library/?duration=120-300+
- Lo-fi beats → https://pixabay.com/music/search/lofi/?duration=180-360+
- Piano (instrumental) → https://pixabay.com/music/search/piano%20ambient/?duration=180-360+
- Brown noise → https://pixabay.com/sound-effects/search/brown%20noise/?duration=120-300+
- White noise → https://pixabay.com/sound-effects/search/white%20noise/?duration=120-300+

### Mixkit (no attribution required)
- https://mixkit.co/free-sound-effects/rain/
- https://mixkit.co/free-sound-effects/ocean/
- https://mixkit.co/free-sound-effects/forest/
- https://mixkit.co/free-sound-effects/fire/
- https://mixkit.co/free-stock-music/tag/lo-fi/

### Freesound (filter by License = "Creative Commons 0")
- https://freesound.org/search/?q=rain&f=license:%22Creative+Commons+0%22

### Chosic (royalty-free music, mostly CC-BY)
- https://www.chosic.com/free-music/lofi/
- https://www.chosic.com/free-music/ambient/
- https://www.chosic.com/free-music/piano/

## Adding the files

```bash
cd public/audio
# example with a track downloaded as long-rain.mp3
mv ~/Downloads/long-rain.mp3 rain.mp3
```

The page picks them up on next reload — no code change needed. If
you add a brand-new track id (e.g. `oceanwaves2`), edit
`AMBIENT_SOUNDS` in `src/pages/FocusMode/index.tsx`.

## Compression tips

Keep file size reasonable so first play isn't slow on mobile:
```bash
# 96 kbps mono is plenty for ambient — 5 min ≈ 3.5 MB
ffmpeg -i raw.mp3 -ac 1 -b:a 96k rain.mp3
```
