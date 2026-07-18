"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CHIME_INTERVAL_MS = 30000;
const MUTE_STORAGE_KEY = "kds-sound-muted";

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

function playChime(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Two-note ascending ding — bright and unmistakable over kitchen noise.
  [880, 1108].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.15;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

export function useKdsSound(pendingCount: number): {
  muted: boolean;
  toggleMute: () => void;
} {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPendingRef = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Restore saved mute preference.
  useEffect(() => {
    const saved = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (saved === "true") setMuted(true);
  }, []);

  // Unlock the AudioContext on the first user gesture anywhere on the page.
  // Browsers block audio playback until then — a KDS shouldn't gate the
  // queue behind a "tap to enable sound" screen, so this just listens quietly
  // for the first tap (e.g. the first "Start Order") and unlocks from there.
  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        const AudioContextClass: typeof AudioContext =
          window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext ?? AudioContext;
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

  const chime = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running" || mutedRef.current) return;
    playChime(ctx, 0.25);
  }, []);

  useEffect(() => {
    const prev = prevPendingRef.current;
    prevPendingRef.current = pendingCount;

    if (pendingCount === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // A new pending order arrived — chime right away rather than waiting
    // for the next 30s tick.
    if (pendingCount > prev) {
      chime();
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(chime, CHIME_INTERVAL_MS);
    }
  }, [pendingCount, chime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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
