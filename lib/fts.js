let minimist = require('minimist')

class Finder {
    constructor(db) { this.db = db }
    metatags() {
	if (this._metatags) return this._metatags
	let st = this.db.prepare('SELECT * FROM metatags')
	return this._metatags = st.all()
    }
    static argv_parse(argv) {
	return minimist(argv, {
	    string: ['d', 'a', 't', 'A', 'T', 'db' /* cli only */]
	})
    }
    // FIXME: add -d, -t, -T, -a, -A support
    find(argv) {
	let fts = this.db.prepare('SELECT file,subject,date,snippet(fts,3,"<b>","</b>","...",64) AS snippet from fts WHERE fts.body MATCH ? ORDER BY rank LIMIT 100')
	return fts.all(argv._.join(' ')).map( post => {
	    let mt = this.metatags().filter( v => v.file === post.file)
	    post.authors = mt.filter( v => v.type === 'author').map(v => v.name)
	    post.tags = mt.filter( v => v.type === 'tag').map( v => v.name)
	    return post
	})
    }
}

exports.Finder = Finder

exports.help = `QUERY: [-d from-to] [-a author] [-A author] [-t tag] [-T tag] phrase`
