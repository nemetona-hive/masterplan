"use strict";
const { useState } = React;

/* -- Icon Helper -- */
function Icon({ name, className = "" }) {
  var faClass = ICONS[name] || "fa-solid fa-circle-question";
  return (
    <i 
      className={`${faClass} ${className}`} 
      style={{ display: "inline-flex", alignItems: "center" }} 
    />
  );
}

function NumInput({ id, label, value, onChange, step = 1, min = 1 }) {
  const [local, setLocal] = React.useState(String(value));

  React.useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = () => {
    const n = Number(local);
    if (!isNaN(n) && n >= min) {
      const rounded = Math.max(min, Math.round(n * 100) / 100);
      onChange(rounded);
    } else {
      setLocal(String(value));
    }
  };

  return (
    <label id={id} className="num-wrap">
      <span className="num-lbl">{label}</span>
      <div className="num-row">
        <input
          className="num-input"
          type="number"
          value={local}
          min={min}
          step={step}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          onBlur={commit}
        />
        <button className="num-btn" onClick={commit}>
          <Icon name="corner-down-left" />
        </button>
      </div>
    </label>
  );
}
function SLabel({ children }) {
  return /*#__PURE__*/React.createElement("div", {
	className: "slabel"
  }, children);
}
function Section({ title, bg = "#09101a", children }) {
  const [open, setOpen] = React.useState(true);
  return React.createElement("div", { className: "section" },
    React.createElement("div", {
      className: "section-head",
      style: { background: bg },
      onClick: function() { setOpen(!open); }
    }, React.createElement("span", { className: "sys-head-toggle" },
       React.createElement(Icon, { name: open ? "chevron-down" : "chevron-right" })), title),
    open && React.createElement("div", { className: "section-body" }, children));
}
function Row({ label, value, unit, hi, hoverType, hoveredType, setHoveredType }) {
  var isHovered = hoverType && hoveredType === hoverType;
  return /*#__PURE__*/React.createElement("div", {
	className: "data-row"
  }, /*#__PURE__*/React.createElement("span", {
	className: "data-row-lbl".concat(hoverType ? " hoverable" : "").concat(isHovered ? " hovered" : ""),
	onMouseEnter: hoverType && setHoveredType ? function () {
	  return setHoveredType(hoverType);
	} : undefined,
	onMouseLeave: hoverType && setHoveredType ? function () {
	  return setHoveredType(null);
	} : undefined
  }, label), /*#__PURE__*/React.createElement("span", {
	className: hi ? "data-row-val hi" : "data-row-val"
  }, value), unit && /*#__PURE__*/React.createElement("span", {
	className: "data-row-unit"
  }, unit));
}

