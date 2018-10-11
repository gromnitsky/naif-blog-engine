// node only

let path = require('path')
let crypto = require('crypto')
let fs = require('fs')
let execSync = require('child_process').execSync
let front_matter = require('front-matter')
let marked = require('marked')

exports.prog = path.basename(process.argv[1])
exports.errx = function(code, ...args) {
    console.error(`${exports.prog} error:`, ...args)
    process.exit(code)
}

exports.mtime = function(file) { return fs.statSync(file).mtime.getTime() }
exports.json = function(f) { return JSON.parse(fs.readFileSync(f).toString()) }

exports.is_str_empty = function(s) {
    return !exports.is_str(s) || s.trim().length === 0
}

exports.is_str = function(s) {
    return Object.prototype.toString.call(s) === "[object String]"
}

exports.MarkdownParser = class {
    constructor(file) { this.file = file }
    parse() {
	return this.md = this.md || front_matter(fs.readFileSync(this.file).toString())
    }

    front_matter(required_attrs = []) {
	let fm = this.parse().attributes
	let attrs = {}
	Object.keys(fm).map( k => { attrs[k.toLowerCase()] = fm[k] })

	let arrarify = str => {
	    if (!str) return []
	    if (Array.isArray(str)) return str
	    return str.split(/,+/).map(v => v.replace(/\s+/, ' ').trim())
	}

	attrs.authors = arrarify(attrs.authors)
	attrs.tags = arrarify(attrs.tags).map( v => v.toLowerCase())
	attrs.mtime = exports.mtime(this.file)

	for (let val of required_attrs) {
	    if (!val.fn(attrs[val.attr]))
		throw new Error(`${this.file}: no ${val.attr}`)
	}

	if (exports.is_str_empty(attrs.subject)) attrs.subject = 'Untitled'
	if (!attrs.authors.length) attrs.authors.push('anonymous')
	if (!attrs.tags.length) attrs.tags.push('untagged')

	return attrs
    }

    body(opt) {
	this.parse()
	return marked(this.preprocess(), opt)
    }

    preprocess() {
	if (!this.md.attributes.preprocessor) return this.md.body
	let dir_save = process.cwd()
	process.chdir(path.dirname(this.file))
	let r
	try {
	    r = execSync(this.md.attributes.preprocessor,
			 {input: this.md.body}).toString()
	} finally {
	    process.chdir(dir_save)
	}
	return r
    }
}

exports.md5 = function(data) {
    return crypto.createHash('md5').update(data).digest('hex')
}
