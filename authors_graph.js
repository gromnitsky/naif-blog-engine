/* global Chartist */
'use strict';

let common = require('common')
let web = require('web')

document.addEventListener('DOMContentLoaded', () => {
    web.getindex().then(plot)
})

function plot(index) {
    if (author() === 'anonymous') return

    let id = '#nbe__authors__graph'
    let node = web.$(id)[0]
    node.className = 'ct-double-octave'
    let tooltip = new Tooltip('#nbe__authors__graph__tooltip')

    let plot_data = points(common.index_group_by(index, 'authors')[author()])
    let data = { series: [ plot_data ] }

    let ticks = (all, max_allowed) => {
	if (all.length <= max_allowed) return all
	return all.filter((v,idx) => idx % Math.ceil(all.length/max_allowed) === 0)
    }
    let yyyy_mm = d => `${d.getFullYear()}-${d.getMonth()+1}`

    new Chartist.Line(node, data, {
	chartPadding: { bottom: 30 },
	axisX: {
	    type: Chartist.FixedScaleAxis,
	    ticks: ticks(plot_data.map( v => v.x), 20),
	    labelInterpolationFnc: n => yyyy_mm(new Date(n))
	}
    }).on('draw', function(data) {
	if (data.type === 'point') tooltip.register(data.element._node, `${yyyy_mm(new Date(data.value.x))} (${data.value.y})`)
    })
}

class Tooltip {
    constructor(id) { this.node = web.$(id)[0] }
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