/* â”€â”€ Visualisation â”€â”€ */
var PanelRowVis = React.memo(function PanelRowVis({ segs, W, palClasses, hoveredType }) {
  return /*#__PURE__*/React.createElement("div", {
	className: "panel-row"
  }, segs.map(function (seg, i) {
	var l = seg.x / W * 100,
	  w = seg.w / W * 100;
	var isGap = seg.type === "gap";
	var segPalClasses = seg.type === "full" && seg["long"] === true ? PAL_CLASSES.s4s : palClasses;
	var segClass = getSegmentClass(seg, segPalClasses);
	var isDimmed = hoveredType && seg.type === hoveredType && !isGap;
	var tc = isGap ? "#ff6666" : "var(--color-white)";
	const bgStyle = isGap ? {
	  background: "repeating-linear-gradient(45deg,#ff444433 0,#ff444433 4px,#09101a55 4px,#09101a55 8px)",
	  border: "1px dashed #ff4444"
	} : undefined;
	return /*#__PURE__*/React.createElement("div", {
	  key: i,
	  className: "panel-seg ".concat(!isGap ? segClass : "").concat(isDimmed ? " seg-highlight" : ""),
	  style: { left: `${l}%`, width: `${w}%`, ...bgStyle },
	  title: isGap ? "".concat(Math.round(seg.w), "mm \u2014 gap") : "".concat(Math.round(seg.w), "mm \u2014 ").concat(seg.type === "offcut" ? "remainder from prev" : seg.type === "cut" ? "cut" : seg.type === "edge" ? "edge piece" : "full panel")
	}, w > 4 && /*#__PURE__*/React.createElement("span", {
	  className: "panel-seg-lbl",
	  style: {
		color: tc
	  }
	}, isGap ? "\u2205".concat(Math.round(seg.w)) : Math.round(seg.w)));
  }));
});
/* â”€â”€ Sheet 1 â”€â”€ */
function S0Controls({ state, setState }) {
  return /*#__PURE__*/React.createElement("div", {
	style: {
	  display: "flex",
	  flexDirection: "column",
	  gap: 12
	}
  }, /*#__PURE__*/React.createElement(NumInput, {
	id: "input-s0-room",
	label: "Room width (mm)",
	value: state.roomWidth,
	onChange: function onChange(v) {
	  return setState({
		roomWidth: v
	  });
	},
	step: 10
  }), /*#__PURE__*/React.createElement(NumInput, {
	id: "input-s0-panel",
	label: "Panel width (mm)",
	value: state.panelWidth,
	onChange: function onChange(v) {
	  return setState({
		panelWidth: v
	  });
	},
	step: 10
  }));
}
function S4Controls({ state, setState }) {
  return /*#__PURE__*/React.createElement("div", {
	style: {
	  display: "flex",
	  flexDirection: "column",
	  gap: 12
	}
  }, /*#__PURE__*/React.createElement(NumInput, {
	id: "input-s4long",
	label: "Long (mm)",
	value: state.s4Long,
	onChange: function onChange(v) {
	  return setState({
		s4Long: v
	  });
	},
	step: 10
  }), /*#__PURE__*/React.createElement(NumInput, {
	id: "input-s4short",
	label: "Short (mm)",
	value: state.s4Short,
	onChange: function onChange(v) {
	  return setState({
		s4Short: v
	  });
	},
	step: 10
  }));
}
function S2Controls({ state, setState }) {
  return /*#__PURE__*/React.createElement("div", {
	className: "ctrl-lbl"
  }, /*#__PURE__*/React.createElement("span", {
	className: "ctrl-sublbl"
  }, "Offset (\xD7PL)"), /*#__PURE__*/React.createElement("input", {
	id: "input-offset",
	type: "range",
	min: 0.1,
	max: 0.9,
	step: 0.05,
	value: state.offset,
	onChange: function onChange(e) {
	  return setState({
		offset: +e.target.value
	  });
	},
	style: {
	  accentColor: "var(--color-primary)",
	  width: "100%",
	  height: "6px",
	  borderRadius: "3px",
	  appearance: "none",
	  
	}
  }), /*#__PURE__*/React.createElement("span", {
	className: "ctrl-range-val"
  }, fmt.decimals(state.offset, 2)));
}

// Module level — static config, no closures
var LAYOUT_REGISTRY = [
  { id: "s1", icon: "s1", title: "Straight layout", compute: computeS1, renderControls: null, includeInBest: true },
  { id: "s2", icon: "s2", title: "Shifted layout",  compute: computeS2, renderControls: S2Controls, includeInBest: true },
  { id: "s3", icon: "s3", title: "Stepped layout",  compute: computeS3, renderControls: null, includeInBest: true },
  { id: "s4", icon: "s4", title: "Long-Short",      compute: computeS4, renderControls: S4Controls, includeInBest: true },
];

