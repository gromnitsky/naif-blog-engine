let crypto = require('crypto')
let fs = require('fs')
let front_matter = require('front-matter')
let marked = require('marked')

exports.mtime = function(file) { return fs.statSync(file).mtime.getTime() }
exports.is_post = function(file) { return /^\d{4}\/\d{2}\/\d{2}\b/.test(file) }

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
	return marked(this.md.body, opt)
    }
}

exports.index_group_by = function(index, prop) {
    let articles = index.posts.concat(index.pages)
    return articles.reduce( (result, article) => {
	article[prop].forEach( val => {
	    if (!Array.isArray(result[val])) result[val] = []
	    result[val].push(article)
	})
	return result
    }, {})
}

exports.md5 = function(data) {
    return crypto.createHash('md5').update(data).digest('hex')
}

// Everybody loves trees!
exports.TNode = class {
    constructor(name, payload, parent, kids) {
	if (!name) throw new Error("TNode requires a `name` arg")
	this.name = name
	this.payload = payload
	this.parent = parent
	this.kids = kids || []
	this.id = Math.random()	// FIXME
    }

    indexOf(name) {
	if (!name) return -1
	for (let idx = 0; idx < this.kids.length; ++idx) {
	    if (name === this.kids[idx].name) return idx
	}
	return -1
    }

    // Example: tnode.insert(['2100', '01', '02', 'omglol'], {hi: "there"})
    insert(npath, payload) {
	if (!Array.isArray(npath) || !npath.length) return

	let idx = this.indexOf(npath[0])
	if (idx !== -1) {
	    let parent = this.kids[idx]
	    // RECURSION!
	    parent.insert(npath.slice(1), payload)
	    return
	}

	let parent = this
	let kid = new exports.TNode(npath[0],
				    npath.length === 1 ? payload : null)
	parent.kid_add(kid)
	// RECURSION!
	kid.insert(npath.slice(1), payload)
    }

    // Side effect: modifies tnode parent
    kid_add(tnode) {
	if (!tnode) return false
	if (Array.isArray(tnode)) {
	    let arr = tnode.filter( tn => this.indexOf(tn.name) === -1)
	    if (!arr.length) return false
	    arr.map(tn => tn.parent = this)
	    this.kids = this.kids.concat(arr)
	} else {
	    if (this.indexOf(tnode.name) !== -1) return false
	    tnode.parent = this
	    // is this faster than concat()?
	    this.kids.push(tnode)
	}
	return true
    }

    // in place
    sort(order) {
	if (!order) order = "descending"
	return this.kids.sort(exports.TNode.SortOrder[order])
    }

    // in place
    sort_deep(order) {
	if (!order) order = "descending"
	let mysort = function(tnode, level, args) {
	    tnode.sort(order)
	    return { partial: true }
	}
	let msgbus = {}
	this.walk(mysort, 0, [], msgbus)
	this.sort(order)
    }

    // callback_args -- an array
    walk(callback, level, callback_args, msgbus) {
	for (let idx = 0; idx < this.kids.length; ++idx) {

	    let r = callback(this.kids[idx], level, callback_args)
	    if (r) {
		if (r.final) {
		    msgbus.exit = r.final
//		    console.log("*** ABORT")
		    return msgbus.exit
		}

		// RECURSION!
		this.kids[idx].walk(callback, level+1, callback_args, msgbus)
		if (msgbus.exit) return msgbus.exit
	    }
	}
    }

    find(/* arguments */) {
	var args = Array.prototype.slice.call(arguments)
	if (!args.length) return null

	let times_left = args.length
	let search = function(tnode, level, args) {
//	    console.log(`${level}: ${args[level]} ? ${tnode.name}`)
	    let r = {}
	    if (args[level] === tnode.name) {
		times_left--
		r.partial = true
	    }
//	    console.log(tnode.name, args, r, times_left)
//	    console.log('---')

	    if (times_left === 0) {
//		console.log("*** FOUND")
		r.final = tnode
		return r
	    }

	    return r.partial ? r : null
	}
	let msgbus = {}
	return this.walk(search, 0, args, msgbus) || null
    }

    ascendant_of(tnode) {
	let parent = this.parent
	if (parent === tnode.parent) return false // siblings

	while (parent) {
	    if (parent === tnode) return true
	    parent = parent.parent
	}
	return false
    }
}
