"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Figure, type FigureKind } from "@/components/Marks";
import { formatClock, type Scene } from "@/lib/notes";

export function LessonVideo({
  title,
  scenes,
  watermark,
}: {
  title: string;
  scenes: Scene[];
  watermark: string;
}) {
  const duration = useMemo(() => scenes.reduce((sum, scene) => sum + scene.seconds, 0), [scenes]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const last = useRef(0);

  const { scene, local } = useMemo(() => {
    let cursor = 0;
    for (const item of scenes) {
      if (time < cursor + item.seconds) return { scene: item, local: time - cursor };
      cursor += item.seconds;
    }
    return { scene: scenes[scenes.length - 1], local: scenes[scenes.length - 1]?.seconds ?? 0 };
  }, [scenes, time]);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = (now - last.current) / 1000;
      last.current = now;
      setTime((current) => {
        const next = current + delta;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      if (event.code === "Space") {
        event.preventDefault();
        setStarted(true);
        setPlaying((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function begin() {
    setStarted(true);
    if (time >= duration) setTime(0);
    setPlaying(true);
  }

  function seekTo(next: number) {
    setTime(Math.min(duration, Math.max(0, next)));
    setStarted(true);
  }

  let cursor = 0;
  return (
    <div className="lesson-media panel">
      <div className="stage" data-visual={scene?.visual ?? "flow"}>
        <span className="wm-video" style={{ left: `${58 + Math.sin(time) * 6}%`, top: `${10 + (time % 7)}%` }}>{watermark}</span>
        <div className="stage-art" style={{ transform: `translateY(${Math.sin(local) * 4}px)` }}>
          <Figure kind={(scene?.visual ?? "flow") as FigureKind} />
        </div>
        {started && <p className="stage-caption">{scene?.caption}</p>}
        {!started && (
          <button className="play-overlay" type="button" onClick={begin}>
            <span>Play</span>
            {title}
          </button>
        )}
      </div>
      <div className="video-controls">
        <button type="button" className="ctrl" aria-label={playing ? "Pause" : "Play"} onClick={() => (started ? setPlaying((value) => !value) : begin())}>
          {playing ? "Pause" : "Play"}
        </button>
        <input
          className="scrub"
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={time}
          aria-label="Seek"
          onChange={(event) => seekTo(Number(event.target.value))}
        />
        <span className="clock">{formatClock(time)} / {formatClock(duration)}</span>
      </div>
      <div className="chapters">
        {scenes.map((item) => {
          const start = cursor;
          cursor += item.seconds;
          const on = scene === item;
          return (
            <button key={item.title} type="button" data-on={on} onClick={() => { seekTo(start); setPlaying(true); }}>
              {item.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
