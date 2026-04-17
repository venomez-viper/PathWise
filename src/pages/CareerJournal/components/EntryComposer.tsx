import { useState, useEffect } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { RecordButton } from "./RecordButton";
import { Waveform } from "./Waveform";
import { transcribeAudio, createEntry } from "../api";

export function EntryComposer({
  userId, onCreated, prefill,
}: {
  userId: string;
  onCreated: () => void;
  prefill?: string;
}) {
  const { state, start, stop } = useAudioRecorder();
  const [body, setBody] = useState(prefill || "");
  const [transcribing, setTranscribing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"typed" | "voice">("typed");

  useEffect(() => {
    if (prefill !== undefined && prefill !== body) setBody(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const handleStopRecording = async () => {
    try {
      const blob = await stop();
      if (!blob || blob.size === 0) return;
      setTranscribing(true);
      const transcript = await transcribeAudio(userId, blob);
      setBody((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
      setSource("voice");
    } catch (err) {
      setError((err as Error).message || "Voice unavailable — please type instead");
    } finally {
      setTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createEntry(userId, body.trim(), source);
      setBody("");
      setSource("typed");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-teal-100 shadow-sm p-4 transition-all duration-300
        ${state.isRecording ? "ring-2 ring-teal-400 shadow-teal-100" : ""}`}
    >
      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setSource("typed"); }}
        placeholder="What's on your mind about your career today?"
        rows={4}
        className="w-full resize-none bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RecordButton
            isRecording={state.isRecording}
            onStart={start}
            onStop={handleStopRecording}
            disabled={transcribing || saving}
          />
          {state.isRecording && <Waveform level={state.level} />}
          {transcribing && <span className="text-sm text-slate-500">Transcribing…</span>}
          {state.error && <span className="text-sm text-rose-600">{state.error}</span>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!body.trim() || saving || state.isRecording}
          className="cursor-pointer rounded-lg bg-[#6245a4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a3280] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
