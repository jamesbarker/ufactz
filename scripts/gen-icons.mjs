// Rasterizes public/icon.svg into the PNG sizes the PWA manifest needs.
// Run with: npm run icons
import sharp from 'sharp'
import { readFile, writeFile, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const svg = await readFile(join(pub, 'icon.svg'))

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  const png = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 15, g: 16, b: 32, alpha: 1 } })
    .png()
    .toBuffer()
  await writeFile(join(pub, file), png)
  console.log('wrote', file)
}

// favicon: just reuse the SVG
await copyFile(join(pub, 'icon.svg'), join(pub, 'favicon.svg'))
console.log('wrote favicon.svg')
