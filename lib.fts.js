let minimist = require('minimist')

// TODO: add filtering by date, authors, tags
exports.query = function(db, argv) {
    let fts = db.prepare('SELECT file,subject,date,snippet(fts,3,"<b>","</b>","...",64) AS snippet from fts WHERE fts.body MATCH ? ORDER BY rank LIMIT 100')
    let metatags = db.prepare('SELECT type,name FROM metatags WHERE file=?')
    return fts.all(argv._.join(' ')).map( post => {
	let mt = metatags.all(post.file)
	post.authors = mt.filter( v => v.type === 'author').map( v => v.name)
	post.tags = mt.filter( v => v.type === 'tag').map( v => v.name)
	return post
    })
}

exports.argv_parse = function(argv) {
    return minimist(argv, {
	string: ['d', 'a', 't', 'A', 'T', 'db']
    })
}

exports.help = `QUERY: [-d from-to] [-a author] [-A author] [-t tag] [-T tag] phrase`
