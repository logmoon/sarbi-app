"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const MUTE_STORAGE_KEY = "floor-sound-muted";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function playAlert(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Single clear pulse — distinct from KDS's two-note ascending chime.
  // Lower pitch, shorter, more like a notification ping than a kitchen bell.
  [660].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

export function useFloorSound(feedItemCount: number): {
  muted: boolean;
  toggleMute: () => void;
} {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const saved = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (saved === "true") setMuted(true);
  }, []);

  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        const AudioContextClass: typeof AudioContext =
          window.AudioContext ??
          (window as WindowWithWebkitAudio).webkitAudioContext ??
          AudioContext;
        ctxRef.current = new AudioContextClass();
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  const alert = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running" || mutedRef.current) return;
    playAlert(ctx, 0.2);
  }, []);

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = feedItemCount;

    if (feedItemCount > prev) {
      alert();
    }
  }, [feedItemCount, alert]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { muted, toggleMute };
}
