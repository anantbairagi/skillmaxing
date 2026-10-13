export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <rect x="3.5" y="19.5" width="6" height="8" rx="1" />
      <rect x="13" y="13.5" width="6" height="14" rx="1" />
      <rect x="22.5" y="7.5" width="6" height="20" rx="1" />
      <path d="M5 13l7.5-5 6 3.5L27 3.5" />
      <path d="M22 3.5h5v5" />
    </svg>
  );
}

export type FigureKind = "flow" | "cache" | "queue" | "loop" | "bars" | "gpu";

export function Figure({ kind }: { kind: FigureKind }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (kind === "bars") {
    return (
      <svg viewBox="0 0 320 140" width="100%" height="140" aria-hidden="true">
        <rect x="30" y="70" width="36" height="50" fill="#d9f8ea" stroke="#2f2c45" />
        <rect x="84" y="40" width="36" height="80" fill="#c6f25a" stroke="#2f2c45" />
        <rect x="138" y="22" width="36" height="98" fill="#3fe9a0" stroke="#2f2c45" />
        <rect x="192" y="54" width="36" height="66" fill="#eef0fe" stroke="#2f2c45" />
        <path d="M20 120h250" {...common} />
      </svg>
    );
  }
  if (kind === "cache") {
    return (
      <svg viewBox="0 0 320 140" width="100%" height="140" aria-hidden="true">
        <rect x="24" y="46" width="70" height="48" fill="#fff" stroke="#2f2c45" />
        <rect x="124" y="28" width="78" height="84" fill="#e9fff4" stroke="#2f2c45" />
        <rect x="230" y="46" width="70" height="48" fill="#fff" stroke="#2f2c45" />
        <path d="M94 70h30M202 70h28" {...common} />
        <text x="40" y="74" fontSize="12" fill="#2f2c45">caller</text>
        <text x="146" y="74" fontSize="12" fill="#2f2c45">cache</text>
        <text x="248" y="74" fontSize="12" fill="#2f2c45">origin</text>
      </svg>
    );
  }
  if (kind === "queue") {
    return (
      <svg viewBox="0 0 320 140" width="100%" height="140" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={24 + i * 42} y={58 - i * 4} width="34" height="34" fill={i === 4 ? "#c6f25a" : "#fff"} stroke="#2f2c45" />
        ))}
        <path d="M40 110h230" {...common} />
      </svg>
    );
  }
  if (kind === "loop") {
    return (
      <svg viewBox="0 0 320 150" width="100%" height="150" aria-hidden="true">
        <rect x="120" y="16" width="80" height="32" fill="#eef0fe" stroke="#2f2c45" />
        <rect x="24" y="78" width="80" height="32" fill="#fff" stroke="#2f2c45" />
        <rect x="214" y="78" width="80" height="32" fill="#e9fff4" stroke="#2f2c45" />
        <path d="M160 48v18M160 66H64v12M160 66h94v12M64 110v14h192v-14" {...common} />
        <text x="138" y="36" fontSize="12" fill="#2f2c45">plan</text>
        <text x="46" y="98" fontSize="12" fill="#2f2c45">tools</text>
        <text x="232" y="98" fontSize="12" fill="#2f2c45">stop?</text>
      </svg>
    );
  }
  if (kind === "gpu") {
    return (
      <svg viewBox="0 0 320 140" width="100%" height="140" aria-hidden="true">
        <rect x="20" y="30" width="280" height="80" rx="6" fill="#241f38" stroke="#3fe9a0" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={36 + (i % 8) * 32} y="48" width="22" height="44" fill={i % 3 === 0 ? "#3fe9a0" : "#3a3458"} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 140" width="100%" height="140" aria-hidden="true">
      <rect x="18" y="48" width="78" height="40" fill="#fff" stroke="#2f2c45" />
      <rect x="122" y="48" width="78" height="40" fill="#e9fff4" stroke="#2f2c45" />
      <rect x="226" y="48" width="78" height="40" fill="#fff" stroke="#2f2c45" />
      <path d="M96 68h26M200 68h26" {...common} />
      <text x="36" y="72" fontSize="12" fill="#2f2c45">request</text>
      <text x="146" y="72" fontSize="12" fill="#2f2c45">service</text>
      <text x="250" y="72" fontSize="12" fill="#2f2c45">reply</text>
    </svg>
  );
}
