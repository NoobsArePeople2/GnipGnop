// define(function(require) {

//     var talk_path = '';
//     var game_info_path = '';
//     if (typeof window === 'undefined') {
//         talk_path = "public/lib/talk";
//         game_info_path = "public/lib/gnipgnop/core/game_info"
//     } else {
//         talk_path = "/lib/talk.js";
//         game_info_path = "gnipgnop/core/game_info";
//     }

//     var Talk     = require(talk_path)
//       , GameInfo = require(game_info_path);
var talk_path = '';
var game_info_path = '';
if (typeof window === 'undefined') {
    talk_path = "public/lib/talk";
    game_info_path = "public/lib/gnipgnop/core/game_info"
} else {
    talk_path = "/lib/talk.js";
    game_info_path = "gnipgnop/core/game_info";
}

define([ talk_path, game_info_path ],
function(Talk,      GameInfo) {

    var create = function (spec) {

        spec = spec || {};
        var that = {};
        var pings;

        var rtt
          , prev = 0
          , index = 0
          , length;

        that.average = 0;

        var messenger
          , socket
          , gameTime;

        var now;
        if (Date.now) {
            now = Date.now;
        } else {
            now = function () {
                return new Date().getTime();
            }
        }

        var setConnection = function (theSocket, theMessenger) {
            socket = theSocket;
            messenger = theMessenger;
        };
        that.setConnection = setConnection;

        var setGameTime = function (theGameTime) {
            gameTime = theGameTime;
        };
        that.setGameTime = setGameTime;
        setGameTime(spec.gameTime);

        var setCheckPeriod = function(period) {
            pings = new Array(60 / period); // over the last minute
            length = pings.length;
            for (var i = 0; i < pings.length; ++i) {
                pings[i] = 0;
            }
        };
        that.setCheckPeriod = setCheckPeriod;
        setCheckPeriod(spec.checkPeriod);

        var mostRecent = function() {
            return pings[prev];
        };
        that.mostRecent = mostRecent;

        var compute = function () {

            var ping
              , num = 0;
            that.average = 0;
            for (var i = 0; i < length; ++i) {
                ping = pings[i];
                if (ping > 0 && ping < 1359352800000) {
                    that.average += ping;
                    num++;
                }
            }

            that.average /= num;
        };
        that.compute = compute;

        var update = function(ping) {

            if (!messenger) {
                return;
            }

            if (!ping) {
                messenger.send(socket, messenger.compose(Talk.Message.RTT, [ GameInfo.localPlayer(), index ]));
                pings[index] = now();
                prev = index;
                index++;
                if (index >= length) {
                    index = 0;
                }
            } else {
                var i = ping;
                var ping = pings[i];
                pings[i] = now() - ping;
                compute();
            }

        };
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});