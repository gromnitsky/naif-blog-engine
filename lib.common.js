// common staff for node & browser

let path = require('path')

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
    let d = birthtime(file)
    return d && [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-')
}

function birthtime(file) {
    if (!exports.is_post(file)) return
    return new Date(file.split(path.sep).slice(0,3).join('-') + 'T00:00:00')
}
