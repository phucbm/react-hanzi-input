# react-hanzi-input

[![npm version](https://img.shields.io/npm/v/react-hanzi-input?style=flat-square)](https://www.npmjs.com/package/react-hanzi-input)
[![license](https://img.shields.io/npm/l/react-hanzi-input?style=flat-square)](LICENSE)

Chinese handwriting input component for React — canvas pad, stroke capture, and candidate picker powered by Google IME.

**[Live Demo](https://phucbm.github.io/react-hanzi-input)**

## Install

```sh
pnpm add react-hanzi-input
```

## Quick start

### 1. Add the API proxy route (Next.js App Router)

```ts
// app/api/handwriting/route.ts
import { createHandwritingRoute } from 'react-hanzi-input'
export const { POST } = createHandwritingRoute()
```

### 2. Use the component

```tsx
import { HanziInput } from 'react-hanzi-input'

export default function Page() {
  const [text, setText] = useState('')
  return (
    <HanziInput
      proxyUrl="/api/handwriting"
      onSelect={(char) => setText(prev => prev + char)}
    />
  )
}
```

## API

### `<HanziInput>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `(char: string) => void` | required | Called when user picks a candidate |
| `proxyUrl` | `string` | required | Your API proxy URL |
| `language` | `string` | `'zh-CN'` | IME language code |
| `limit` | `number` | `8` | Max candidates |
| `width` | `number` | `280` | Canvas width |
| `height` | `number` | `280` | Canvas height |
| `showUndo` | `boolean` | `true` | Show undo button |
| `showClear` | `boolean` | `true` | Show clear button |
| `className` | `string` | — | Wrapper class |

### `<HanziPad>` (ref-based)

Low-level canvas component. Exposes `getStrokes()`, `clear()`, `undo()`, `toDataURL()` via ref.

### `recognizeDirect(strokes, options)`

Call the Google IME API directly — useful in demos or server contexts.

### `recognize(strokes, options)`

Call via your proxy URL (avoids CORS in browser).

### `createHandwritingRoute()`

Returns a `{ POST }` handler compatible with Next.js App Router and any Web Fetch API handler.

## Credits

Inspired by [icelam/chinese-handwriting-recognition](https://github.com/icelam/chinese-handwriting-recognition).

## License

MIT
