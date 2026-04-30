// ── Concrete Calculator ────────────────────────────────────────────────────────

function SheetConcrete() {
  const [areaMode,  setAreaMode]  = React.useState("direct"); // "direct" | "dims"
  const [thickMode, setThickMode] = React.useState("avg");    // "avg" | "corners"

  // Area inputs
  const [areaManual, setAreaManual] = React.useState("");
  const [lenMm,      setLenMm]      = React.useState(1000);
  const [widMm,      setWidMm]      = React.useState(1000);

  // Thickness inputs
  const [avgH, setAvgH] = React.useState("");
  const [ca,   setCa]   = React.useState("");
  const [cb,   setCb]   = React.useState("");
  const [cc,   setCc]   = React.useState("");
  const [cd,   setCd]   = React.useState("");

  // Consumption & packaging
  const [rate,     setRate]     = React.useState("");
  const [bagKg,    setBagKg]    = React.useState("");
  const [bagPrice, setBagPrice] = React.useState("");

  // Product presets (quick fill)
  const [presets, setPresets] = React.useState([
    { name: "weber S-100", rate: 2, bagKg: 25, bagPrice: 4 },
    { name: "weberfloor 200 RAPID", rate: 1.7, bagKg: 20, bagPrice: 15 },
    { name: "", rate: 1.7, bagKg: 25, bagPrice: "" }
  ]);
  
  const resetAll = () => {
    setAreaMode("direct");
    setThickMode("avg");
    setAreaManual("");
    setLenMm(1000);
    setWidMm(1000);
    setAvgH("");
    setCa(""); setCb(""); setCc(""); setCd("");
    setRate("");
    setBagKg("");
    setBagPrice("");
  };

  const updatePreset = (idx, field, val) => {
    const next = [...presets];
    next[idx] = { ...next[idx], [field]: val };
    setPresets(next);
  };

  const addPreset = () => {
    setPresets([...presets, { name: "", rate: 1.7, bagKg: 25, bagPrice: "" }]);
  };

  const applyPreset = (p) => {
    setRate(parseFloat(p.rate) || 0);
    setBagKg(parseFloat(p.bagKg) || 0);
    setBagPrice(p.bagPrice);
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const area = areaMode === "dims"
    ? (lenMm * widMm) / 1_000_000
    : (parseFloat(areaManual) || 0);

  const computedDimsArea = (lenMm * widMm) / 1_000_000;

  let computedAvgH, diff;
  if (thickMode === "avg") {
    computedAvgH = parseFloat(avgH) || 0;
    diff = null;
  } else {
    const va = parseFloat(ca) || 0;
    const vb = parseFloat(cb) || 0;
    const vc = parseFloat(cc) || 0;
    const vd = parseFloat(cd) || 0;
    computedAvgH = (va + vb + vc + vd) / 4;
    diff = Math.max(va, vb, vc, vd) - Math.min(va, vb, vc, vd);
  }

  const mass = area * computedAvgH * (parseFloat(rate) || 0);
  const bags = (parseFloat(bagKg) || 0) > 0 ? Math.ceil(mass / (parseFloat(bagKg) || 0)) : 0;
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
                value={areaManual}
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

        {/* ── Product Presets ── */}
        <Section title="Product Presets">
          <Stack className="section-pad" gap={4}>
            <Stack gap={3}>
              {presets.map((p, idx) => (
                <div key={idx} className="pw-preset-row">
                  <div className="pw-preset-fields">
                    <div className="num-wrap">
                      <span className={`num-lbl ${idx > 0 ? "pw-preset-lbl-hide" : ""}`}>Product Name</span>
                      <input
                        id={`preset-name-${idx}`}
                        name={`preset-name-${idx}`}
                        type="text"
                        className="num-input"
                        placeholder="Product name..."
                        value={p.name}
                        onChange={e => updatePreset(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="num-wrap">
                      <span className={`num-lbl ${idx > 0 ? "pw-preset-lbl-hide" : ""}`}>kg/m²·mm</span>
                      <input
                        id={`preset-rate-${idx}`}
                        name={`preset-rate-${idx}`}
                        type="number"
                        className="num-input"
                        value={p.rate}
                        onChange={e => updatePreset(idx, "rate", e.target.value)}
                      />
                    </div>
                    <div className="num-wrap">
                      <span className={`num-lbl ${idx > 0 ? "pw-preset-lbl-hide" : ""}`}>Bag kg</span>
                      <input
                        id={`preset-bagkg-${idx}`}
                        name={`preset-bagkg-${idx}`}
                        type="number"
                        className="num-input"
                        value={p.bagKg}
                        onChange={e => updatePreset(idx, "bagKg", e.target.value)}
                      />
                    </div>
                    <div className="num-wrap">
                      <span className={`num-lbl ${idx > 0 ? "pw-preset-lbl-hide" : ""}`}>Price €</span>
                      <input
                        id={`preset-price-${idx}`}
                        name={`preset-price-${idx}`}
                        type="number"
                        className="num-input"
                        value={p.bagPrice}
                        onChange={e => updatePreset(idx, "bagPrice", e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    className="ctrl-dir on pw-preset-apply" 
                    onClick={() => applyPreset(p)}
                    title="Apply these values to the calculator"
                  >
                    <Icon name="check" /> Apply
                  </button>
                </div>
              ))}
            </Stack>

            <Stack direction="row" gap={2}>
              <button className="ctrl-dir" onClick={addPreset}>
                <Icon name="plus" /> Add Row
              </button>
            </Stack>

            <div className="pw-formula-text" style={{ opacity: 0.7 }}>
              Fill product data above and click "Apply" to update the calculator values.
            </div>
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
              value={bagPrice}
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

            <Stack direction="row" gap={2} style={{ marginTop: "1rem" }}>
              <button className="ctrl-dir" onClick={resetAll} style={{ width: "auto", padding: "8px 16px" }}>
                <Icon name="refresh-cw" /> Global Reset
              </button>
            </Stack>
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
