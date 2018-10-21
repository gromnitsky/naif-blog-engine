// nav.js & fts.js

'use strict';

let web = require('./lib/web')

document.addEventListener('DOMContentLoaded', async function() {
    let btn = document.querySelector('.nbe--search')
    let post = document.querySelector('body > main > section')
    if (!(btn && post)) { console.log('no .nbe--search'); return }

    let sd = new SearchDialog(post, await web.getconf())
    btn.onclick = evt => {
	sd.toggle()
	evt.preventDefault()
    }
})

class SearchDialog {
    constructor(parent_node, conf) {
	this.parent_node = parent_node
	this.conf = conf
	this.id = 'nbe__fts__searchdialog'
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
	this.node.style.borderBottom = '1px dotted #191919'
	this.node.style.padding = '10px 0'

	this.parent_node.prepend(this.node)
	this.node.innerHTML= '<input type="search" placeholder="Search..."><div style="margin-top: 1em"></div>'
	this.input = this.node.querySelector('input')
	this.result = this.node.querySelector('div')

	this.input.oninput = web.debounce(this.search.bind(this), 500)
    }

    search() {
	this.send(this.input.value)
	    .then(this.print_results.bind(this))
	    .catch(this.search_error.bind(this))
    }

    send(query) {
	let url = `${this.conf.fts}/?q=${encodeURIComponent(query)}`
	return web.efetch(url).then( r => r.json())
    }

    search_error(e) {
	this.result.innerText = e.res && e.res.status === 412 ? 'Invalid query' : e.message
    }

    print_results(r) {
	console.log(r)
    }
}