function PanelSummary({ rows, hoveredType, setHoveredType }) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, rows.map(function (row, i) {
	return /*#__PURE__*/React.createElement(Row, {
	  key: i,
	  label: row.label,
	  value: row.value,
	  unit: row.unit,
	  hi: row.hi,
	  hoverType: row.hoverType,
	  hoveredType: hoveredType,
	  setHoveredType: setHoveredType
	});
  }));
}
function LayoutVisualization({ result, hoveredType }) {
  if (result.meta.visualization === "strip") {
	return /*#__PURE__*/React.createElement("div", {
	  className: "strip"
	}, result.rows[0].segs.map(function (seg, i) {
	  var wp = seg.w / result.meta.roomWidth * 100;
	  var segClass = seg.type === "edge" ? "color-edge" : "color-sys1";
	  var isDimmed = hoveredType && seg.type === hoveredType;
	  return /*#__PURE__*/React.createElement("div", {
		key: i,
		className: "strip-seg ".concat(segClass).concat(isDimmed ? " seg-highlight" : ""),
		title: "".concat(fmt.decimal(seg.w), "mm"),
		style: {
		  width: "".concat(wp, "%")
		}
	  }, wp > 5 && /*#__PURE__*/React.createElement("span", {
		className: "strip-seg-lbl"
	  }, fmt.mm(seg.w)));
	}), /*#__PURE__*/React.createElement("div", {
	  className: "strip-legend",
	  style: {
		marginTop: "10px"
	  }
	}, [["Edge piece", "".concat(fmt.mm(result.meta.edgeWidth), "mm"), "color-edge"], ["Full panel", "".concat(result.meta.panelWidth, "mm"), "color-sys1"]].map(function (item) {
	  const [label, value, color] = item;
	  return /*#__PURE__*/React.createElement("div", {
		key: label,
		className: "strip-legend-item"
	  }, /*#__PURE__*/React.createElement("div", {
		className: "strip-legend-dot ".concat(color)
	  }), /*#__PURE__*/React.createElement("span", {
		className: "strip-legend-lbl"
	  }, label, " (", value, ")"));
	})), /*#__PURE__*/React.createElement("div", {
	  className: "strip-note"
	}, "\uD83D\uDCA1 Both edge pieces are cut from full panels (2 panels are cut)."));
  }
  return /*#__PURE__*/React.createElement("div", {
	className: "sys-rows",
	style: {
	  border: "1px solid #233342"
	}
  }, result.rows.map(function (row, i) {
	return /*#__PURE__*/React.createElement("div", {
	  key: i,
	  className: "sys-row"
	}, /*#__PURE__*/React.createElement("span", {
	  className: "sys-row-lbl"
	}, "R", i + 1), /*#__PURE__*/React.createElement("div", {
	  className: "sys-row-vis"
	}, /*#__PURE__*/React.createElement(PanelRowVis, {
	  segs: row.segs,
	  W: result.meta.width,
	  palClasses: result.meta.s4 ? row["long"] ? PAL_CLASSES.s4l : PAL_CLASSES.s4s : result.meta.palClasses || PAL_CLASSES.s1,
	  hoveredType: hoveredType
	})));
  }));
}
function LayoutPanel({ layout, result, hoveredType, isBest, setHoveredType }) {
  const [open, setOpen] = React.useState(layout.defaultOpen !== false);


  return /*#__PURE__*/React.createElement("div", {
	id: "panel-".concat(layout.id),
	className: "sys-block"
  }, React.createElement("div", {
    className: "sys-head",
    onClick: function() { setOpen(!open); }
  }, React.createElement("span", { className: "sys-head-toggle" },
      React.createElement(Icon, { name: open ? "chevron-down" : "chevron-right" })),
    React.createElement("h3", { className: "sys-title" }, layout.icon && React.createElement(Icon, { name: layout.icon, className: "sys-title-icon" }), " ", layout.title),
    React.createElement("span", { className: "sys-head-sub" }, result.meta.description || layout.description),
    React.createElement("span", { className: "sys-head-count" }, result.stats.total, " pcs ", isBest ? React.createElement(Icon, { name: "best-badge" }) : "")),
  open && React.createElement("div", {
    className: "section-pad",
    style: { padding: "14px", display: "flex", flexDirection: "column", gap: 12 }
  },
    layout.renderControls && React.createElement(layout.renderControls, {
      state: layout.getState(),
      setState: layout.setState
    }),
    result.summaryRows.length > 0 && React.createElement(PanelSummary, {
      rows: result.summaryRows,
      hoveredType: hoveredType,
      setHoveredType: setHoveredType
    }),
    !result.valid && React.createElement("p", { className: "desc" }, "This layout leaves uncovered gaps and is excluded from best-layout scoring."),
    result.rows.length > 0 && React.createElement(LayoutVisualization, {
      result: result,
      hoveredType: hoveredType
    })));
}

function ControlPanel({ id, title, open, setOpen, children }) {
  return /*#__PURE__*/React.createElement("div", {
	id: id,
	className: "control-panel"
  }, React.createElement("div", {
    className: "panel-head",
    onClick: function() { setOpen(!open); }
  }, React.createElement("span", { className: "sys-head-toggle" },
      React.createElement(Icon, { name: open ? "chevron-down" : "chevron-right" })), title),
  open && React.createElement("div", { className: "panel-data" }, children));
}

function PreviewSection({ id, title, description, children }) {
  return /*#__PURE__*/React.createElement(React.Fragment, {
	key: id
  }, /*#__PURE__*/React.createElement("div", {
	className: "preview-head"
  }, /*#__PURE__*/React.createElement("h3", {
	className: "layout-section-title"
  }, title), /*#__PURE__*/React.createElement("p", {
	className: "layout-section-desc"
  }, description)), /*#__PURE__*/React.createElement("div", {
	className: "preview-data"
  }, children));
}

