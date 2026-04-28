import { forwardRef, useRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var HanziPad = forwardRef(
  function HanziPad2({ onStrokesChange, width = 280, height = 280, strokeColor = "#1a1a1a", lineWidth = 3, background = "#ffffff", showGrid = true, gridLines = 2, gridColor = "#d1d5db", className, style }, ref) {
    const canvasRef = useRef(null);
    const strokesRef = useRef([]);
    const currentRef = useRef(null);
    const drawingRef = useRef(false);
    const getCtx = () => {
      var _a, _b;
      return (_b = (_a = canvasRef.current) == null ? void 0 : _a.getContext("2d")) != null ? _b : null;
    };
    const drawGrid = useCallback((ctx) => {
      if (!showGrid) return;
      const fractions = {
        1: [0.5],
        2: [1 / 3, 2 / 3],
        3: [0.25, 0.5, 0.75]
      };
      const splits = fractions[gridLines];
      const drawLines = (fs, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (const f of fs) {
          ctx.moveTo(width * f, 0);
          ctx.lineTo(width * f, height);
          ctx.moveTo(0, height * f);
          ctx.lineTo(width, height * f);
        }
        ctx.stroke();
      };
      ctx.save();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      if (gridLines === 3) {
        drawLines([0.25, 0.75], 0.35);
        drawLines([0.5], 1);
      } else {
        drawLines(splits, 1);
      }
      ctx.setLineDash([]);
      ctx.restore();
    }, [width, height, showGrid, gridLines, gridColor]);
    const redraw = useCallback(() => {
      const ctx = getCtx();
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const stroke of strokesRef.current) {
        if (stroke.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
        ctx.stroke();
      }
    }, [width, height, strokeColor, lineWidth, drawGrid]);
    useEffect(() => {
      const ctx = getCtx();
      if (ctx) drawGrid(ctx);
    }, [drawGrid]);
    const getPoint = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top), t: Date.now() };
    };
    const onPointerDown = useCallback((e) => {
      e.preventDefault();
      drawingRef.current = true;
      const p = getPoint(e);
      currentRef.current = [p];
      const ctx = getCtx();
      if (!ctx) return;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }, [strokeColor, lineWidth]);
    const onPointerMove = useCallback((e) => {
      if (!drawingRef.current || !currentRef.current) return;
      const p = getPoint(e);
      currentRef.current.push(p);
      const ctx = getCtx();
      if (!ctx) return;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }, []);
    const onPointerUp = useCallback(() => {
      if (!drawingRef.current || !currentRef.current) return;
      drawingRef.current = false;
      strokesRef.current = [...strokesRef.current, currentRef.current];
      currentRef.current = null;
      onStrokesChange == null ? void 0 : onStrokesChange(strokesRef.current);
    }, [onStrokesChange]);
    useImperativeHandle(ref, () => ({
      getStrokes: () => [...strokesRef.current],
      clear: () => {
        strokesRef.current = [];
        currentRef.current = null;
        drawingRef.current = false;
        const ctx = getCtx();
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          drawGrid(ctx);
        }
        onStrokesChange == null ? void 0 : onStrokesChange([]);
      },
      undo: () => {
        strokesRef.current = strokesRef.current.slice(0, -1);
        redraw();
        onStrokesChange == null ? void 0 : onStrokesChange(strokesRef.current);
      },
      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const off = document.createElement("canvas");
        off.width = canvas.width;
        off.height = canvas.height;
        const ctx = off.getContext("2d");
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, off.width, off.height);
        ctx.drawImage(canvas, 0, 0);
        return off.toDataURL("image/png");
      }
    }));
    return /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        width,
        height,
        className,
        style: __spreadValues({ background, touchAction: "none", cursor: "crosshair", display: "block" }, style),
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerLeave: onPointerUp
      }
    );
  }
);

