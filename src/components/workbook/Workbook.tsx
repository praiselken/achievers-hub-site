import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Circle,
  Eraser,
  Minus,
  Pencil,
  RotateCcw,
  Ruler as RulerIcon,
  Triangle,
  Undo2,
  X,
} from 'lucide-react';

type Tool = 'pen' | 'line' | 'compass' | 'eraser';
type Point = [number, number];
type Stroke = { tool: Tool; color: string; width: number; pts: Point[] };
type Instrument = { cx: number; cy: number; angle: number };

const INK = [
  { name: 'Pencil', value: '#1f2937' },
  { name: 'Purple', value: '#5e3a6e' },
  { name: 'Amber', value: '#d66c0d' },
  { name: 'Green', value: '#5f7520' },
];

const RULER_LEN = 440;
const RULER_H = 62;
const PROTRACTOR_R = 150;
const SNAP_PX = 26;

/** Distance from p to the infinite line through `origin` with unit direction `dir`. */
function projectOntoLine(p: Point, origin: Point, dir: Point): { proj: Point; dist: number } {
  const vx = p[0] - origin[0];
  const vy = p[1] - origin[1];
  const t = vx * dir[0] + vy * dir[1];
  const proj: Point = [origin[0] + dir[0] * t, origin[1] + dir[1] * t];
  const dist = Math.hypot(p[0] - proj[0], p[1] - proj[1]);
  return { proj, dist };
}

/** The straight edge a ruler draws along: its lower long edge. */
function rulerEdge(r: Instrument): { origin: Point; dir: Point } {
  const rad = (r.angle * Math.PI) / 180;
  const dir: Point = [Math.cos(rad), Math.sin(rad)];
  const perp: Point = [-Math.sin(rad), Math.cos(rad)];
  const origin: Point = [r.cx + perp[0] * (RULER_H / 2), r.cy + perp[1] * (RULER_H / 2)];
  return { origin, dir };
}

/**
 * Inline working space. Renders in the flow of the page — never as an overlay —
 * so the question stays on screen while the student works.
 */