function NavButton({ page, item, navOpen, setPage, layoutOpen, setLayoutOpen }) {
  var isGroup = !item.parentId && PAGES.some(function(pg) { return pg.parentId === item.id; });
  var childActive = isGroup && PAGES.some(function(pg) { return pg.parentId === item.id && pg.id === page; });
  var isActive = isNavPageActive(page, item);
  var classes = ["nav-btn"];
  if (isActive) classes.push("active");
  if (isGroup) classes.push("nav-parent");
  if (childActive) classes.push("child-active");
  if (item.parentId) classes.push("nav-sub-btn");
  if (!navOpen) classes.push("nav-btn-icon-only");
  return /*#__PURE__*/React.createElement("button", {
	key: item.id,
	className: classes.join(" "),
	onClick: function onClick() {
	  if (isGroup) setLayoutOpen(function(o) { return !o; });
	  else setPage(item.id);
	},
	title: item.label
  },
  /*#__PURE__*/React.createElement("span", { className: "nav-btn-icon" }, React.createElement(Icon, { name: item.icon })),
  navOpen && /*#__PURE__*/React.createElement("span", { className: "nav-btn-label" }, item.label),
  isGroup && navOpen && /*#__PURE__*/React.createElement("span", {
	className: "nav-parent-chevron " + (layoutOpen ? "open" : "closed")
  }, React.createElement(Icon, { name: layoutOpen ? "chevron-down" : "chevron-right" })));
}

function SheetSymmetricLayout({ sym, setSym }) {
  const [hoveredType, setHoveredType] = React.useState(null);
  const [surfaceOpen, setSurfaceOpen] = React.useState(true);
  var controlPanels = [{
	id: "control-sym-surface",
	title: "Surface Area",
	open: surfaceOpen,
	setOpen: setSurfaceOpen,
	content: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-sym-room-width",
	  label: "Room width (mm)",
	  value: sym.roomWidth,
	  onChange: v => setSym(s => ({ ...s, roomWidth: v })),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-sym-panel-width",
	  label: "Panel width (mm)",
	  value: sym.panelWidth,
	  onChange: v => setSym(s => ({ ...s, panelWidth: v })),
	  step: 10
	}))
  }];
  var layout = {
	id: "s0",
	title: "Symmetric layout",
	description: "Equal edge pieces, full pieces in center",
	defaultOpen: true,
	renderControls: null,
	getState: function getState() {
	  return {};
	},
	setState: function setState() {},
	compute: function compute() {
	  return computeS0(sym);
	},
	includeInBest: false
  };
  var result = layout.compute();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
	id: "data-control",
	className: "data-control"
  }, controlPanels.map(function (panel) {
	return /*#__PURE__*/React.createElement(ControlPanel, {
	  key: panel.id,
	  id: panel.id,
	  title: panel.title,
	  open: panel.open,
	  setOpen: panel.setOpen
	}, panel.content);
  })), /*#__PURE__*/React.createElement("div", {
	id: "data-preview",
	className: "data-preview"
  }, /*#__PURE__*/React.createElement(LayoutPanel, {
	layout: layout,
	result: result,
	hoveredType: hoveredType,
	setHoveredType: setHoveredType,
	isBest: false
  })));
}

