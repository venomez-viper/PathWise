import { LiveAudioVisualizer } from "react-audio-visualize";

export function Waveform({ mediaRecorder }: { mediaRecorder: MediaRecorder | null }) {
  if (!mediaRecorder) return null;
  return (
    <div aria-hidden className="flex items-center">
      <LiveAudioVisualizer
        mediaRecorder={mediaRecorder}
        width={120}
        height={28}
        barColor="#0D9488"
        barWidth={2}
        gap={1}
        smoothingTimeConstant={0.85}
      />
    </div>
  );
}
