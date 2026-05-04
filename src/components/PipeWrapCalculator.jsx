const PRESETS = [100, 125, 160, 200];

function PipeWrapCalculator() {
  const [pipeDiam, setPipeDiam] = React.useState("");
  const [matThick, setMatThick] = React.useState("");
  const [overlap, setOverlap] = React.useState("");
  const [gap, setGap] = React.useState("");

  const d = parseFloat(pipeDiam) || 0;
  const t = parseFloat(matThick) || 0;
  const o = parseFloat(overlap) || 0;
  const g = parseFloat(gap) || 0;

  const outer = d + 2 * t;
  const base = Math.PI * outer;
  const total = Math.max(0, base + o - g);

  const [adjOpen, setAdjOpen] = React.useState(false);

  // ── Diagram calculations ───────────────────────────────────────────────────
  const cx = 100, cy = 90, maxR = 72;
  const totalR_mm = (d / 2 + t) || 1;
  const refR_mm = 110;
  const scale = maxR / Math.max(refR_mm, totalR_mm);
  const rP = (d / 2) * scale;
  const rO = totalR_mm * scale;

  const gapAngle = outer > 0 ? (g / (Math.PI * outer)) * Math.PI * 2 : 0;
  const overAngle = outer > 0 ? (o / (Math.PI * outer)) * Math.PI * 2 : 0;

  const getArcPath = (r, startA, endA) => {
    const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    const lg = (endA - startA) > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} Z`;
  };

  // Text vertical positions
  const ty1 = 28;
  const ty2 = ty1 + 20;
  const ty3 = ty2 + (o > 0 ? 20 : 0);
  const tyTotal = ty1 + (o > 0 ? 20 : 0) + (g > 0 ? 20 : 0) + 22;
  const tyLegend = tyTotal + 14;

  return (
    <div className="page-scroll">
      <Stack className="page-inner" gap={5}>

        {/* ── header ── */}
        <Stack className="main-head pw-head-adj" gap={1}>
          <div className="title">Pipe wrap calculator</div>
          <div className="desc">Material length needed to wrap around a pipe</div>
        </Stack>

        {/* ── inputs ── */}
        <div className="section">
          <div className="section-head">
            <span>Dimensions</span>
          </div>
          <div className="section-body">
            <Stack className="section-pad" gap={3}>
              <div className="pw-grid-2col">
                <NumInput
                  id="input-pipeDiam"
                  label="Pipe outer diameter (mm)"
                  value={pipeDiam}
                  min={1}
                  onChange={setPipeDiam}
                />

                <NumInput
                  id="input-matThick"
                  label="Material thickness (mm)"
                  value={matThick}
                  min={0}
                  onChange={setMatThick}
                />
              </div>

              {/* presets */}
              <Stack gap={2}>
                <div className="num-lbl pw-preset-label">Pipe diameter presets</div>
                <div className="ctrl-btns">
                  {PRESETS.map(p => (
                    <button
                      key={p}
                      className={`pill-btn${pipeDiam === p ? " on" : ""}`}
                      onClick={() => setPipeDiam(p)}
                    >
                      Ø {p}
                    </button>
                  ))}
                </div>
              </Stack>
            </Stack>
          </div>
        </div>

        {/* ── adjustments ── */}
        <Section title="Adjustments" open={adjOpen} setOpen={setAdjOpen}>
          <Stack className="section-pad" gap={3}>

            {/* overlap */}
            <Stack direction="row" gap={3} className="pw-adj-row">
              <span className="ctrl-sublbl pw-adj-label">Overlap / extra (mm)</span>
              <RangeSlider
                id="input-overlap"
                min={0} max={200} step={5} value={overlap}
                className="pw-adj-range"
                onChange={e => setOverlap(e.target.value)}
              />
              <input
                id="input-overlap-val"
                name="input-overlap-val"
                type="number"
                className="num-input pw-adj-val"
                min={0} max={200} step={1}
                value={overlap}
                onChange={e => setOverlap(e.target.value)}
                onBlur={e => {
                  const v = e.target.value;
                  if (v === "") setOverlap("");
                  else setOverlap(Math.max(0, Math.min(200, parseFloat(v) || 0)));
                }}
              />
            </Stack>

            {/* gap */}
            <Stack direction="row" gap={3} className="pw-adj-row">
              <span className="ctrl-sublbl pw-adj-label">Gap / cutout (mm)</span>
              <RangeSlider
                id="input-gap"
                min={0} max={200} step={5} value={gap}
                className="pw-adj-range"
                onChange={e => setGap(e.target.value)}
              />
              <input
                id="input-gap-val"
                name="input-gap-val"
                type="number"
                className="num-input pw-adj-val"
                min={0} max={200} step={1}
                value={gap}
                onChange={e => setGap(e.target.value)}
                onBlur={e => {
                  const v = e.target.value;
                  if (v === "") setGap("");
                  else setGap(Math.max(0, Math.min(200, parseFloat(v) || 0)));
                }}
              />
            </Stack>

          </Stack>
        </Section>

        {/* ── results ── */}
        <div className="section">
          <div className="section-head">
            <span>Result</span>
          </div>
          <div className="section-body">

            <div className="pw-res-wrap">
              <Row label="Outer diameter" value={outer.toFixed(1)} unit="mm" />
              <Row label="Base wrap length" value={base.toFixed(1)} unit="mm" />
              <Row label="Final length needed" value={total.toFixed(1)} unit="mm" hi />
            </div>

            {/* diagram */}
            <div className="pw-diag-wrap">
              <svg viewBox="0 0 420 180" width="100%" className="pw-diag-svg">
                {/* Outer ring */}
                <circle cx={cx} cy={cy} r={rO}
                  fill="color-mix(in srgb, var(--color-gray-light) 80%, transparent)"
                  stroke="var(--color-gray)" strokeWidth="0.5"/>

                {/* Gap arc */}
                {g > 0 && (
                  <path d={getArcPath(rO, -Math.PI / 2, -Math.PI / 2 + gapAngle)}
                    fill="color-mix(in srgb, var(--color-gray-opa80) 40%, transparent)"
                    stroke="var(--color-gray)" strokeWidth="0.5"/>
                )}

                {/* Overlap arc */}
                {o > 0 && (
                  <path d={getArcPath(rO, -Math.PI / 2 + gapAngle, -Math.PI / 2 + gapAngle + overAngle)}
                    fill="color-mix(in srgb, var(--color-blue) 35%, transparent)"
                    stroke="var(--color-blue)" strokeWidth="0.5" opacity="0.9"/>
                )}

                {/* Pipe circle */}
                <circle cx={cx} cy={cy} r={rP}
                  fill="var(--color-darkblue)"
                  stroke="var(--color-gray)" strokeWidth="0.5"/>

                {/* Pipe labels */}
                <text x={cx} y={cy - 4} style={{ fontFamily: 'var(--mono)', fontSize: '9px', fill: 'var(--color-gray-opa80)' }} textAnchor="middle">pipe</text>
                <text x={cx} y={cy + 8} style={{ fontFamily: 'var(--mono)', fontSize: '9px', fill: 'var(--color-gray-opa80)' }} textAnchor="middle">Ø{d}mm</text>

                {/* Calculation lines */}
                <text x="230" y={ty1} style={{ fontFamily: 'var(--mono)', fontSize: '11px', fill: 'var(--color-gray-opa80)' }}>
                  π × ({d} + 2×{t}) = {base.toFixed(1)} mm
                </text>
                {o > 0 && (
                  <text x="230" y={ty2} style={{ fontFamily: 'var(--mono)', fontSize: '11px', fill: 'var(--color-blue)' }}>
                    + overlap {o} mm
                  </text>
                )}
                {g > 0 && (
                  <text x="230" y={ty3} style={{ fontFamily: 'var(--mono)', fontSize: '11px', fill: 'var(--color-gray-opa80)' }}>
                    − gap {g} mm
                  </text>
                )}
                <text x="230" y={tyTotal} style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, fill: 'var(--color-primary)' }}>
                  = {total.toFixed(1)} mm
                </text>

                {/* CM Result pill */}
                <g transform="translate(230, 155)">
                  <rect x="-8" y="-22" width="120" height="30" rx="6" 
                    fill="color-mix(in srgb, var(--color-primary) 8%, transparent)"
                    stroke="color-mix(in srgb, var(--color-primary) 20%, transparent)"
                    strokeWidth="0.5" />
                  <text x="8" y="2" style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 800, fill: 'var(--color-primary)' }}>
                    {(total / 10).toFixed(1)} cm
                  </text>
                </g>

                {/* Legend */}
                {g > 0 && (
                  <g>
                    <rect x="230" y={tyLegend} width="9" height="9" rx="2"
                      fill="color-mix(in srgb, var(--color-gray-opa80) 40%, transparent)"
                      stroke="var(--color-gray)" strokeWidth="0.5"/>
                    <text x="243" y={tyLegend + 8} style={{ fontFamily: 'var(--mono)', fontSize: '10px', fill: 'var(--color-gray-opa80)' }}>gap</text>
                  </g>
                )}
                {o > 0 && (
                  <g>
                    <rect x="230" y={tyLegend + (g > 0 ? 16 : 0)} width="9" height="9" rx="2"
                      fill="color-mix(in srgb, var(--color-blue) 35%, transparent)"
                      stroke="var(--color-blue)" strokeWidth="0.5"/>
                    <text x="243" y={tyLegend + 8 + (g > 0 ? 16 : 0)} style={{ fontFamily: 'var(--mono)', fontSize: '10px', fill: 'var(--color-blue)' }}>overlap</text>
                  </g>
                )}
              </svg>
            </div>

            <div className="pw-formula-wrap">
              <span className="pw-formula-text">
                formula: π × (pipe Ø + 2 × thickness) + overlap − gap
              </span>
            </div>

          </div>
        </div>

      </Stack>
    </div>
  );
}