export function Workbook({
  open,
  onClose,
  storageKey,
  title,
  height = 520,
}: {
  open: boolean;
  onClose: () => void;
  storageKey: string;
  title: string;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(INK[0].value);
  const [width, setWidth] = useState(2.5);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState<Stroke | null>(null);

  const [ruler, setRuler] = useState<Instrument | null>(null);
  const [protractor, setProtractor] = useState<Instrument | null>(null);
  const [drag, setDrag] = useState<
    { kind: 'ruler' | 'protractor'; mode: 'move' | 'rotate'; dx: number; dy: number } | null
  >(null);

  // ── Load / persist working per question ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(`workbook:${storageKey}`);
      setStrokes(raw ? (JSON.parse(raw) as Stroke[]) : []);
    } catch {
      setStrokes([]);
    }
  }, [open, storageKey]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(`workbook:${storageKey}`, JSON.stringify(strokes));
    } catch {
      // Storage can be unavailable (private mode) — working simply isn't kept.
    }
  }, [strokes, open, storageKey]);

  // ── Redraw ─────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;

    const dpr = window.devicePixelRatio || 1;
    const { width: cssW, height: cssH } = surface.getBoundingClientRect();
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const s of [...strokes, ...(draft ? [draft] : [])]) {
      ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.tool === 'eraser' ? Math.max(12, s.width * 6) : s.width;

      if (s.tool === 'compass' && s.pts.length === 2) {
        const [c, e] = s.pts;
        const r = Math.hypot(e[0] - c[0], e[1] - c[1]);
        ctx.beginPath();
        ctx.arc(c[0], c[1], r, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }

      if (s.pts.length < 2) {
        if (s.pts.length === 1 && s.tool !== 'eraser') {
          ctx.beginPath();
          ctx.arc(s.pts[0][0], s.pts[0][1], s.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
        }
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(s.pts[0][0], s.pts[0][1]);
      for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes, draft]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => redraw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, redraw]);

  if (!open) return null;

  function toLocal(e: React.PointerEvent): Point {
    const rect = surfaceRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  /** Pen and line snap to the ruler's edge when started close to it. */
  function snap(p: Point): Point {
    if (!ruler || tool === 'eraser' || tool === 'compass') return p;
    const { origin, dir } = rulerEdge(ruler);
    const { proj, dist } = projectOntoLine(p, origin, dir);
    return dist <= SNAP_PX ? proj : p;
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = snap(toLocal(e));
    setDraft({ tool, color, width, pts: [p] });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draft) return;
    const raw = toLocal(e);
    setDraft((d) => {
      if (!d) return d;
      if (d.tool === 'pen' || d.tool === 'eraser') {
        // A pen stroke started on the ruler stays on it for its whole length.
        const start = d.pts[0];
        let next = raw;
        if (d.tool === 'pen' && ruler) {
          const { origin, dir } = rulerEdge(ruler);
          const startOnEdge = projectOntoLine(start, origin, dir).dist <= 0.5;
          if (startOnEdge) next = projectOntoLine(raw, origin, dir).proj;
        }
        return { ...d, pts: [...d.pts, next] };
      }
      // Line and compass keep exactly two points: anchor and current.
      return { ...d, pts: [d.pts[0], d.tool === 'line' ? snap(raw) : raw] };
    });
  }

  function onPointerUp() {
    if (!draft) return;
    if (draft.pts.length > 1 || draft.tool === 'pen') setStrokes((s) => [...s, draft]);
    setDraft(null);
  }

  // ── Instrument drag / rotate ───────────────────────────────────────────────
  function onInstrumentDown(kind: 'ruler' | 'protractor', mode: 'move' | 'rotate', e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const inst = kind === 'ruler' ? ruler : protractor;
    if (!inst) return;
    const p = toLocal(e);
    setDrag({ kind, mode, dx: p[0] - inst.cx, dy: p[1] - inst.cy });
  }

  function onSurfacePointerMove(e: React.PointerEvent) {
    if (drag) {
      const p = toLocal(e);
      const set = drag.kind === 'ruler' ? setRuler : setProtractor;
      set((inst) => {
        if (!inst) return inst;
        if (drag.mode === 'move') return { ...inst, cx: p[0] - drag.dx, cy: p[1] - drag.dy };
        const angle = (Math.atan2(p[1] - inst.cy, p[0] - inst.cx) * 180) / Math.PI;
        return { ...inst, angle: Math.round(angle) };
      });
      return;
    }
    onPointerMove(e);
  }

  function onSurfacePointerUp() {
    if (drag) { setDrag(null); return; }
    onPointerUp();
  }

  const toolButtons: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: 'pen', label: 'Pencil', icon: <Pencil size={17} /> },
    { id: 'line', label: 'Straight line', icon: <Minus size={17} /> },
    { id: 'compass', label: 'Compass', icon: <Circle size={17} /> },
    { id: 'eraser', label: 'Eraser', icon: <Eraser size={17} /> },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)]" aria-label={`Workbook — ${title}`}>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--color-primary-600)]">Workbook</p>
            <p className="truncate text-sm font-bold text-[var(--color-ink-900)]">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-[var(--color-ink-700)] hover:bg-slate-50"
          >
            Close <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {toolButtons.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                aria-pressed={tool === t.id}
                title={t.label}
                className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition ${
                  tool === t.id ? 'bg-white text-[var(--color-primary-700)] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.icon}<span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRuler((r) => (r ? null : { cx: 300, cy: 150, angle: 0 }))}
              aria-pressed={!!ruler}
              title="Ruler"
              className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition ${
                ruler ? 'bg-white text-[var(--color-primary-700)] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <RulerIcon size={17} /><span className="hidden sm:inline">Ruler</span>
            </button>
            <button
              type="button"
              onClick={() => setProtractor((p) => (p ? null : { cx: 400, cy: 400, angle: 0 }))}
              aria-pressed={!!protractor}
              title="Protractor"
              className={`flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition ${
                protractor ? 'bg-white text-[var(--color-primary-700)] shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Triangle size={17} /><span className="hidden sm:inline">Protractor</span>
            </button>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-1.5" role="group" aria-label="Ink colour">
            {INK.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-pressed={color === c.value}
                title={c.name}
                className={`h-7 w-7 rounded-full border-2 transition ${color === c.value ? 'border-[var(--color-primary-600)] scale-110' : 'border-white'}`}
                style={{ background: c.value }}
              />
            ))}
          </div>

          <label className="ml-1 flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="hidden sm:inline">Thickness</span>
            <input
              type="range" min={1} max={8} step={0.5} value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-20 accent-[var(--color-primary-600)]"
              aria-label="Stroke thickness"
            />
          </label>

          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => setStrokes((s) => s.slice(0, -1))}
              disabled={!strokes.length}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-35"
            >
              <Undo2 size={15} /><span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => setStrokes([])}
              disabled={!strokes.length}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-35"
            >
              <RotateCcw size={15} /><span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        <div
          ref={surfaceRef}
          onPointerDown={onPointerDown}
          onPointerMove={onSurfacePointerMove}
          onPointerUp={onSurfacePointerUp}
          onPointerCancel={onSurfacePointerUp}
          className="relative touch-none overflow-hidden bg-white"
          style={{
            height,
            backgroundImage:
              'linear-gradient(to right, #eef1f6 1px, transparent 1px), linear-gradient(to bottom, #eef1f6 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        >
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

          {ruler && <RulerOverlay inst={ruler} onDown={(mode, e) => onInstrumentDown('ruler', mode, e)} />}
          {protractor && <ProtractorOverlay inst={protractor} onDown={(mode, e) => onInstrumentDown('protractor', mode, e)} />}
        </div>

        <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
          {ruler
            ? 'Drag the ruler to position it, use the round handle to rotate. Draw along its lower edge to snap straight.'
            : protractor
              ? `Protractor at ${((protractor.angle % 360) + 360) % 360}°. Drag to position, use the handle to rotate and read the angle.`
              : 'Your working is saved against this question.'}
        </p>
    </section>
  );
}

function RulerOverlay({ inst, onDown }: { inst: Instrument; onDown: (mode: 'move' | 'rotate', e: React.PointerEvent) => void }) {
  const ticks = Array.from({ length: Math.floor(RULER_LEN / 10) + 1 }, (_, i) => i);
  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: inst.cx - RULER_LEN / 2,
        top: inst.cy - RULER_H / 2,
        width: RULER_LEN,
        height: RULER_H,
        transform: `rotate(${inst.angle}deg)`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        onPointerDown={(e) => onDown('move', e)}
        className="absolute inset-0 cursor-move rounded-md border border-amber-300/80 bg-amber-100/70 backdrop-blur-[1px]"
      >
        <svg width={RULER_LEN} height={RULER_H} className="pointer-events-none absolute inset-0">
          {ticks.map((i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1={i * 10} y1={RULER_H - 1}
                x2={i * 10} y2={RULER_H - (major ? 16 : 9)}
                stroke="#8a5a12" strokeWidth={major ? 1.4 : 0.9}
              />
            );
          })}
          {ticks.filter((i) => i % 5 === 0).map((i) => (
            <text key={i} x={i * 10 + 2} y={RULER_H - 20} fontSize="9" fill="#8a5a12" fontWeight="700">{i / 5}</text>
          ))}
          <line x1={0} y1={RULER_H - 1} x2={RULER_LEN} y2={RULER_H - 1} stroke="#8a5a12" strokeWidth="1.6" />
        </svg>
      </div>
      <button
        type="button"
        onPointerDown={(e) => onDown('rotate', e)}
        aria-label="Rotate ruler"
        className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-amber-500 shadow-md"
      />
    </div>
  );
}

function ProtractorOverlay({ inst, onDown }: { inst: Instrument; onDown: (mode: 'move' | 'rotate', e: React.PointerEvent) => void }) {
  const r = PROTRACTOR_R;
  const size = r * 2;
  const degrees = Array.from({ length: 37 }, (_, i) => i * 5);
  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: inst.cx - r,
        top: inst.cy - r,
        width: size,
        height: size,
        transform: `rotate(${inst.angle}deg)`,
        transformOrigin: '50% 50%',
      }}
    >
      {/* Only the semicircle itself is draggable — the empty corners of this
          square box must stay transparent to the pen underneath. */}
      <div className="pointer-events-none absolute inset-0">
        <svg width={size} height={size} className="absolute inset-0">
          <path
            d={`M ${r - r} ${r} A ${r} ${r} 0 0 1 ${r + r} ${r} Z`}
            fill="rgba(94,58,110,0.10)"
            stroke="#5e3a6e"
            strokeWidth="1.5"
            className="pointer-events-auto cursor-move"
            onPointerDown={(e) => onDown('move', e)}
          />
          {degrees.map((d) => {
            const rad = (Math.PI * d) / 180;
            const major = d % 10 === 0;
            const long = d % 30 === 0;
            const inner = r - (long ? 22 : major ? 14 : 8);
            return (
              <line
                key={d}
                x1={r - r * Math.cos(rad)} y1={r - r * Math.sin(rad)}
                x2={r - inner * Math.cos(rad)} y2={r - inner * Math.sin(rad)}
                stroke="#5e3a6e" strokeWidth={long ? 1.5 : major ? 1 : 0.6}
              />
            );
          })}
          {degrees.filter((d) => d % 30 === 0).map((d) => {
            const rad = (Math.PI * d) / 180;
            const inner = r - 34;
            return (
              <text
                key={d}
                x={r - inner * Math.cos(rad)} y={r - inner * Math.sin(rad)}
                fontSize="10" fontWeight="700" fill="#5e3a6e"
                textAnchor="middle" dominantBaseline="middle"
              >
                {d}
              </text>
            );
          })}
          <line x1={0} y1={r} x2={size} y2={r} stroke="#5e3a6e" strokeWidth="1.5" />
          <circle cx={r} cy={r} r="3.5" fill="#5e3a6e" />
        </svg>
      </div>
      <button
        type="button"
        onPointerDown={(e) => onDown('rotate', e)}
        aria-label="Rotate protractor"
        className="absolute left-1/2 h-6 w-6 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-[var(--color-primary-600)] shadow-md"
        style={{ top: r + 10 }}
      />
    </div>
  );
}
