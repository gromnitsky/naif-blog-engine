// common staff for node & browser

let path = require('path')
let md5 = require('blueimp-md5') // for nodejs imp is too big

exports.is_post = function(file) { return /^\d{4}\/\d{2}\/\d{2}\b/.test(file) }

exports.rootdir = function(file) {
    let np = path.normalize(file)
    if (/^\.\/*$/.test(np)) return np
    return path.dirname(file).replace(/[^/]+/g, '..')
}

exports.link = function(file, relto) {
    return path.join(exports.rootdir(relto == null ? file : relto),
		     file.replace(/\.md$/, '.html'))
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

exports.birthtime_ymd = function(file) {
    let d = exports.birthtime(file)
    let pad = s => ('0'+s).slice(-2)
    return d && [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-')
}

exports.birthtime = function(file) {
    if (!exports.is_post(file)) return
    return new Date(file.split(path.sep).slice(0,3).join('-') + 'T00:00:00')
}

exports.metatags_link = function(relto, type, template) {
    let prefix = { tags: 't', authors: 'a' }[type]
    return path.join(exports.rootdir(relto), prefix, md5(template) + '.html')
}

exports.metatags_inline = function(relto, type, list) {
    return list.map( val => {
	return `<a href="${exports.e(exports.metatags_link(relto, type, val))}">${exports.e(val)}</a>`
    }).join(", ")
}

exports.e = function(s) {
    if (s == null) return ''
    return s.toString().replace(/[<>&'"]/g, ch => {
        switch (ch) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case '\'': return '&apos;'
        case '"': return '&quot;'
        }
    })
}
