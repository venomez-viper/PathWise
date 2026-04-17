import { Mic, Square } from "lucide-react";

export function RecordButton({
  isRecording, onStart, onStop, disabled,
}: {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      aria-label={isRecording ? "Stop recording" : "Start voice dictation"}
      aria-pressed={isRecording}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full
        cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${isRecording
          ? "bg-teal-600 text-white ring-2 ring-teal-300 ring-offset-2 animate-pulse"
          : "bg-teal-100 text-teal-800 hover:bg-teal-200"}`}
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
