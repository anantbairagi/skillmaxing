"use client";

import { useEffect, useState } from "react";

export function LessonVideo({
  title,
  src,
  watermark,
  onDuration,
}: {
  title: string;
  src: string;
  watermark: string;
  onDuration?: (seconds: number) => void;
}) {
  const [pos, setPos] = useState({ left: "14%", top: "16%" });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const t = Date.now() / 1000;
      setPos({
        left: `${8 + (Math.sin(t * 0.35) * 0.5 + 0.5) * 54}%`,
        top: `${8 + (Math.cos(t * 0.27) * 0.5 + 0.5) * 46}%`,
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="lesson-media panel">
      <div className="lesson-stage">
        <video
          className="lesson-video"
          controls
          playsInline
          preload="metadata"
          src={src}
          aria-label={title}
          onLoadedMetadata={(event) => onDuration?.(event.currentTarget.duration)}
          onError={() => setFailed(true)}
        />
        <span className="wm-video" style={pos}>{watermark}</span>
      </div>
      {failed && <p className="muted video-missing">This lesson video did not load.</p>}
    </section>
  );
}