// src/recognize.ts
var GOOGLE_IME_URL = "https://inputtools.google.com/request?ime=handwriting&app=gws&cs=1&itc=zh-t-i0-handwrit";
function strokesToInk(strokes) {
  return strokes.map((stroke) => [
    stroke.map((p) => p.x),
    stroke.map((p) => p.y),
    stroke.map((p) => p.t)
  ]);
}
async function recognizeDirect(strokes, options = {}) {
  var _a, _b, _c;
  const { language = "zh-CN", limit = 8, width = 300, height = 300 } = options;
  const url = `${GOOGLE_IME_URL}&num=${limit}`;
  const payload = {
    device: typeof navigator !== "undefined" ? navigator.userAgent : "Node.js",
    options: "enable_pre_space",
    requests: [{
      writing_guide: { writing_area_width: width, writing_area_height: height },
      ink: strokesToInk(strokes),
      language
    }]
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Google IME API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const characters = (_c = (_b = (_a = data == null ? void 0 : data[1]) == null ? void 0 : _a[0]) == null ? void 0 : _b[1]) != null ? _c : [];
  return characters.map((character, index) => ({
    character,
    score: Math.max(0, 1 - index * (1 / characters.length))
  }));
}
async function recognize(strokes, options) {
  const _a = options, { proxyUrl } = _a, rest = __objRest(_a, ["proxyUrl"]);
  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strokes, options: rest })
  });
  if (!res.ok) throw new Error(`Proxy error ${res.status}: ${await res.text()}`);
  return res.json();
}
function createHandwritingRoute() {
  return {
    POST: async (req) => {
      try {
        const { strokes, options = {} } = await req.json();
        if (!Array.isArray(strokes)) return Response.json({ error: "strokes must be an array" }, { status: 400 });
        const candidates = await recognizeDirect(strokes, options);
        return Response.json(candidates);
      } catch (err) {
        return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
    }
  };
}
function HanziInput({
  onSelect,
  proxyUrl,
  language = "zh-CN",
  limit = 8,
  width = 280,
  height = 280,
  showUndo = true,
  showClear = true,
  background,
  showGrid = true,
  gridLines,
  gridColor,
  className
}) {
  const padRef = useRef(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const handleStrokesChange = useCallback((strokes) => setStrokeCount(strokes.length), []);
  const handleRecognize = useCallback(async () => {
    var _a, _b;
    const strokes = (_b = (_a = padRef.current) == null ? void 0 : _a.getStrokes()) != null ? _b : [];
    if (!strokes.length) return;
    setLoading(true);
    setError(null);
    setCandidates([]);
    try {
      setCandidates(await recognize(strokes, { proxyUrl, language, limit, width, height }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [proxyUrl, language, limit, width, height]);
  const handleClear = useCallback(() => {
    var _a;
    (_a = padRef.current) == null ? void 0 : _a.clear();
    setCandidates([]);
    setError(null);
    setStrokeCount(0);
  }, []);
  const handleUndo = useCallback(() => {
    var _a;
    (_a = padRef.current) == null ? void 0 : _a.undo();
    setStrokeCount((prev) => Math.max(0, prev - 1));
  }, []);
  const handleSelect = useCallback((character) => {
    onSelect(character);
    handleClear();
  }, [onSelect, handleClear]);
  const btn = { padding: "4px 10px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#111" };
  return /* @__PURE__ */ jsxs("div", { className, style: { display: "inline-flex", flexDirection: "column", gap: 8 }, children: [
    /* @__PURE__ */ jsx(
      HanziPad,
      {
        ref: padRef,
        width,
        height,
        onStrokesChange: handleStrokesChange,
        background,
        showGrid,
        gridLines,
        gridColor,
        style: { border: "1px solid #d1d5db", borderRadius: 8 }
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6 }, children: [
      showUndo && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleUndo, disabled: strokeCount === 0, style: btn, children: "Undo" }),
      showClear && /* @__PURE__ */ jsx("button", { type: "button", onClick: handleClear, disabled: strokeCount === 0, style: btn, children: "Clear" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: handleRecognize, disabled: strokeCount === 0 || loading, style: __spreadProps(__spreadValues({}, btn), { marginLeft: "auto", fontWeight: 500 }), children: loading ? "\u2026" : "Recognize" })
    ] }),
    error && /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 12, color: "#dc2626" }, children: error }),
    candidates.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: candidates.map((c, i) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => handleSelect(c.character),
        style: { fontSize: 26, padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", lineHeight: 1.2, color: "#111" },
        children: c.character
      },
      `${c.character}-${i}`
    )) })
  ] });
}

export { HanziInput, HanziPad, createHandwritingRoute, recognize, recognizeDirect };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map