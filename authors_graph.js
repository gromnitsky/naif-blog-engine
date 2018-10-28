/* global Chartist */
'use strict';

let common = require('./lib/common')
let web = require('./lib/web')

document.addEventListener('DOMContentLoaded', () => {
    web.getindex().then(plot)
})

function plot(index) {
    if (author() === 'anonymous') return
    let plot_data = points(common.index_group_by(index, 'authors')[author()])

    let node = document.querySelector('#nbe__authors__graph')
    if (!node) return
    node.className = 'ct-double-octave'

    let data = { series: [ plot_data ] }
    let ticks = plot_data.map( v => v.x)
    let yyyy_mm = d => `${d.getFullYear()}-${d.getMonth()+1}`
    let tooltip = new Tooltip('#nbe__authors__graph__tooltip')
    new Chartist.Line(node, data, {
	chartPadding: { bottom: 30 },
	axisX: {
	    type: Chartist.FixedScaleAxis,
	    ticks: [ticks[0], ticks[ticks.length-1]],
	    labelInterpolationFnc: function(n) {
	    	let d = new Date(n)
	    	return `${d.getFullYear()}-${d.getMonth()+1}`
	    },
	}
    }).on('draw', function(data) {
	if (data.type === 'point') tooltip.register(data.element._node, `${yyyy_mm(new Date(data.value.x))} (${data.value.y})`)
    })
}

class Tooltip {
    constructor(id) {
	this.node = document.querySelector(id)
	if (!this.node) throw new Error(`no node ${id}`)
    }
    show(evt, text) {
	this.node.innerHTML = common.e(text)
	this.node.style.display = 'block'
	this.node.style.left = evt.pageX + 10 + 'px'
	this.node.style.top = evt.pageY + 10 + 'px'
    }
    hide() { this.node.style.display = 'none' }
    register(node, text) {
	node.onmousemove = evt => this.show(evt, text)
	node.onmouseout = this.hide.bind(this)
    }
}

function author() { return web.dataset('body>main>section>article', 'author') }

function points(posts) {
    let months = posts.reduce( (result, post) => {
	let key = common.birthtime_ymd(post.file).slice(0,7)
	result[key] = result[key] || 0
	result[key]++
	return result
    }, {})

    return Object.keys(months).sort().map( key => {
	return {x: new Date(`${key}-01T00:00:00`), y: months[key]}
    })
}
