'use strict';

let path = require('path')

exports.getindex = function() {
    return exports.efetch(path.join(exports.root(), 'index.json')).then( r => r.json())
}

exports.getconf = function() {
    return exports.efetch(path.join(exports.root(), 'config.json')).then( r => r.json())
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
