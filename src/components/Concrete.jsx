// ── Concrete Calculator ────────────────────────────────────────────────────────

function SheetConcrete() {
  const [areaMode,  setAreaMode]  = React.useState("direct"); // "direct" | "dims"
  const [thickMode, setThickMode] = React.useState("avg");    // "avg" | "corners"

  // Area inputs
  const [areaManual, setAreaManual] = React.useState("");
  const [lenMm,      setLenMm]      = React.useState("");
  const [widMm,      setWidMm]      = React.useState("");

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
    setAreaManual("");
    setLenMm("");
    setWidMm("");
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
    setRate(p.rate === "" ? "" : (parseFloat(p.rate) || 0));
    setBagKg(p.bagKg === "" ? "" : (parseFloat(p.bagKg) || 0));
    setBagPrice(p.bagPrice);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const parseNum = (v) => {
    if (v === "" || v === null || v === undefined) return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const area = areaMode === "dims"
    ? (parseNum(lenMm) * parseNum(widMm)) / 1_000_000
    : parseNum(areaManual);

  const computedDimsArea = (parseNum(lenMm) * parseNum(widMm)) / 1_000_000;

  let computedAvgH, diff;
  if (thickMode === "avg") {
    computedAvgH = parseNum(avgH);
    diff = null;
  } else {
    const va = parseNum(ca);
    const vb = parseNum(cb);
    const vc = parseNum(cc);
    const vd = parseNum(cd);
    computedAvgH = (va + vb + vc + vd) / 4;
    diff = Math.max(va, vb, vc, vd) - Math.min(va, vb, vc, vd);
  }

  const mass = area * computedAvgH * parseNum(rate);
  const bags = parseNum(bagKg) > 0 ? Math.ceil(mass / parseNum(bagKg)) : 0;
  
  const bPrice = parseNum(bagPrice);
  const totalPrice = (bags > 0 && bPrice > 0) ? (bags * bPrice) : null;

  const fmtEur = n => n.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const hasAnyInput = Boolean(
    areaManual || lenMm || widMm || 
    avgH || ca || cb || cc || cd || 
    rate || bagKg || bagPrice
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-scroll">
      <Stack className="page-inner" gap={5}>

        {/* ── Area & Thickness ── */}
        <Section title="Area & Thickness">
          <div className="concrete-split-wrap section-pad">
            
            {/* Left Column: Floor Area */}
            <Stack gap={3}>
              <Stack direction="row" gap={1} className="ctrl-btns">
                <button
                  className={"ctrl-dir" + (areaMode === "direct" ? " on" : "")}
                  onClick={() => setAreaMode("direct")}>Enter area</button>
                <button
                  className={"ctrl-dir" + (areaMode === "dims" ? " on" : "")}
                  onClick={() => setAreaMode("dims")}>Room dimensions</button>
              </Stack>

              <div className="concrete-split-content">
                {areaMode === "direct" && (
                  <NumInput
                    id="input-slf-area"
                    label="Area (m²)"
                    value={areaManual}
                    min={0}
                    step={0.1}
                    unit="m²"
                    onChange={v => setAreaManual(String(v))}
                    req={hasAnyInput && !areaManual}
                  />
                )}

                {areaMode === "dims" && (
                  <Stack gap={3}>
                    <div className="pw-grid-2col" style={{ marginBottom: 0 }}>
                      <NumInput id="input-slf-len" label="Length (mm)" value={lenMm} min={1} step={10} unit="mm" onChange={setLenMm} req={hasAnyInput && !lenMm} />
                      <NumInput id="input-slf-wid" label="Width (mm)"  value={widMm} min={1} step={10} unit="mm" onChange={setWidMm} req={hasAnyInput && !widMm} />
                    </div>
                    <Row label="Calculated area" value={computedDimsArea.toFixed(1)} unit="m²" />
                  </Stack>
                )}
              </div>
            </Stack>

            <div className="concrete-split-divider" />

            {/* Right Column: Layer Thickness */}
            <Stack gap={3}>
              <Stack direction="row" gap={1} className="ctrl-btns">
                <button
                  className={"ctrl-dir" + (thickMode === "avg" ? " on" : "")}
                  onClick={() => setThickMode("avg")}>Average thickness</button>
                <button
                  className={"ctrl-dir" + (thickMode === "corners" ? " on" : "")}
                  onClick={() => setThickMode("corners")}>4 corners</button>
              </Stack>

              <div className="concrete-split-content">
                {thickMode === "avg" && (
                  <NumInput id="input-slf-havg" label="Average thickness (mm)" value={avgH} min={1} step={1} unit="mm" onChange={setAvgH} req={hasAnyInput && !avgH} />
                )}

                {thickMode === "corners" && (
                  <Stack gap={3}>
                    <div className="pw-grid-2col" style={{ marginBottom: "var(--sp-3)" }}>
                      <NumInput id="input-slf-ca" label="Corner A (mm)" value={ca} min={0} step={1} unit="mm" onChange={setCa} req={hasAnyInput && !ca} />
                      <NumInput id="input-slf-cb" label="Corner B (mm)" value={cb} min={0} step={1} unit="mm" onChange={setCb} req={hasAnyInput && !cb} />
                    </div>
                    <div className="pw-grid-2col" style={{ marginBottom: 0 }}>
                      <NumInput id="input-slf-cc" label="Corner C (mm)" value={cc} min={0} step={1} unit="mm" onChange={setCc} req={hasAnyInput && !cc} />
                      <NumInput id="input-slf-cd" label="Corner D (mm)" value={cd} min={0} step={1} unit="mm" onChange={setCd} req={hasAnyInput && !cd} />
                    </div>
                  </Stack>
                )}
              </div>
            </Stack>

          </div>
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
                    <div className="num-wrap">
                      <span className={`num-lbl ${idx > 0 ? "pw-preset-lbl-hide" : ""}`}>&nbsp;</span>
                      <button 
                        className="ctrl-dir on pw-preset-apply" 
                        onClick={() => applyPreset(p)}
                        title="Apply these values to the calculator"
                      >
                        <Icon name="check" /> Apply
                      </button>
                    </div>
                  </div>
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
              <NumInput id="input-slf-rate"   label="Consumption (kg/m²·mm)" value={rate}   min={0.1} step={0.1} onChange={setRate} req={hasAnyInput && !rate} />
              <NumInput id="input-slf-bagkg"  label="Bag weight (kg)"        value={bagKg}  min={1}   step={1}   unit="kg" onChange={setBagKg} req={hasAnyInput && !bagKg} />
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
            <Row label="Total mix mass"   value={mass > 0 ? mass.toFixed(1) : "0.0"} unit="kg" />
            <Row label="Bags needed"      value={bags || "0"}                  unit="pcs" hi={bags > 0} />
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
