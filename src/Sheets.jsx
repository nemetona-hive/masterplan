// ── Page sheets ───────────────────────────────────────────────────────────────

function SheetHome({ page, setPage }) {
  const cards = PAGES.filter(pg => !pg.noNav && !pg.parentId);
  return (
    <div className="home-scroll">
      <div className="home-inner">

        <div className="home-brand">
          <div className="home-brand-name">NEMETONA</div>
          <div className="home-brand-sub">MASTERPLAN</div>
        </div>

        <div className="home-divider" />

        <div className="home-cards">
          {cards.map(pg => {
            const isActive = page === pg.id ||
              PAGES.some(p => p.parentId === pg.id && p.id === page);
            const firstChild = PAGES.find(p => p.parentId === pg.id);
            const target = firstChild ? firstChild.id : pg.id;
            return (
              <button key={pg.id}
                className={"home-card" + (isActive ? " home-card-active" : "")}
                onClick={() => setPage(target)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && setPage(target)}>
                <span className="home-card-icon"><Icon name={pg.icon} /></span>
                <span className="home-card-title">{pg.title}</span>
                <span className="home-card-desc">{pg.desc}</span>
                <span className="home-card-arrow"><Icon name="chevron-right" /></span>
              </button>
            );
          })}
        </div>

        <div className="home-divider" />

        <div className="home-footer">NEMETONA HIVE</div>

      </div>
    </div>
  );
}

function SheetConcrete() {
  return (
    <>
      <div id="data-control" className="data-control" />
      <div id="data-preview" className="data-preview" />
    </>
  );
}

function SheetArea({ sh }) {
  const { W, H, PPi, PLa } = sh;
  if (W <= 0 || H <= 0 || PPi <= 0 || PLa <= 0) {
    return <div className="page-inner"><p className="desc">Select input values - all values must be greater than 0</p></div>;
  }
  const grossArea = W * H / 1e6, panelArea = PPi * PLa / 1e6;
  return (
    <div className="page-inner">
      <p className="desc">Linked from Layout page &mdash; change data in Layout view</p>
      <Section title="Surface dimensions" bg="#09101a">
        <Row label="Surface width"   value={Math.max(0, W)}   unit="mm" />
        <Row label="Surface height"  value={Math.max(0, H)}   unit="mm" />
        <Row label="Area"            value={fmt.area(Math.max(0, grossArea))} unit="m&sup2;" hi={true} />
        <Row label="Panel length"    value={Math.max(0, PPi)} unit="mm" />
        <Row label="Panel width"     value={Math.max(0, PLa)} unit="mm" />
        <Row label="Panel area"      value={fmt.decimals(Math.max(0, panelArea), 4)} unit="m&sup2;" />
        <Row label="Panel direction" value={sh.direction} />
      </Section>
    </div>
  );
}

function SheetSymmetricLayout({ sym, setSym }) {
  const [hoveredType, setHoveredType] = React.useState(null);
  const [surfaceOpen, setSurfaceOpen] = React.useState(true);
  const layout = {
    id: "s0", title: "Symmetric layout", description: "Equal edge pieces, full pieces in center",
    defaultOpen: true, renderControls: null, icon: "s0",
    getState: () => ({}), setState: () => {},
    compute: () => computeS0(sym),
    includeInBest: false
  };
  const result = layout.compute();
  return (
    <>
      <div id="data-control" className="data-control">
        <ControlPanel id="control-sym-surface" title="Surface Area" open={surfaceOpen} setOpen={setSurfaceOpen}>
          <NumInput id="input-sym-room-width"  label="Room width (mm)"  value={sym.roomWidth}  onChange={v => setSym(s => ({ ...s, roomWidth: v }))}  step={10} />
          <NumInput id="input-sym-panel-width" label="Panel width (mm)" value={sym.panelWidth} onChange={v => setSym(s => ({ ...s, panelWidth: v }))} step={10} />
        </ControlPanel>
      </div>
      <div id="data-preview" className="data-preview">
        <LayoutPanel layout={layout} result={result} hoveredType={hoveredType} setHoveredType={setHoveredType} isBest={false} />
      </div>
    </>
  );
}