/* â”€â”€ Sheet 2 â”€â”€ */
function SheetSurfaceLayout({ sh, setSh }) {
  var W = sh.W,
	H = sh.H,
	PPi = sh.PPi,
	PLa = sh.PLa,
	offset = sh.offset,
	direction = sh.direction,
	minJ = sh.minJ,
	startOff = sh.startOff,
	s4Long = sh.s4Long,
	s4Short = sh.s4Short;
  const [hoveredType, setHoveredType] = React.useState(null);
  const [materialOpen, setMaterialOpen] = React.useState(true);
  const [surfaceOpen, setSurfaceOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(true);
  var set = function set(k) {
    return v => setSh(s => ({ ...s, [k]: v }));
  };
  var setS2PanelState = function(patch) {
    return setSh(function(s) { return Object.assign({}, s, { offset: patch.offset !== undefined ? patch.offset : s.offset }); });
  };
  var setS4PanelState = function(patch) {
    return setSh(function(s) { return Object.assign({}, s, { s4Long: patch.s4Long !== undefined ? patch.s4Long : s.s4Long, s4Short: patch.s4Short !== undefined ? patch.s4Short : s.s4Short }); });
  };
  var stateGetters = {
    s1: function() { return {}; },
    s2: function() { return { offset: offset }; },
    s3: function() { return {}; },
    s4: function() { return { s4Long: s4Long, s4Short: s4Short }; }
  };
  var stateSetters = {
    s1: function() {},
    s2: setS2PanelState,
    s3: function() {},
    s4: setS4PanelState
  };
  var layoutRegistry = LAYOUT_REGISTRY.map(function(sys) {
    return Object.assign({}, sys, {
      description: getDescription(sys.id, sh),
      defaultOpen: false,
      getState: stateGetters[sys.id] || function() { return {}; },
      setState: stateSetters[sys.id] || function() {},
      compute: function() { return sys.compute(sh); }
    });
  });
  var sectionRegistry = [{
	id: "pattern-layouts",
	title: "Pattern Layouts",
	description: "Compare row-based layouts that share the same surface and material settings.",
	layoutIds: ["s1", "s2", "s3", "s4"]
  }];
  var controlPanels = [{
	id: "control-material",
	title: "Material Specification",
	open: materialOpen,
	setOpen: setMaterialOpen,
	content: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-PPi",
	  label: "Length (mm)",
	  value: PPi,
	  onChange: set("PPi"),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-PLa",
	  label: "Width (mm)",
	  value: PLa,
	  onChange: set("PLa"),
	  step: 10
	}))
  }, {
	id: "control-surface",
	title: "Surface Area",
	open: surfaceOpen,
	setOpen: setSurfaceOpen,
	content: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-W",
	  label: "Width (mm)",
	  value: W,
	  onChange: set("W"),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-H",
	  label: "Height (mm)",
	  value: H,
	  onChange: set("H"),
	  step: 10
	}))
  }, {
	id: "control-settings",
	title: "Settings",
	open: settingsOpen,
	setOpen: setSettingsOpen,
	content: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
	  className: "ctrl-lbl"
	}, /*#__PURE__*/React.createElement("span", {
	  className: "ctrl-sublbl"
	}, "Direction"), /*#__PURE__*/React.createElement("div", {
	  id: "ctrl-direction",
	  className: "ctrl-btns"
	}, ["V", "H"].map(function (s) {
	  return /*#__PURE__*/React.createElement("button", {
		key: s,
		className: "ctrl-dir ".concat(direction === s ? "on" : ""),
		onClick: function onClick() {
		  return setSh(st => ({ ...st, direction: s }));
		}
	  }, s);
	}))), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-minJ",
	  label: "Min remainder (mm)",
	  value: minJ,
	  onChange: set("minJ"),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-startOff",
	  label: "R1 start point (mm)",
	  value: startOff,
	  onChange: v => setSh(s => ({ ...s, startOff: Math.min(v, Math.max(1, PPi) - 1) })),
	  step: 10,
	  min: 0
	}))
  }];
  var panelResults = layoutRegistry.map(function (layout) {
	return {
	  layout: layout,
	  result: layout.compute()
	};
  });
  var panelResultsById = panelResults.reduce(function (acc, panel) {
	acc[panel.layout.id] = panel;
	return acc;
  }, {});
  var comparableResults = panelResults.filter(function (panel) {
	return panel.layout.includeInBest && panel.result.valid;
  });
  var best = comparableResults.length ? Math.min(...comparableResults.map(p => p.result.stats.total)) : 0;
  var previewSections = sectionRegistry.map(function (section) {
	return {
	  id: section.id,
	  title: section.title,
	  description: section.description,
	  panels: section.layoutIds.map(function (layoutId) {
		var panel = panelResultsById[layoutId];
		if (!panel) return null;
		return /*#__PURE__*/React.createElement(LayoutPanel, {
		  key: panel.layout.id,
		  layout: panel.layout,
		  result: panel.result,
		  hoveredType: hoveredType,
		  setHoveredType: setHoveredType,
		  isBest: panel.layout.includeInBest && panel.result.valid && panel.result.stats.total === best
		});
	  }).filter(Boolean)
	};
  });

  if (W <= 0 || H <= 0 || PPi <= 0 || PLa <= 0) {
	return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
	  id: "data-control",
	  className: "data-control"
	}, /*#__PURE__*/React.createElement(SLabel, null, "Material Specification"), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-PPi",
	  label: "Length (mm)",
	  value: Math.max(1, PPi),
	  onChange: set("PPi"),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-PLa",
	  label: "Width (mm)",
	  value: Math.max(1, PLa),
	  onChange: set("PLa"),
	  step: 10
	}), /*#__PURE__*/React.createElement(SLabel, null, "Surface Area"), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-W",
	  label: "Width (mm)",
	  value: Math.max(1, W),
	  onChange: set("W"),
	  step: 10
	}), /*#__PURE__*/React.createElement(NumInput, {
	  id: "input-H",
	  label: "Height (mm)",
	  value: Math.max(1, H),
	  onChange: set("H"),
	  step: 10
	})), /*#__PURE__*/React.createElement("div", {
	  id: "data-preview",
	  className: "data-preview"
	}, /*#__PURE__*/React.createElement("p", {
	  className: "desc"
	}, "Select all input values - all must be greater than 0!")));
  }
  return /*#__PURE__*/React.createElement(
	React.Fragment,
	null,
	/*#__PURE__*/React.createElement("div", {
	  id: "data-control",
	  className: "data-control"
	}, controlPanels.map(function (panel) {
	  return /*#__PURE__*/React.createElement(ControlPanel, {
		key: panel.id,
		id: panel.id,
		title: panel.title,
		open: panel.open,
		setOpen: panel.setOpen
	  }, panel.content);
	})),
	/*#__PURE__*/React.createElement("div", {
	  id: "data-preview",
	  className: "data-preview"
	}, previewSections.map(function (section) {
	  return /*#__PURE__*/React.createElement(PreviewSection, {
		key: section.id,
		id: section.id,
		title: section.title,
		description: section.description
	  }, section.panels);
	}))
  );
}

