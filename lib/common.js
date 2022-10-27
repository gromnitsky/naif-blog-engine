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

exports.postlink = function(file, relto) {
    return path.join(path.dirname(relto), file)
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

let pad2 = s => ('0'+s).slice(-2)
let date_l_yyyymmdd = d => [d.getFullYear(), pad2(d.getMonth()+1), pad2(d.getDate())].join('-')
let date_l_hhmmss = d => [d.getHours(), d.getMinutes(), d.getSeconds()].map(pad2).join(':')

exports.birthtime_ymd = function(file) {
    let d = exports.birthtime(file)
    return d && date_l_yyyymmdd(d)
}

exports.birthtime = function(file) {
    if (!exports.is_post(file)) return
    return new Date(file.split(path.sep).slice(0,3).join('-') + 'T00:00:00')
}

exports.date_human = function(t) {
    let d = new Date(t); if (isNaN(d)) throw new Error(`invalid date: ${t}`)
    return `<time datetime="${d.toISOString()}">${date_l_yyyymmdd(d)} ${date_l_hhmmss(d)}</time>`
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

exports.detect_input_type = function(file) {
    if (exports.is_post(file)) return 'post'
    if (file === 'home') return 'home'
    if (/^(author|tag)$/.test(path.dirname(file))) return 'metatags'
    return 'page'
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
