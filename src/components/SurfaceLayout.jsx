function SheetSurfaceLayout({ sh, setSh }) {
  const { W, H, PPi, PLa, offset, direction, minJ, startOff, s4Long, s4Short } = sh;
  const rowStart = sh.rowStart || "top";
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
  const best = comparableResults.length ? Math.min(...comparableResults.map(p => p.result.stats.total)) : Infinity;

  if (W <= 0 || H <= 0 || PPi <= 0 || PLa <= 0) {
    return (
      <>
        <Stack id="data-control" className="data-control" gap={3}>
          <Stack gap={1}>
            <SLabel>Material Specification</SLabel>
            <NumInput id="input-PPi" label="Length (mm)" value={Math.max(1, PPi)} onChange={set("PPi")} step={10} />
            <NumInput id="input-PLa" label="Width (mm)"  value={Math.max(1, PLa)} onChange={set("PLa")} step={10} />
          </Stack>
          <Stack gap={1}>
            <SLabel>Surface Area</SLabel>
            <NumInput id="input-W" label="Width (mm)"  value={Math.max(1, W)} onChange={set("W")} step={10} />
            <NumInput id="input-H" label="Height (mm)" value={Math.max(1, H)} onChange={set("H")} step={10} />
          </Stack>
        </Stack>
        <div id="data-preview" className="data-preview">
          <p className="desc">Select all input values - all must be greater than 0!</p>
        </div>
      </>
    );
  }
  return (
    <>
      <Stack id="data-control" className="data-control" gap={3}>
        <ControlPanel id="control-material" title="Material Specification" open={materialOpen} setOpen={setMaterialOpen}>
          <Stack gap={3}>
            <NumInput id="input-PPi" label="Length (mm)" value={PPi} onChange={set("PPi")} step={10} />
            <NumInput id="input-PLa" label="Width (mm)"  value={PLa} onChange={set("PLa")} step={10} />
          </Stack>
        </ControlPanel>
        <ControlPanel id="control-surface" title="Surface Area" open={surfaceOpen} setOpen={setSurfaceOpen}>
          <Stack gap={3}>
            <NumInput id="input-W" label="Width (mm)"  value={W} onChange={set("W")} step={10} />
            <NumInput id="input-H" label="Height (mm)" value={H} onChange={set("H")} step={10} />
          </Stack>
        </ControlPanel>
        <ControlPanel id="control-settings" title="Settings" open={settingsOpen} setOpen={setSettingsOpen}>
          <Stack gap={3}>
            <Stack gap={1} className="ctrl-lbl">
              <span className="ctrl-sublbl">Direction</span>
              <div id="ctrl-direction" className="seg-group">
                {["V", "H"].map(s => (
                  <button key={s} className={"ctrl-dir " + (direction === s ? "on" : "")}
                    onClick={() => setSh(st => ({ ...st, direction: s }))}>{s}</button>
                ))}
              </div>
            </Stack>
            <Stack gap={1} className="ctrl-lbl">
              <span className="ctrl-sublbl">Row order</span>
              <div id="ctrl-row-order" className="seg-group">
                <button className={"ctrl-dir " + (rowStart === "top" ? "on" : "")}
                  onClick={() => setSh(st => ({ ...st, rowStart: "top" }))}>R1 top</button>
                <button className={"ctrl-dir " + (rowStart === "bottom" ? "on" : "")}
                  onClick={() => setSh(st => ({ ...st, rowStart: "bottom" }))}>R1 bottom</button>
              </div>
            </Stack>
            <NumInput id="input-minJ"     label="Min remainder (mm)"  value={minJ}     onChange={set("minJ")}    step={10} />
            <NumInput id="input-startOff" label="R1 start point (mm)" value={startOff}
              onChange={v => setSh(s => ({ ...s, startOff: Math.min(v, Math.max(1, PPi) - 1) }))} step={10} min={0} />
          </Stack>
        </ControlPanel>
      </Stack>
      <div id="data-preview" className="data-preview">
        <PreviewSection id="pattern-layouts" title="Pattern Layouts"
          description="Compare row-based layouts that share the same surface and material settings.">
          {["s1", "s2", "s3", "s4"].map(id => {
            const panel = panelResultsById[id];
            if (!panel) return null;
            return (
              <LayoutPanel key={id} layout={panel.layout} result={panel.result}
                hoveredType={hoveredType} setHoveredType={setHoveredType}
                rowStart={rowStart}
                isBest={panel.layout.includeInBest && panel.result.valid && panel.result.stats.total === best} />
            );
          })}
        </PreviewSection>
      </div>
    </>
  );
}