/* â”€â”€ Sheet 3 â”€â”€ */
function SheetArea({ sh }) {
  var W = sh.W,
	H = sh.H,
	PPi = sh.PPi,
	PLa = sh.PLa;
  if (W <= 0 || H <= 0 || PPi <= 0 || PLa <= 0) {
	return /*#__PURE__*/React.createElement("div", {
	  className: "page-inner"
	}, /*#__PURE__*/React.createElement("p", {
	  className: "desc"
  }, "Select input values - all values must be greater than 0"));
  }
  var grossArea = W * H / 1e6,
	panelArea = PPi * PLa / 1e6;
  return /*#__PURE__*/React.createElement("div", {
	className: "page-inner"
  }, /*#__PURE__*/React.createElement("p", {
	className: "desc"
  }, "Linked from Layout page \u2014 change data in Layout view"), /*#__PURE__*/React.createElement(Section, {
	title: "Surface dimensions",
	bg: "#09101a"
  }, /*#__PURE__*/React.createElement(Row, {
	label: "Surface width",
	value: Math.max(0, W),
	unit: "mm"
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Surface height",
	value: Math.max(0, H),
	unit: "mm"
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Area",
	value: fmt.area(Math.max(0, grossArea)),
	unit: "m\xB2",
	hi: true
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Panel length",
	value: Math.max(0, PPi),
	unit: "mm"
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Panel width",
	value: Math.max(0, PLa),
	unit: "mm"
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Panel area",
	value: fmt.decimals(Math.max(0, panelArea), 4),
	unit: "m\xB2"
  }), /*#__PURE__*/React.createElement(Row, {
	label: "Panel direction",
	value: sh.direction
  })));
}

