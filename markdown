#!/usr/bin/env node

// Preprocess an .md file if its frontmatter has 'preprocessor'
// attribute. Anything else in the .md preserved as is. Can be used as
// a simple linter.

let lib = require('./lib/cli')

let argv = process.argv.slice(2)
if (argv.length !== 1) lib.errx(1, 'Usage:', lib.prog, 'file.md')

let mp = new lib.MarkdownParser(argv[0]), body
try {
    mp.front_matter()
    body = mp.preprocess()
} catch (e) {
    lib.errx(1, e.message)
}

console.log("---")
console.log(mp.parse().frontmatter)
console.log("---\n")
console.log(body)
