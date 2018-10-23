'use strict';

let web = require('./lib/web')
let common = require('./lib/common')

document.addEventListener('DOMContentLoaded', async function() {
    let btn = document.querySelector('.nbe__search')
    let post = document.querySelector('body > main > section')
    if (!(btn && post)) { console.log('no .nbe__search'); return }

    let sd = new SearchDialog(post, await web.getconf())
    btn.style.visibility = 'visible'
    btn.onclick = evt => {
	sd.toggle()
	evt.preventDefault()
    }
})

class SearchDialog {
    constructor(parent_node, conf) {
	this.parent_node = parent_node
	this.conf = conf
	this.id = 'nbe__search__dialog'
    }

    is_hidden() { return this.node.style.display === 'none' }
    focus() { if (!this.is_hidden()) this.input.focus() }

    toggle() {
	if (!this.node)
	    this.init()
	else
	    this.node.style.display = this.is_hidden() ? 'block' : 'none'
	this.focus()
    }

    init() {
	console.log('creating', this.id)
	this.node = document.createElement('div')
	this.node.id = this.id

	this.parent_node.prepend(this.node)
	this.node.innerHTML= '<input type="search" placeholder="Search..."><div style="margin-top: 1em"></div>'
	this.input = this.node.querySelector('input')
	this.result = this.node.querySelector('div')

	this.input.oninput = web.debounce(this.search, 500).bind(this)
    }

    search() {
	if (/^\s*$/.test(this.input.value)) return

	this.result.innerText = 'Fetching results...'
	this.send(this.input.value)
	    .then(this.print_results.bind(this))
	    .catch(this.search_error.bind(this))
    }

    send(query) {
	let url = `${this.conf.fts}/?q=${encodeURIComponent(query)}`
	return web.fetch_json(url)
    }

    search_error(e) {
	this.result.innerText = e.res && e.res.status === 412 ? 'Invalid query' : e.message
    }

    print_results(r) {
	if (!r.length) { this.result.innerText = 'No matches'; return }
	let tbl = ['<table><thead><tr>',
		   '<th>Date</th>',
		   '<th>Subject</th>',
		   '<th>Snippet</th>',
		   '<th>Authors</th>',
		   '<th>Tags</th>',
		   '</tr></thead><tbody>']
	let relto = web.relto()
	tbl = tbl.concat(r.map( e => this.entry_format(e, relto)))
	tbl.push('</tbody></table>')
	this.result.innerHTML = tbl.join("\n")
    }

    entry_format(e, relto) {
	return ['<tr><td>', [
	    common.birthtime_ymd(e.file),
	    `<a href='${common.e(common.link(e.file, relto))}'>${common.e(e.subject)}</a>`,
	    e.snippet,
	    common.metatags_inline(relto, 'authors', e.authors),
	    common.metatags_inline(relto, 'tags', e.tags)
	].join('</td><td>'),
		'</td></tr>'].join('')
    }
}
