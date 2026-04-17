import { useReactMediaRecorder } from "react-media-recorder";

export interface UseRecorderResult {
  status: "idle" | "recording" | "stopped" | "acquiring_media" | "permission_denied" | string;
  startRecording: () => void;
  stopRecording: () => void;
  mediaBlob: Blob | null;
  mediaStream: MediaStream | null;
  error: string;
}

export function useAudioRecorder(): UseRecorderResult {
  const {
    status, startRecording, stopRecording,
    previewAudioStream, error,
  } = useReactMediaRecorder({ audio: true, blobPropertyBag: { type: "audio/webm" } });

  return {
    status,
    startRecording,
    stopRecording,
    mediaBlob: null,
    mediaStream: previewAudioStream ?? null,
    error: error ?? "",
  };
}

export async function fetchBlob(blobUrl: string): Promise<Blob> {
  const r = await fetch(blobUrl);
  return r.blob();
}

export { useReactMediaRecorder } from "react-media-recorder";