/* â”€â”€ Root â”€â”€ */
function isNavPageActive(page, pg) {
  var childActive = PAGES.some(function(p) { return p.parentId === pg.id && p.id === page; });
  return page === pg.id && !childActive;
}
function AppNav({ page, setPage, navOpen, setNavOpen, mobileMenuOpen, setMobileMenuOpen }) {
  var mobile = typeof window !== "undefined" && window.innerWidth <= 768;
  var showSubs = mobile ? mobileMenuOpen : navOpen;
  var [layoutOpen, setLayoutOpen] = React.useState(true);
  var childActive = PAGES.some(function(pg) { return pg.parentId === "layout" && pg.id === page; });
  React.useEffect(function() {
    if (childActive) setLayoutOpen(true);
  }, [page]);
  var navItems = PAGES.filter(function(pg) {
	if (pg.noNav) return false;
	if (!showSubs && pg.parentId) return false;
	if (pg.parentId === "layout" && !layoutOpen) return false;
	return true;
  });
  var handleToggle = function() {
    if (mobile) setMobileMenuOpen(function(o) { return !o; });
    else setNavOpen(function(o) { return !o; });
  };


  return /*#__PURE__*/React.createElement("div", {
	id: "page-side",
	className: "page-side"
  }, /*#__PURE__*/React.createElement("nav", {
	id: "side-navi",
	className: "nav".concat(!mobile && !navOpen ? " nav-collapsed" : "")
  }, /*#__PURE__*/React.createElement("div", {
	className: "nav-section nav-toggle"
  }, /*#__PURE__*/React.createElement(React.Fragment, null,
	  navOpen || mobile ? /*#__PURE__*/React.createElement("span", { className: "nav-toggle-label", onClick: function() { setPage("home"); } }, "HIVE") : null,
	  navOpen || mobile ? " " : null,
	  /*#__PURE__*/React.createElement("span", { className: "nav-menu-icon", onClick: handleToggle }, React.createElement(Icon, { name: "panel-left-close" }))
	)
  ), navItems.map(function(item) {
	return /*#__PURE__*/React.createElement(NavButton, {
	  key: item.id,
	  page: page,
	  item: item,
	  navOpen: mobile ? mobileMenuOpen : navOpen,
	  setPage: function(id) { setPage(id); if (mobile) setMobileMenuOpen(false); },
	  layoutOpen: layoutOpen,
	  setLayoutOpen: setLayoutOpen
	});
  })));
}
function SheetHome() {
  return React.createElement(React.Fragment, null,
    React.createElement("div", { id: "data-control", className: "data-control" }),
    React.createElement("div", { id: "data-preview", className: "data-preview" })
  );
}
function MainPageContent({ page, sh, setSh, sym, setSym }) {
  var pageMeta = PAGES.find(function (pg) {
	return pg.id === page;
  });
  var pageContent = {
	"home": /*#__PURE__*/React.createElement(SheetHome, null),
	"pattern-layout": /*#__PURE__*/React.createElement(SheetSurfaceLayout, {
	  sh: sh,
	  setSh: setSh
	}),
	"symmetric-layout": /*#__PURE__*/React.createElement(SheetSymmetricLayout, {
	  sym: sym,
	  setSym: setSym
	})
  };
  if (page === "home") {
	return /*#__PURE__*/React.createElement("div", { id: "main-data", className: "main-data" }, pageContent["home"]);
  }
  if (pageMeta && page !== "area") {
	var contentToShow = pageContent[page] || pageContent["pattern-layout"];
	return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
	  id: "main-head",
	  className: "main-head"
	}, /*#__PURE__*/React.createElement("h2", {
	  className: "title"
	}, pageMeta.title || pageMeta.label), /*#__PURE__*/React.createElement("p", {
	  className: "desc"
	}, pageMeta.desc)), contentToShow && /*#__PURE__*/React.createElement("div", {
	  id: "main-data",
	  className: "main-data"
	}, contentToShow));
  }
  if (page === "area") {
	return /*#__PURE__*/React.createElement("div", {
	  id: "page-area",
	  className: "page-scroll"
	}, /*#__PURE__*/React.createElement("h2", {
	  className: "title"
	}, pageMeta && pageMeta.title || "Area"), /*#__PURE__*/React.createElement(SheetArea, {
	  sh: sh
	}));
  }
  return null;
}
function App() {
  const [page, setPage] = useState("home");
  const isMobile = () => typeof window !== "undefined" && window.innerWidth <= 768;
  const [navOpen, setNavOpen] = React.useState(!isMobile());
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  React.useEffect(function() {
    var handler = function() { if (!isMobile()) setMobileMenuOpen(false); };
    window.addEventListener("resize", handler);
    return function() { window.removeEventListener("resize", handler); };
  }, []);
  const [sh, setSh] = useState({
	  W: 5600,
	  H: 2500,
	  PPi: 2400,
	  PLa: 300,
	  offset: 0.5,
	  direction: "H",
	  minJ: 100,
	  startOff: 0,
	  s4Long: 2400,
	  s4Short: 1200
	});
  const [sym, setSym] = useState({
	  roomWidth: 2500,
	  panelWidth: 300
	});

  return /*#__PURE__*/React.createElement("div", {
	id: "app",
	className: "app"
  }, /*#__PURE__*/React.createElement("div", {
	id: "app-head",
	className: "app-head"
  }, /*#__PURE__*/React.createElement("svg", {className: "header-logo", id: "Layer_1", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 410.86 63.9"}, /*#__PURE__*/React.createElement("defs", null,
  /*#__PURE__*/React.createElement("linearGradient", {id: "logo-grad", x1: "0%", y1: "0%", x2: "100%", y2: "0%"},
    /*#__PURE__*/React.createElement("stop", {offset: "0%", style: {stopColor: "var(--color-primary)", stopOpacity: "0.6"}}),
    /*#__PURE__*/React.createElement("stop", {offset: "100%", style: {stopColor: "var(--color-primary)", stopOpacity: "1"}})
  ),
  /*#__PURE__*/React.createElement("style", null, ".cls-1 { fill: url(#logo-grad); stroke: var(--color-primary); stroke-miterlimit: 10; stroke-width: .25px; }")
), /*#__PURE__*/React.createElement("polygon", {"className": "cls-1", "points": "139.77 17.47 124.34 36.01 109.47 17.34 109.33 45.2 103.74 45.47 103.78 1.73 124.43 26.68 145.78 1.24 146.04 45.35 140.11 45.17 139.77 17.47"}), /*#__PURE__*/React.createElement("path", {"className": "cls-1", "d": "M298.6,23.64c0,12.05-9.77,21.82-21.82,21.82s-21.82-9.77-21.82-21.82,9.77-21.82,21.82-21.82,21.82,9.77,21.82,21.82ZM292.72,23.54c0-8.83-7.16-15.99-15.99-15.99s-15.99,7.16-15.99,15.99,7.16,15.99,15.99,15.99,15.99-7.16,15.99-15.99Z"}), /*#__PURE__*/React.createElement("polygon", {"className": "cls-1", "points": "34.23 46.06 5.83 15.34 5.61 45.44 .13 45.39 .22 .83 28.71 31.46 28.84 2.64 34.28 2.68 34.23 46.06"}), /*#__PURE__*/React.createElement("path", {"className": "cls-1", "d": "M77.95,20.88c.63,1.15.57,3.5.25,5.35l-15.41.14.04,13.59h20.13c.37,1.36.45,3.51.35,5.38l-26.47-.07-.04-42.69,25.74-.05.05,5.46-19.91.03.13,12.72c2.58-.23,4.57-.29,7.08-.19l8.08.33Z"}), /*#__PURE__*/React.createElement("path", {"className": "cls-1", "d": "M188.78,20.77l.05,5.6-15.54-.03-.02,13.58,19.81.04.23,5.41-25.52.02-.06-42.84,25.22-.02-.04,5.5-19.6.02.05,12.67c3.4-.19,5.96-.28,9.01-.18l6.42.22Z"}), /*#__PURE__*/React.createElement("polygon", {"className": "cls-1", "points": "353.08 45.8 323.34 14.85 323.22 45.43 317.7 45.27 317.73 .31 347.49 31.92 347.38 2.79 353.21 2.64 353.08 45.8"}), /*#__PURE__*/React.createElement("polygon", {"className": "cls-1", "points": "391.02 14.13 377.36 45.29 370.64 45.12 391.01 .77 410.67 45.08 404.24 45.3 391.02 14.13"}), /*#__PURE__*/React.createElement("polygon", {"className": "cls-1", "points": "228.58 45.3 222.92 45.41 222.92 8.13 210.46 8.01 210.74 2.51 240.7 2.52 240.71 8.06 228.79 8.06 228.58 45.3"}), /*#__PURE__*/React.createElement("rect", {"className": "cls-1", "x": ".13", "y": "57.59", "width": "174.77", "height": "1.36"}), /*#__PURE__*/React.createElement("rect", {"className": "cls-1", "x": "235.9", "y": "56.91", "width": "174.77", "height": "1.36"}))), /*#__PURE__*/React.createElement("div", {
	id: "app-page",
	className: "app-page"
  }, /*#__PURE__*/React.createElement(AppNav, {
	page: page,
	setPage: setPage,
	navOpen: navOpen,
	setNavOpen: setNavOpen,
	mobileMenuOpen: mobileMenuOpen,
	setMobileMenuOpen: setMobileMenuOpen
  }), /*#__PURE__*/React.createElement("div", {
	id: "page-main",
	className: "page-main"
  }, /*#__PURE__*/React.createElement(MainPageContent, {
	page: page,
	sh: sh,
	setSh: setSh,
	sym: sym,
	setSym: setSym
  }))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));