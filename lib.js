let fs = require('fs')
let front_matter = require('front-matter')
let marked = require('marked')

exports.mtime = function(file) { return fs.statSync(file).mtime.getTime() }

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

	attrs.authors = arrarify(attrs.authors).map( v => v.toLowerCase())
	attrs.tags = arrarify(attrs.tags).map( v => v.toLowerCase())
	attrs.mtime = exports.mtime(this.file)

	for (let val of required_attrs) {
	    if (!val.fn(attrs[val.attr]))
		throw new Error(`${this.file}: no ${val.attr}`)
	}

	if (exports.is_str_empty(attrs.subject)) attrs.subject = 'Untitled'

	return attrs
    }
}
