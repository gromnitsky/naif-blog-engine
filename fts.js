/* global NftsDialog */

import * as web from './lib.web.js'
import common from './lib.common.js'

async function main() {
    let relto = web.relto()
    new NftsDialog((await web.getconf()).nfts,
		   file => common.link(file, relto),
		   file => common.metatags_link(relto, 'authors', file),
		   file => common.metatags_link(relto, 'tags', file))
}

main()
