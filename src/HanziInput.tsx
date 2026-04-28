import {useCallback, useRef, useState} from 'react'
import {HanziPad} from './HanziPad'
import {recognize} from './recognize'
import type {Candidate, HanziInputProps, HanziPadHandle, Stroke} from './types'

export function HanziInput({
                               onSelect,
                               proxyUrl,
                               language = 'zh-CN',
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
                           }: HanziInputProps) {
  const padRef = useRef<HanziPadHandle>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [strokeCount, setStrokeCount] = useState(0)

  const handleStrokesChange = useCallback((strokes: Stroke[]) => setStrokeCount(strokes.length), [])

  const handleRecognize = useCallback(async () => {
    const strokes = padRef.current?.getStrokes() ?? []
    if (!strokes.length) return
    setLoading(true)
    setError(null)
    setCandidates([])
    try {
      setCandidates(await recognize(strokes, { proxyUrl, language, limit, width, height }))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [proxyUrl, language, limit, width, height])

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
    onSelect(character)
    handleClear()
  }, [onSelect, handleClear])

  const btn: React.CSSProperties = { padding: '4px 10px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#111' }

  return (
    <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', gap: 8 }}>
        <HanziPad ref={padRef} width={width} height={height} onStrokesChange={handleStrokesChange}
                  background={background} showGrid={showGrid} gridLines={gridLines} gridColor={gridColor}
                  style={{border: '1px solid #d1d5db', borderRadius: 8}}/>
      <div style={{ display: 'flex', gap: 6 }}>
        {showUndo && <button type="button" onClick={handleUndo} disabled={strokeCount === 0} style={btn}>Undo</button>}
        {showClear && <button type="button" onClick={handleClear} disabled={strokeCount === 0} style={btn}>Clear</button>}
        <button type="button" onClick={handleRecognize} disabled={strokeCount === 0 || loading} style={{ ...btn, marginLeft: 'auto', fontWeight: 500 }}>
          {loading ? '…' : 'Recognize'}
        </button>
      </div>
      {error && <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>}
      {candidates.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {candidates.map((c, i) => (
            <button key={`${c.character}-${i}`} type="button" onClick={() => handleSelect(c.character)}
              style={{ fontSize: 26, padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', lineHeight: 1.2, color: '#111' }}>
              {c.character}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
