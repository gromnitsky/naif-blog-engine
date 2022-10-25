# naif-blog-engine

A Make-controlled static blog generator w/ FTS support & a podcast
feed; the offspring of the NIH syndrome.

Requires node & sqlite.

A live example of the default theme:
http://gromnitsky.users.sourceforge.net/blog/

## Install

~~~
# npm -g i json browserify terser
$ git clone ...
$ cd naif-blog-engine
$ npm i
~~~

Symlink `nbe-make` & `nbe-make-new-blog` to the PATH.

## New blog

~~~
$ nbe-make-new-blog out=my-blog
$ cd my-blog
$ nbe-make
~~~

To test the results (`_out/web/`):

~~~
$ ruby -run -ehttpd _out/web/ -p8000
$ xdg-open http://localhost:8000
~~~

To write a new post:

    $ nbe-make new

For the help:

    $ nbe-make help

## Front matter

* *subject* `string`;
* *authors* `Array<string>` or just a comma-separated string;
* *tags* `Array<string>`, or a comma-separated string;
* *preprocessor* `string`: an external program that can read an .md
  file from stdin & print to stdout the result, e.g. `erb -T 1`;
* *audio* `string`: a path to a local audio file. This will
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

## Default theme config

* opt.quote: raw (not escaped!) HTML in the footer;
* opt.avatar: a path to an image displayed above TOC.

## FTS

By default, the FTS module is off. To enable, uncomment the
"nfts.server" key in `config.json` file that is located in the
*generated* blog dir:

~~~
"nfts": {
    [...]
    "server": "http://localhost:3000"
}
~~~

To generate the db:

    $ nbe-make fts-create

This creates `_fts` dir that contains a sep repo that includes the db
& the tiny http server to serve search queries. This repo can be
deployed, for example, to Heroku, w/o any modifications or it you can
test it locally via running

    $ nbe-make # this recompiles the blog, for config.json was updated
    $ _fts/nfts-server _fts/db.sqlite3

or just via

    $ nbe-make fts-deploy

## License

MIT
