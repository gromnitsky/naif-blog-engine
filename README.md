# naif-blog-engine

A static blog generator powered by GNU Make, Node.js & SQLite. Includes
support for podcast feeds & FTS (full text search).

You write blog posts in markdown, and create [themes](themes/default)
using ejs.

A live example of the default theme:
https://gromnitsky.users.sourceforge.net/blog/

## Install

~~~
# npm -g i json
$ git clone ...
$ cd naif-blog-engine
$ npm i
~~~

Symlink `nbe-make` & `nbe-make-new-blog` to the PATH.

## New blog

~~~
$ nbe-make-new-blog out=my-blog
$ cd my-blog
$ tree my-blog -a -I .git --dirsfirst --noreport
my-blog
├── 2022
│   └── 10
│       └── 27
│           └── 0001.md
├── pages
│   └── about.md
├── config.json
├── .gitignore
└── local.mk
~~~

To compile:

    $ nbe-make

To test the result (`_out/web/`):

~~~
$ ruby -run -ehttpd _out/web/ -p8000
$ xdg-open http://localhost:8000
~~~

To write a new post:

    $ nbe-make new

Help:

    $ nbe-make help

## FTS

By default, the FTS module is off. To enable, uncomment *nfts.server*
key in `config.json` file:

~~~
"nfts": {
    [...]
    "server": "http://localhost:3000"
}
~~~

To generate the db:

    $ nbe-make fts-create

This creates `_fts` dir that contains a separate repo that includes
the db & a tiny http server that serves search queries. This repo can
be deployed, for example, to Heroku w/o any modifications or you can
test it locally:

    $ nbe-make # this recompiles the blog, for config.json was updated
    $ _fts/nfts-server _fts/db.sqlite3

or just via

    $ nbe-make fts-deploy

## Front matter in blog posts

* *subject* `String`;
* *authors* `Array<string>` or just a comma-separated string;
* *tags* `Array<string>`, or a comma-separated string;
* *preprocessor* `String`: an external stdin-to-stdout filter,
  e.g. `erb -T 1`; its output is used as a source for markdown→html
  conversion;
* *audio* `String`: a path to a local audio file; this will
  auto-inject HTML `<audio>` tag into a rendered post & add
  `<enclosure>` tag to an RSS.

## RSS config

Required by iTunes:

* *desc* `String`: for `<description>` tag;
* *rss.language* `String`: a 2-letter language code, e.g., `uk`;
* *rss.itunes.categories* `Array<string>`;
* *rss.itunes.image* `String`: a path to a local .png or .jpg;
* *rss.itunes.explicit* `Boolean`;

Optional:

* *rss.itunes.author* `String`.

To set a email for a particular author (instead of a default
`nil@example.com`), add *emails* key with name↔email mappings:

~~~
"rss": { ... }
"emails": {
    "Tomasz Zbrożek": "tomasz@example.com"
}
~~~

## Default theme config

* *theme.opt.quote* `String`: raw (not escaped!) HTML in the footer;
* *theme.opt.avatar* `String`: a path to an image displayed above TOC.

## BUGS

Tested under Fedora only.

## License

MIT
