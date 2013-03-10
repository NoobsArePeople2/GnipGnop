# GnipGnop

A 2D HTML Canvas and Websockets implementation of Ping Pong that runs on desktop, tablets and smartphones. Here are some videos for your viewing pleasure:

* [Nexus S vs iPad3](http://youtu.be/AWLaD6l9Y1Y)
* [iPad3 vs Windows 8](http://youtu.be/c-V03YYhq9s)
* [Chrome vs Firefox on Windows 8](http://youtu.be/ttR3ciTY2Wk)

## Background

GnipGnop is an experiement in creating a browser-based, multi-device networked multiplayer game that runs off a single code base on client and server. To this end GnipGnop uses [Node.js](http://nodejs.org/) for the server-side and any web browser that supports [Canvas](http://caniuse.com/#search=canvas) and [Websockets](http://caniuse.com/#search=websocket), allowing the game to be written entirely in Javascript.

Like any experiment GnipGnop started with a hypothesis: that HTML5 was mature enough to make a networked multiplayer game that runs on traditional PCs, tablets and smartphones via the browser, all with the same Javascript code base. Implementing this hypothesis would allow me to do a few things along the way:

  * Sharpen my Javascript skills and learn modern JS practices
  * Test the strengths, weaknesses and plain limitations of HTML5 for game development
  * Familiarize myself with Node.js
  * Create my first networked multiplayer game
  * Build a foundation for future HTML5 games

## Supported Platforms

This being an HTML5 game it _should_ run on any browser that supports [Canvas](http://caniuse.com/#search=canvas) and [Websockets](http://caniuse.com/#search=websocket). We do, however, live in a world of device proliferation making it difficult for one person working on a hobby project to thoroughly test a web application on all possible operating systems and devices. With that in mind these are the platforms on which GnipGnop has been tested to work acceptably (meaning it should run and not crash and burn immediately). See the list of [Known Issues and Limitations](#known-issues-and-limitations) for exceptions to this list.

### Windows 8 Professional x64

- Chrome 25
- Firefox 18
- Internet Explorer 10
- Opera 12.12

### Mac OS 10.7.5 Lion

- Safari 6
- Chrome 25
- Firefox 18
- Opera 12.12

### iOS 6.1.2

- **iPad 3**
  - Mobile Safari
  - Chrome

### Android 4.1.2 Jelly Bean

- **Nexus S**
  - Chrome
  - Firefox

## Dependencies

These are all the apps or libraries required by GnipGnop. Don't worry &mdash; everything you need is either included in the repo or will be installed via [npm](https://npmjs.org/). This list is here to give credit where it's due. Without these tools GnipGnop wouldn't exist.

  * [Node.js](http://nodejs.org)
  * [CreateJS](http://createjs.com/)
  * [BiSON](https://github.com/BonsaiDen/BiSON.js/)
  * [ws](https://github.com/einaros/ws)
  * [express](https://github.com/visionmedia/express)
  * [requirejs](http://requirejs.org/)
  * [optimist](https://github.com/substack/node-optimist)
  * [signals](https://github.com/millermedeiros/js-signals)
  * [modernizr](http://modernizr.com/)

## Installation

&ldquo;Installation? I thought this was a browser game?&rdquo;

It is. But because I don't want to host a socket server to serve up the game in your browser you'll have to do that yourself. Just follow along:

    # Clone the repot
    $ git clone git@github.com:NoobsArePeople2/gnipgnop.git

    # CD into the src directory
    $ cd gnipgnop/src

    # Install all Node dependencies
    $ npm install

    # Run the server
    $ node server.js

When the server starts it will display the IP address and port of the host computer. It will look something like:

    Listening on '192.168.0.100:8080'

Copy and paste this into your browser's address bar to get playing!

### Command Line Options

* **port:** Specify the port on which the server should listen for connections. Usage:

    ```
    # Run the server
    $ node server.js --port 1234
    ```

    Now the server will list on port `1234`, making the host IP address something like `192.168.0.100:1234`.

### Playing Over the Internet

The astute will notice that this means the game is not playable over the Internet, but only over a LAN. GnipGnop certainly capable of being played over the Internet but you'll need to forward some ports which is well beyond the scope of this humble readme. Fortunately there's a [website for that](http://portforward.com/).

## Known Issues and Limitations

### Canvas Performance on Mobile

Canvas rendering it notably slower on mobile than desktop. The iPad 3 drops to ~15 frames per second (fps) when rendering the background stars that are visible in the desktop version. Simply removing these stars from the display list (and leaving their other logic) boosts the frame rate up to 60 fps.

Similarly, the Nexus S manages between ~15 and ~20fps depending on the browser. This is just _barely_ acceptable. The game is playable but far for a nice, enjoyable experience.

### Synchronization, Client-side Prediction and Latency

GnipGnop employs client-side prediction on the local player's paddle and the ball. The opposing player's paddle is synchronized via interpolation as described [here](http://www.gabrielgambetta.com/?p=63) (see "Entity Interpolation"). Ultimately this works okay if you have a good ping (< 50ms) and degrades at higher pings. The prediction and interpolation algorithms used in GnipGnop are as simple as can be to give acceptable results in most cases. _They are not particularly robust and in no way handle edge cases._

Further compounding synchronization issues is the fact that Websockets work similarly to TCP sockets, meaning they offer reliable, in-order delivery of messages. This is really great for a chat app but means that a dropped packet can (and most likely, will) seriously slow down synchronization. This difference can easily be seen by playing the game over a LAN (where you are likely to have a very fast connection with few dropped packets) and then playing over the Internet (where you will have a connection that drops more packets while also being much slower than a LAN).

### Chrome on iOS Fonts

The custom font used in GnipGnop is served from Google Webfonts which appear to [have a problem with Chrome on iOS](http://stackoverflow.com/q/13792642/608884). Rather than include the fonts in this repo, GnipGnop simply falls back to using the `sans-serif` font for iOS Chrome (and any other browser that has difficulty with Google Webfonts).

### Mobile Safari Lock Up

It is possible to get Mobile Safari to freeze up. This typically happens when the device goes to sleep or when Safari gets backgrounded and restored. No errors appear to be dispatched and sometimes Safari with unfreeze itself. Otherwise, going into settings an clearing the cache and history will unfreeze the app.

### Physics and Collisions

The physics in GnipGnop are far from realistic. In fact, they are just down right bad. Likewise, the collision system is not great either. One particularly bad case is the ball hitting the corner of a paddle. That said, both physics and collisions are passable for a project whose primary focus is networked multiplayer.

## License

GnipGnop is licensed under the MIT license.