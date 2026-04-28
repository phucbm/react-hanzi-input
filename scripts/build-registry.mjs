import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function read(relPath) {
  return readFileSync(resolve(root, relPath), 'utf8')
}

function write(relPath, data) {
  const full = resolve(root, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n')
  console.log(`✓ ${relPath}`)
}

const types = read('src/types.ts')
const recognize = read('src/recognize.ts')
const hanziPad = read('src/HanziPad.tsx')
const hanziInput = read('src/HanziInput.tsx')

write('demo/public/r/hanzi-input.json', {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'hanzi-input',
  type: 'registry:component',
  title: 'Hanzi Input',
  description: 'Chinese handwriting input — canvas pad, stroke capture, and candidate picker powered by Google IME.',
  files: [
    { path: 'components/hanzi/types.ts',        type: 'registry:file', target: 'components/hanzi/types.ts',        content: types },
    { path: 'components/hanzi/recognize.ts',    type: 'registry:file', target: 'components/hanzi/recognize.ts',    content: recognize },
    { path: 'components/hanzi/HanziPad.tsx',    type: 'registry:file', target: 'components/hanzi/HanziPad.tsx',    content: hanziPad },
    { path: 'components/hanzi/HanziInput.tsx',  type: 'registry:file', target: 'components/hanzi/HanziInput.tsx',  content: hanziInput },
  ],
})

write('demo/public/r/hanzi-pad.json', {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'hanzi-pad',
  type: 'registry:component',
  title: 'Hanzi Pad',
  description: 'Low-level handwriting canvas — exposes getStrokes(), clear(), undo(), toDataURL() via ref.',
  files: [
    { path: 'components/hanzi/types.ts',      type: 'registry:file', target: 'components/hanzi/types.ts',      content: types },
    { path: 'components/hanzi/HanziPad.tsx',  type: 'registry:file', target: 'components/hanzi/HanziPad.tsx',  content: hanziPad },
  ],
})
