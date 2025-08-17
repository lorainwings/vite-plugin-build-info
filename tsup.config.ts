import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    watermark: 'src/watermark/standalone.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  treeshake: true,
  external: ['vite'],
  noExternal: ['simple-git'],
  outDir: 'dist',
  onSuccess: 'node scripts/post-build.js'
})
