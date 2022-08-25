# naif-blog-engine

A Make-controlled static blog generator w/ FTS support; the offspring
of the NIH syndrome.

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
