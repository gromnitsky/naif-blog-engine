'use strict';

let path = require('path')

exports.getindex = function() {
    return exports.fetch_json(path.join(exports.root(), 'index.json'))
}

exports.getconf = function() {
    return exports.fetch_json(path.join(exports.root(), 'config.json'))
}

exports.root = function() { return exports.dataset('body>header', 'root') }
exports.file = function() { return exports.dataset('body>main>section>article', 'file') }

exports.dataset = function(selector, attr) {
    let h = document.querySelector(selector)
    if (h && h.dataset[attr] != null) return h.dataset[attr]
    throw new Error(`no data-${attr} attr on '${selector}'`)
}

exports.efetch = function(url, opt) {
    let err = r => {
	if (r.ok) return r
	let e = new Error(r.statusText); e.res = r
	throw e
    }
    return fetch(url, opt).then(err)
}

exports.fetch_json = function(url, opt) {
    return exports.efetch(url, opt).then( r => r.json())
}

exports.relto = function() {
    let md_file
    try { md_file = exports.file() } catch (e) { /* not a post/page */ }
    return md_file || exports.root()
}

exports.$ = function(q, node) {
    let r = (node || document).querySelectorAll(q)
    if (!r.length) throw new Error(`${q} yields nothing`)
    return r
}

/* 3rd party code */

// from underscore.js 1.8.3
exports.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
	var last = Date.now() - timestamp;

	if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
	} else {
            timeout = null;
            if (!immediate) {
		result = func.apply(context, args);
		if (!timeout) context = args = null;
            }
	}
    };

    return function() {
	context = this;
	args = arguments;
	timestamp = Date.now();
	var callNow = immediate && !timeout;
	if (!timeout) timeout = setTimeout(later, wait);
	if (callNow) {
            result = func.apply(context, args);
            context = args = null;
	}

	return result;
    };
}
