#!/usr/bin/env node

import { build } from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

build({
    plugins: [NodeModulesPolyfillPlugin()],
    entryPoints: [process.argv[2] || usage()],
    outfile: process.argv[3] || usage(),
    bundle: true,
    target: ['es2020'],
    sourcemap: true,
    format: 'esm',
    mainFields: ['module', 'main'],
    treeShaking: false,
})

function usage() {
    console.warn('Usage: esbuild.mjs input.js output.js')
    process.exit(1)
}