function SheetSurfaceLayout({ sh, setSh }) {
  const { W, H, PPi, PLa, offset, direction, minJ, startOff, s4Long, s4Short } = sh;
  const [hoveredType, setHoveredType] = React.useState(null);
  const [materialOpen, setMaterialOpen] = React.useState(true);
  const [surfaceOpen,  setSurfaceOpen]  = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const set = k => v => setSh(s => ({ ...s, [k]: v }));
  const setS2PanelState = patch => setSh(s => ({ ...s, offset:  patch.offset  !== undefined ? patch.offset  : s.offset }));
  const setS4PanelState = patch => setSh(s => ({ ...s,
    s4Long:  patch.s4Long  !== undefined ? patch.s4Long  : s.s4Long,
    s4Short: patch.s4Short !== undefined ? patch.s4Short : s.s4Short
  }));
  const stateGetters = { s1: () => ({}), s2: () => ({ offset }), s3: () => ({}), s4: () => ({ s4Long, s4Short }) };
  const stateSetters = { s1: () => {}, s2: setS2PanelState, s3: () => {}, s4: setS4PanelState };
  const layoutRegistry = LAYOUT_REGISTRY.map(sys => ({
    ...sys,
    description: getDescription(sys.id, sh),
    defaultOpen: false,
    getState: stateGetters[sys.id] || (() => ({})),
    setState:  stateSetters[sys.id] || (() => {}),
    compute: () => sys.compute(sh)
  }));
  const panelResults      = layoutRegistry.map(layout => ({ layout, result: layout.compute() }));
  const panelResultsById  = panelResults.reduce((acc, p) => { acc[p.layout.id] = p; return acc; }, {});
  const comparableResults = panelResults.filter(p => p.layout.includeInBest && p.result.valid);
  const best = comparableResults.length ? Math.min(...comparableResults.map(p => p.result.stats.total)) : 0;

  if (W <= 0 || H <= 0 || PPi <= 0 || PLa <= 0) {
    return (
      <>
        <div id="data-control" className="data-control">
          <SLabel>Material Specification</SLabel>
          <NumInput id="input-PPi" label="Length (mm)" value={Math.max(1, PPi)} onChange={set("PPi")} step={10} />
          <NumInput id="input-PLa" label="Width (mm)"  value={Math.max(1, PLa)} onChange={set("PLa")} step={10} />
          <SLabel>Surface Area</SLabel>
          <NumInput id="input-W" label="Width (mm)"  value={Math.max(1, W)} onChange={set("W")} step={10} />
          <NumInput id="input-H" label="Height (mm)" value={Math.max(1, H)} onChange={set("H")} step={10} />
        </div>
        <div id="data-preview" className="data-preview">
          <p className="desc">Select all input values - all must be greater than 0!</p>
        </div>
      </>
    );
  }
  return (
    <>
      <div id="data-control" className="data-control">
        <ControlPanel id="control-material" title="Material Specification" open={materialOpen} setOpen={setMaterialOpen}>
          <NumInput id="input-PPi" label="Length (mm)" value={PPi} onChange={set("PPi")} step={10} />
          <NumInput id="input-PLa" label="Width (mm)"  value={PLa} onChange={set("PLa")} step={10} />
        </ControlPanel>
        <ControlPanel id="control-surface" title="Surface Area" open={surfaceOpen} setOpen={setSurfaceOpen}>
          <NumInput id="input-W" label="Width (mm)"  value={W} onChange={set("W")} step={10} />
          <NumInput id="input-H" label="Height (mm)" value={H} onChange={set("H")} step={10} />
        </ControlPanel>
        <ControlPanel id="control-settings" title="Settings" open={settingsOpen} setOpen={setSettingsOpen}>
          <div className="ctrl-lbl">
            <span className="ctrl-sublbl">Direction</span>
            <div id="ctrl-direction" className="ctrl-btns">
              {["V", "H"].map(s => (
                <button key={s} className={"ctrl-dir " + (direction === s ? "on" : "")}
                  onClick={() => setSh(st => ({ ...st, direction: s }))}>{s}</button>
              ))}
            </div>
          </div>
          <NumInput id="input-minJ"     label="Min remainder (mm)"  value={minJ}     onChange={set("minJ")}    step={10} />
          <NumInput id="input-startOff" label="R1 start point (mm)" value={startOff}
            onChange={v => setSh(s => ({ ...s, startOff: Math.min(v, Math.max(1, PPi) - 1) }))} step={10} min={0} />
        </ControlPanel>
      </div>
      <div id="data-preview" className="data-preview">
        <PreviewSection id="pattern-layouts" title="Pattern Layouts"
          description="Compare row-based layouts that share the same surface and material settings.">
          {["s1", "s2", "s3", "s4"].map(id => {
            const panel = panelResultsById[id];
            if (!panel) return null;
            return (
              <LayoutPanel key={id} layout={panel.layout} result={panel.result}
                hoveredType={hoveredType} setHoveredType={setHoveredType}
                isBest={panel.layout.includeInBest && panel.result.valid && panel.result.stats.total === best} />
            );
          })}
        </PreviewSection>
      </div>
    </>
  );
}
