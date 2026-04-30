// ── Concrete Calculator ────────────────────────────────────────────────────────

function SheetConcrete() {
  const [areaMode,  setAreaMode]  = React.useState("direct"); // "direct" | "dims"
  const [thickMode, setThickMode] = React.useState("avg");    // "avg" | "corners"

  // Area inputs
  const [areaManual, setAreaManual] = React.useState("");
  const [lenMm,      setLenMm]      = React.useState(1000);
  const [widMm,      setWidMm]      = React.useState(1000);

  // Thickness inputs
  const [avgH, setAvgH] = React.useState(10);
  const [ca,   setCa]   = React.useState(10);
  const [cb,   setCb]   = React.useState(15);
  const [cc,   setCc]   = React.useState(8);
  const [cd,   setCd]   = React.useState(12);

  // Consumption & packaging
  const [rate,     setRate]     = React.useState(1.7);
  const [bagKg,    setBagKg]    = React.useState(25);
  const [bagPrice, setBagPrice] = React.useState("");

  // ── Derived values ─────────────────────────────────────────────────────────

  const area = areaMode === "dims"
    ? (lenMm * widMm) / 1_000_000
    : (parseFloat(areaManual) || 0);

  const computedDimsArea = (lenMm * widMm) / 1_000_000;

  let computedAvgH, diff;
  if (thickMode === "avg") {
    computedAvgH = avgH;
    diff = null;
  } else {
    computedAvgH = (ca + cb + cc + cd) / 4;
    diff = Math.max(ca, cb, cc, cd) - Math.min(ca, cb, cc, cd);
  }

  const mass = area * computedAvgH * rate;
  const bags = bagKg > 0 ? Math.ceil(mass / bagKg) : 0;
  const totalPrice = bags > 0 && parseFloat(bagPrice) > 0
    ? bags * parseFloat(bagPrice)
    : null;

  const fmtEur = n => n.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-scroll">
      <Stack className="page-inner" gap={5}>

        {/* ── Floor area ── */}
        <Section title="Floor Area">
          <Stack className="section-pad" gap={3}>

            {/* mode toggle */}
            <Stack direction="row" gap={1} className="ctrl-btns">
              <button
                className={"ctrl-dir" + (areaMode === "direct" ? " on" : "")}
                onClick={() => setAreaMode("direct")}>Enter area</button>
              <button
                className={"ctrl-dir" + (areaMode === "dims" ? " on" : "")}
                onClick={() => setAreaMode("dims")}>Room dimensions</button>
            </Stack>

            {areaMode === "direct" && (
              <NumInput
                id="input-slf-area"
                label="Area (m²)"
                value={parseFloat(areaManual) || 0}
                min={0}
                step={0.1}
                unit="m²"
                onChange={v => setAreaManual(String(v))}
              />
            )}

            {areaMode === "dims" && (
              <Stack gap={3}>
                <div className="pw-grid-2col">
                  <NumInput id="input-slf-len" label="Length (mm)" value={lenMm} min={1} step={10} unit="mm" onChange={setLenMm} />
                  <NumInput id="input-slf-wid" label="Width (mm)"  value={widMm} min={1} step={10} unit="mm" onChange={setWidMm} />
                </div>
                <Row label="Calculated area" value={computedDimsArea.toFixed(1)} unit="m²" />
              </Stack>
            )}

          </Stack>
        </Section>

        {/* ── Layer thickness ── */}
        <Section title="Layer Thickness">
          <Stack className="section-pad" gap={3}>

            <Stack direction="row" gap={1} className="ctrl-btns">
              <button
                className={"ctrl-dir" + (thickMode === "avg" ? " on" : "")}
                onClick={() => setThickMode("avg")}>Average thickness</button>
              <button
                className={"ctrl-dir" + (thickMode === "corners" ? " on" : "")}
                onClick={() => setThickMode("corners")}>4 corners</button>
            </Stack>

            {thickMode === "avg" && (
              <NumInput id="input-slf-havg" label="Average thickness (mm)" value={avgH} min={1} step={1} unit="mm" onChange={setAvgH} />
            )}

            {thickMode === "corners" && (
              <Stack gap={3}>
                <div className="pw-grid-2col">
                  <NumInput id="input-slf-ca" label="Corner A (mm)" value={ca} min={0} step={1} unit="mm" onChange={setCa} />
                  <NumInput id="input-slf-cb" label="Corner B (mm)" value={cb} min={0} step={1} unit="mm" onChange={setCb} />
                </div>
                <div className="pw-grid-2col">
                  <NumInput id="input-slf-cc" label="Corner C (mm)" value={cc} min={0} step={1} unit="mm" onChange={setCc} />
                  <NumInput id="input-slf-cd" label="Corner D (mm)" value={cd} min={0} step={1} unit="mm" onChange={setCd} />
                </div>
              </Stack>
            )}

          </Stack>
        </Section>

        {/* ── Consumption & packaging ── */}
        <Section title="Consumption &amp; Packaging">
          <Stack className="section-pad" gap={3}>
            <div className="pw-grid-2col">
              <NumInput id="input-slf-rate"   label="Consumption (kg/m²·mm)" value={rate}   min={0.1} step={0.1} onChange={setRate} />
              <NumInput id="input-slf-bagkg"  label="Bag weight (kg)"        value={bagKg}  min={1}   step={1}   unit="kg" onChange={setBagKg} />
            </div>
            <NumInput
              id="input-slf-bagprice"
              label="Bag price (€)"
              value={parseFloat(bagPrice) || 0}
              min={0}
              step={0.01}
              onChange={v => setBagPrice(String(v))}
            />
          </Stack>
        </Section>

        {/* ── Results ── */}
        <Section title="Results">
          <Stack className="section-pad" gap={1}>
            <Row label="Floor area"       value={area.toFixed(1)}              unit="m²" />
            <Row label="Avg thickness"    value={Math.round(computedAvgH)}     unit="mm" />
            {diff !== null && (
              <Row label="Height difference" value={Math.round(diff)}          unit="mm" />
            )}
            <Row label="Total mix mass"   value={mass > 0 ? mass.toFixed(1) : "—"} unit={mass > 0 ? "kg" : ""} />
            <Row label="Bags needed"      value={bags || "—"}                  unit={bags ? "pcs" : ""} hi />
            <Row
              label="Total price"
              value={totalPrice !== null ? ("€\u202f" + fmtEur(totalPrice)) : "—"}
              hi={totalPrice !== null}
            />
            <div className="pw-formula-wrap">
              <span className="pw-formula-text">
                mass = area × avg thickness × consumption rate
              </span>
            </div>
          </Stack>
        </Section>

        <div className="pw-formula-wrap" style={{ paddingBottom: "1rem" }}>
          <span className="pw-formula-text">
            Results are approximate — actual consumption may vary due to substrate absorption and mixing residue.
          </span>
        </div>

      </Stack>
    </div>
  );
}
