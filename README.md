# naif-blog-engine

A Make-controlled static blog generator.

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

## License

MIT
