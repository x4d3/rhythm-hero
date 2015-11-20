Rhythm Hero
==========

Little game to learn read rythm on music sheet, using [VexFlow](http://www.vexflow.com) music notation rendering API.

[![Build Status](https://travis-ci.org/x4d3/rhythm-hero.svg?branch=master)](https://travis-ci.org/x4d3/rhythm-hero)

Demo can be found here: (http://x4d3.github.io/rhythm-hero/)

Installation
------------
```sh
$ grunt
```
will start a server on: (http://localhost:4000/)

Manually Publish to GH Page
------------
Create a token (https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
Update your Environment variable
```
GH_TOKEN=<YourToken>
GH_REF=github.com/<your name>/<your repo>.git
```
and call
```sh
$ ./deploy.sh
```

Libraries
------------
The project use:

- [VexFlow](http://www.vexflow.com) 
- [Gaussian](https://github.com/errcw/gaussian)
- [seedrandom](https://github.com/davidbau/seedrandom)
- [fraction.js](https://github.com/x4d3/fraction.js)
- [prime-library.js](https://github.com/x4d3/prime-library.js)