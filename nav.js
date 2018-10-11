'use strict';

let md5 = require('blueimp-md5') // for nodejs imp is too big

document.addEventListener('DOMContentLoaded', function() {
    getindex().then(widgets).then(mount)
})

function getindex() {
    return efetch(path.join(root(), 'index.json')).then( r => r.json())
}

async function widgets(index) {
    let group_by_author = index_group_by(index, 'authors')
    let group_by_tag = index_group_by(index, 'tags')

    let md_file
    try { md_file = file() } catch (e) { /* not a post/page */ }
    let relto = md_file || root()

    return {
	contents: contents(relto, index),
	metatags: {
	    authors: metatags_list(relto, 'authors', group_by_author),
	    tags: metatags_list(relto, 'tags', group_by_tag)
	},
	post: {
	    prev: prev_or_next(md_file, index, cur => cur-1, '&raquo;'),
	    next: prev_or_next(md_file, index, cur => cur+1, '&laquo;')
	}
    }
}

function mount(widgets) {
    console.log('mount', widgets)
    let widget_mount = w => {
	let node = document.querySelector(w.id);
	node && w.m ? node.innerHTML = w.m : console.log(`'${w.id}' isn't used`)
    }

    [{id: "#nbe__contents--pages", m: widgets.contents.pages},
     {id: "#nbe__contents--posts", m: widgets.contents.posts},
     {id: "#nbe__metatags--authors", m: widgets.metatags.authors},
     {id: "#nbe__metatags--tags", m: widgets.metatags.tags},
     {id: "#nbe_post--next", m: widgets.post.next},
     {id: "#nbe_post--prev", m: widgets.post.prev}].forEach(widget_mount)
}

function root() { return dataset('body>header', 'root') }
function file() { return dataset('body>main>section>article', 'file') }

function dataset(selector, attr) {
    let h = document.querySelector(selector)
    if (h && h.dataset[attr] != null) return h.dataset[attr]
    throw new Error(`no data-${attr} attr on '${selector}'`)
}

function efetch(url, opt) {
    let err = r => { if (!r.ok) throw new Error(r.statusText); return r }
    return fetch(url, opt).then(err)
}

class TNode {
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
	let kid = new TNode(npath[0],
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
	return this.kids.sort(TNode.SortOrder[order])
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

let path = require('path')

// FIXME: remove `path` dependency
function rootdir(file) {
    let np = path.normalize(file)
    if (/^\.\/*$/.test(np)) return np
    return path.dirname(file).replace(/[^/]+/g, '..')
}

function link(file, relto) {
    return path.join(rootdir(relto == null ? file : relto),
		     file.replace(/\.md$/, '.html'))
}

function contents(file, index) {
    let tnode = (src, node_path) => {
	let root = new TNode("root")
	src.forEach( val => {
	    let npath = node_path(val.file)
	    root.insert(npath, val)

	    // mark the node & its ancestors as "selected"
	    if (file === val.file) {
		let leaf = root.find(...npath)
		while (leaf) {
		    leaf.selected = true
		    leaf = leaf.parent
		}
	    }
	})
	return root
    }
    let node_path_posts = file => {
	let [y,m,d,n] = file.split('/')
	return [y, m, d+'/'+n]
    }
    let node_path_pages = file => {
	return file.split('/').slice(1)
    }

    // FIXME: escape values
    function tree(tnode, file) {
	let r = []
	tnode.kids.forEach( kid => {
	    r.push(`<details ${kid.selected ? 'open' : ''}>`)
	    if (!kid.kids.length) {
		if (kid.selected)
		    r.push(`<summary class="selected"><b>${kid.payload.subject}</b></summary>`)
		else
		    r.push(`<summary><a href="${link(kid.payload.file, file)}">${kid.payload.subject}</a></summary>`)
	    } else {
		r.push(`<summary>${kid.name}</summary>`)
		r.push(tree(kid, file))
	    }
	    r.push('</details>')
	})
	return r.join('\n')
    }

    return {
	posts: tree(tnode(index.posts, node_path_posts), file),
	pages: tree(tnode(index.pages, node_path_pages), file),
    }
}

function metatags_link(relto, type, template) {
    let prefix = { tags: 't', authors: 'a' }[type]
    return path.join(rootdir(relto), prefix, md5(template) + '.html')
}

function metatags_list(relto, type, group) {
    return '<ul>' + Object.keys(group).map( name => {
	return `<li><a href="${metatags_link(relto, type, name)}">${name}</a> (${group[name].length})</li>`
    }).join("\n") + '</ul>'
}

function index_group_by(index, prop) {
    let articles = index.posts.concat(index.pages)
    return articles.reduce( (result, article) => {
	article[prop].forEach( val => {
	    if (!Array.isArray(result[val])) result[val] = []
	    result[val].push(article)
	})
	return result
    }, {})
}

function is_post(file) { return /^\d{4}\/\d{2}\/\d{2}\b/.test(file) }

function prev_or_next(file, index, condition, text) {
    if (!is_post(file)) return

    let cur = index.posts.findIndex( v => v.file === file)
    let idx = condition(cur)
    if (cur !== -1 && idx >= 0 && idx <= index.posts.length-1)
	return `<a href="${link(index.posts[idx].file)}" title="${index.posts[idx].subject}">${text}</a>`
}
