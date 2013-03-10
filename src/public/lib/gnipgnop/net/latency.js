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
function(Talk,       GameInfo) {

    var Latency = function() {

        var that = {};
        var latencies;

        var rtt
          , prev = 0
          , index = 0
          , length;

        that.average = 0;

        var net
          , socket
          , gameTime;

        var setConnection = function (theSocket, theNet) {
            socket = theSocket;
            net = theNet;
        };
        that.setConnection = setConnection;

        var setGameTime = function (theGameTime) {
            gameTime = theGameTime;
        };
        that.setGameTime = setGameTime;

        var setCheckPeriod = function(period) {
            latencies = new Array(60 / period); // over the last minute
            length = latencies.length;
            for (var i = 0; i < latencies.length; ++i) {
                latencies[i] = 0;
            }
        };
        that.setCheckPeriod = setCheckPeriod;

        var mostRecent = function() {
            return latencies[prev];
        };
        that.mostRecent = mostRecent;

        var compute = function () {

            var lat
              , num = 0;
            that.average = 0;
            for (var i = 0; i < length; ++i) {
                lat = latencies[i];
                if (lat > 0 && lat < 1359352800000) {
                    that.average += lat;
                    num++;
                }
            }

            that.average /= num;
        };
        that.compute = compute;

        var update = function(latency) {

            if (!net) {
                return;
            }

            if (!latency) {
                net.send(socket, net.compose(Talk.Message.RTT, [ index ]));
                latencies[index] = new Date().getTime();
                prev = index;
                index++;
                if (index >= length) {
                    index = 0;
                }
            } else {
                var i = latency[0];
                var lat = latencies[i];
                latencies[i] = new Date().getTime() - lat;
                compute();
            }

        };
        that.update = update;

        var q = [];
        var queue = function(data) {
            if (data) {
                q.push(data);
            } else {
                return q;
            }
        };
        that.queue = queue;

        return that;

    }();

    return Latency;

});