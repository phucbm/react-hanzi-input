import { StrictMode, useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HanziPad, recognizeDirect } from '../../src/index'
import type { Candidate, HanziPadHandle, Stroke } from '../../src/types'

const LANGUAGES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
]

const CODE_PROXY = `// app/api/handwriting/route.ts
import { createHandwritingRoute } from 'react-hanzi-input'
export const { POST } = createHandwritingRoute()`

const CODE_USAGE = `import { HanziInput } from 'react-hanzi-input'

<HanziInput
  proxyUrl="/api/handwriting"
  onSelect={(char) => setOutput(prev => prev + char)}
/>`

function CodeBlock({ code, lang = 'ts' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'var(--code-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
        <span>{lang}</span>
        <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--accent)' : 'var(--muted)', fontSize: 12, padding: '2px 6px' }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '14px 16px', fontSize: 13, lineHeight: 1.6, overflowX: 'auto', color: 'var(--fg)' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function App() {
  const padRef = useRef<HanziPadHandle>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [strokeCount, setStrokeCount] = useState(0)
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('zh-CN')
  const limit = 8

  const handleStrokesChange = useCallback((strokes: Stroke[]) => {
    setStrokeCount(strokes.length)
  }, [])

  const handleRecognize = useCallback(async () => {
    const strokes = padRef.current?.getStrokes() ?? []
    if (!strokes.length) return
    setLoading(true)
    setError(null)
    setCandidates([])
    try {
      const results = await recognizeDirect(strokes, { language, limit, width: 280, height: 280 })
      setCandidates(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [language, limit])

  const handleClear = useCallback(() => {
    padRef.current?.clear()
    setCandidates([])
    setError(null)
    setStrokeCount(0)
  }, [])

  const handleUndo = useCallback(() => {
    padRef.current?.undo()
    setStrokeCount(prev => Math.max(0, prev - 1))
  }, [])

  const handleSelect = useCallback((character: string) => {
    setOutput(prev => prev + character)
    handleClear()
  }, [handleClear])

  return (
    <>
      <style>{`
        :root {
          --bg: #f9fafb;
          --surface: #ffffff;
          --border: #e5e7eb;
          --fg: #111827;
          --muted: #6b7280;
          --accent: #4f46e5;
          --accent-hover: #4338ca;
          --code-bg: #1e1e2e;
          --btn-bg: #ffffff;
          --btn-hover: #f3f4f6;
          --danger: #dc2626;
          --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0f0f13;
            --surface: #1a1a24;
            --border: #2d2d3d;
            --fg: #f3f4f6;
            --muted: #9ca3af;
            --accent: #818cf8;
            --accent-hover: #a5b4fc;
            --code-bg: #12121a;
            --btn-bg: #1a1a24;
            --btn-hover: #252533;
            --danger: #f87171;
            --shadow: 0 1px 3px rgba(0,0,0,.4);
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--fg); min-height: 100vh; }
        button { font-family: inherit; }
        .btn {
          padding: 6px 14px; font-size: 13px; border: 1px solid var(--border);
          border-radius: 7px; background: var(--btn-bg); cursor: pointer; color: var(--fg);
          transition: background .15s, border-color .15s;
        }
        .btn:hover:not(:disabled) { background: var(--btn-hover); }
        .btn:disabled { opacity: .4; cursor: not-allowed; }
        .btn-primary {
          background: var(--accent); color: #fff; border-color: transparent;
          font-weight: 600;
        }
        .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
        .char-btn {
          font-size: 28px; padding: 6px 14px; border: 1px solid var(--border);
          border-radius: 8px; background: var(--btn-bg); cursor: pointer; color: var(--fg);
          line-height: 1.2; transition: background .12s, border-color .12s, transform .1s;
        }
        .char-btn:hover { background: var(--btn-hover); border-color: var(--accent); transform: scale(1.08); }
        select {
          padding: 6px 10px; font-size: 13px; border: 1px solid var(--border);
          border-radius: 7px; background: var(--btn-bg); color: var(--fg); cursor: pointer;
          font-family: inherit;
        }
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }
        .badge {
          display: inline-block; padding: 2px 8px; border-radius: 9999px;
          font-size: 11px; font-weight: 600; background: var(--border); color: var(--muted);
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>react-hanzi-input</h1>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>v0.1.0</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <a href="https://www.npmjs.com/package/react-hanzi-input" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/npm/v/react-hanzi-input?style=flat-square&colorA=18181b&colorB=4f46e5" alt="npm version" style={{ height: 20, display: 'block' }} />
            </a>
            <a href="https://github.com/phucbm/react-hanzi-input" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--fg)', fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Hero */}
        <section style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Chinese handwriting input for React — draw strokes on a canvas pad, get character candidates from Google IME, insert into any text field.
          </p>
        </section>

        {/* Interactive Demo */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, marginBottom: 20, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Demo</h2>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Pad + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: 'var(--muted)' }}>Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <HanziPad
                ref={padRef}
                width={280}
                height={280}
                onStrokesChange={handleStrokesChange}
                strokeColor="var(--fg)"
                background="var(--surface)"
                style={{ border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow)' }}
              />

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn" onClick={handleUndo} disabled={strokeCount === 0}>Undo</button>
                <button className="btn" onClick={handleClear} disabled={strokeCount === 0}>Clear</button>
                <button className="btn btn-primary" onClick={handleRecognize} disabled={strokeCount === 0 || loading} style={{ marginLeft: 'auto' }}>
                  {loading ? '…' : 'Recognize'}
                </button>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: 'var(--danger)', lineHeight: 1.5 }}>{error}</p>
              )}
            </div>

            {/* Candidates + output */}
            <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Candidates */}
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Candidates {candidates.length > 0 && `(${candidates.length})`}
                </p>
                {candidates.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {candidates.map((c, i) => (
                      <button key={`${c.character}-${i}`} className="char-btn" onClick={() => handleSelect(c.character)}>
                        {c.character}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px 16px', border: '1px dashed var(--border)', borderRadius: 8, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    {strokeCount === 0 ? 'Draw a character, then click Recognize' : 'Click Recognize to get candidates'}
                  </div>
                )}
              </div>

              {/* Output */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</p>
                  {output && (
                    <button className="btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => setOutput('')}>Clear</button>
                  )}
                </div>
                <div style={{
                  minHeight: 80, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: 28, lineHeight: 1.4, background: 'var(--surface)', letterSpacing: '0.05em',
                  color: output ? 'var(--fg)' : 'var(--muted)', boxShadow: 'var(--shadow)',
                  wordBreak: 'break-all'
                }}>
                  {output || <span style={{ fontSize: 14 }}>Selected characters appear here…</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code snippets */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, marginBottom: 20, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Getting Started</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>1. Install</p>
              <CodeBlock lang="sh" code="npm install react-hanzi-input" />
            </div>
            <div>
              <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>2. Add the API route (Next.js App Router)</p>
              <CodeBlock lang="ts" code={CODE_PROXY} />
            </div>
            <div>
              <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>3. Use the component</p>
              <CodeBlock lang="tsx" code={CODE_USAGE} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 style={{ fontSize: 12, fontWeight: 600, marginBottom: 20, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              ['Canvas drawing pad', 'Pointer events — works with mouse, touch, and stylus'],
              ['Google IME recognition', 'Powered by Google Handwriting Input API'],
              ['Multi-language', 'zh-CN, zh-TW, Japanese, Korean, and more'],
              ['Zero dependencies', 'Only peer dep is React ≥ 17'],
              ['TypeScript', 'Full type definitions included'],
              ['Proxy helper', 'createHandwritingRoute() for Next.js / any fetch handler'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
        <a href="https://github.com/phucbm/react-hanzi-input" target="_blank" rel="noopener noreferrer">phucbm/react-hanzi-input</a>
        {' · '}MIT License
      </footer>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
