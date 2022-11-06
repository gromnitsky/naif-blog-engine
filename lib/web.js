import path from 'path'

export function getindex() {
    return fetch_json(path.join(root(), 'index.json'))
}

export function getconf() {
    return fetch_json(path.join(root(), 'config.json'))
}

export function root() { return dataset('body>header', 'root') }
export function file() { return dataset('body>main>section>article', 'file') }

export function dataset(selector, attr) {
    let h = document.querySelector(selector)
    if (h && h.dataset[attr] != null) return h.dataset[attr]
    throw new Error(`no data-${attr} attr on '${selector}'`)
}

export function efetch(url, opt) {
    let err = r => {
	if (r.ok) return r
	let e = new Error(r.statusText); e.res = r
	throw e
    }
    return fetch(url, opt).then(err)
}

export function fetch_json(url, opt) {
    return efetch(url, opt).then( r => r.json())
}

export function relto() {
    let md_file
    try { md_file = file() } catch (e) { /* not a post/page */ }
    return md_file || root()
}

export function $(q, node) {
    let r = (node || document).querySelectorAll(q)
    if (!r.length) throw new Error(`${q} yields nothing`)
    return r
}
