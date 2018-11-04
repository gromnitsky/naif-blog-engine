'use strict';
let NftsDialog = require('nfts/web')
let web = require('web')
let common = require('common')

document.addEventListener('DOMContentLoaded', async () => {
    let relto = web.relto()
    new NftsDialog((await web.getconf()).nfts,
		   file => common.link(file, relto),
		   file => common.metatags_link(relto, 'authors', file),
		   file => common.metatags_link(relto, 'tags', file))
})
