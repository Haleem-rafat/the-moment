import type { FrameScene } from "@/data/memories";

const INK = "#e9dccb";
const ACCENT = "#d8ae90";

function Man({ x }: { x: number }) {
  return (
    <g className="figure-sway" style={{ transformOrigin: `${x}px 150px` }}>
      <circle cx={x} cy={84} r={11} fill={INK} />
      <path
        d={`M${x - 15} 150 V112 Q${x - 15} 99 ${x} 99 Q${x + 15} 99 ${x + 15} 112 V150 Z`}
        fill={INK}
      />
    </g>
  );
}

function Woman({ x }: { x: number }) {
  return (
    <g className="figure-sway figure-sway-alt" style={{ transformOrigin: `${x}px 150px` }}>
      <circle cx={x} cy={90} r={10} fill={ACCENT} />
      <path
        d={`M${x - 17} 150 Q${x - 12} 122 ${x - 10} 112 Q${x - 9} 103 ${x} 103 Q${x + 9} 103 ${x + 10} 112 Q${x + 12} 122 ${x + 17} 150 Z`}
        fill={ACCENT}
      />
    </g>
  );
}

function Laptop({ x, big = false }: { x: number; big?: boolean }) {
  const w = big ? 34 : 24;
  const h = big ? 22 : 15;
  return (
    <g fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round">
      <rect x={x - w / 2} y={150 - h} width={w} height={h} rx={2} />
      <path d={`M${x - w / 2 - 4} 150 H${x + w / 2 + 4}`} strokeLinecap="round" />
    </g>
  );
}

const SCENES: Record<FrameScene, React.ReactNode> = {
  chat: (
    <>
      <Man x={70} />
      <Woman x={130} />
      <g className="prop-float" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round">
        <path d="M78 40 h44 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-26 l-9 9 v-9 h-9 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6 Z" />
        <path
          d="M100 58 c-7 -5 -9 -8 -6 -11 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 1 6 -6 11 Z"
          fill={ACCENT}
          stroke="none"
        />
      </g>
    </>
  ),
  door: (
    <>
      <g fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round">
        <rect x={136} y={66} width={38} height={84} rx={2} />
        <circle cx={145} cy={110} r={2} fill={INK} />
      </g>
      <Man x={50} />
      <Woman x={92} />
      <text className="prop-float" x={155} y={52} textAnchor="middle" fontSize={24} fill={ACCENT}>
        ☺
      </text>
    </>
  ),
  film: (
    <>
      <Man x={78} />
      <Woman x={122} />
      <g className="prop-float" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round">
        <rect x={56} y={26} width={88} height={44} rx={3} />
        <path d="M94 38 L110 48 L94 58 Z" fill={ACCENT} stroke="none" />
      </g>
    </>
  ),
  desk: (
    <>
      <Man x={62} />
      <Woman x={138} />
      <g stroke={INK} strokeWidth={3} strokeLinecap="round">
        <path d="M34 128 H166" />
        <path d="M46 128 V162 M154 128 V162" />
      </g>
      <g className="prop-float" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round">
        <rect x={84} y={108} width={32} height={20} rx={2} />
      </g>
    </>
  ),
  craft: (
    <>
      <Man x={70} />
      <Woman x={130} />
      <g className="prop-float">
        <text x={70} y={60} textAnchor="middle" fontSize={22} fontFamily="monospace" fill={INK}>
          {"</>"}
        </text>
        <g fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round">
          <path d="M122 62 l18 -18 l5 5 l-18 18 l-7 2 Z" />
        </g>
      </g>
    </>
  ),
  laptops: (
    <>
      <Man x={56} />
      <Woman x={144} />
      <g className="prop-float">
        <Laptop x={84} big />
        <Laptop x={118} />
      </g>
    </>
  ),
  umrah: (
    <>
      <Man x={40} />
      <Woman x={160} />
      <g className="prop-float">
        <rect x={76} y={84} width={48} height={66} fill="#0d0508" stroke={ACCENT} strokeWidth={1} />
        <rect x={76} y={98} width={48} height={6} fill={ACCENT} />
      </g>
    </>
  ),
};

/** Two simple figures standing side by side, moving gently, in place of a photo. */
export function FrameIllustration({ scene }: { scene: FrameScene }) {
  return (
    <svg viewBox="0 0 200 170" className="absolute inset-0 size-full" aria-hidden>
      <path d="M16 151 H184" stroke="#a77b63" strokeOpacity={0.5} strokeWidth={1} />
      {SCENES[scene]}
    </svg>
  );
}
