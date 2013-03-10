var talk_path = '';
var game_info_path = '';
if (typeof window === 'undefined') {
    talk_path = "public/lib/talk";
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    talk_path = "/lib/talk.js";
    game_info_path = "gnipgnop/core/game_info";
}
define([ "../util/guid", talk_path, game_info_path, "../net/message_buffer" ],
function( guid,          Talk,      GameInfo,        MessageBuffer) {

    var InputBuffer = function () {

        var that = {};

        var length = 100
          , start = 0
          , end = 0
          , buffer = new Array(length);
        var gameTime;
        var socket
          , messenger;

        that.id = guid.generate();

        var clicks = {};

        // Pre fill the buffer
        for (var i = 0; i < length; ++i) {
            buffer[i] = {
                target: '',
                type: '',
                x: 0,
                y: 0,
                timestamp: 0
            };
        }

        var next = function () {
            end++;
            if (end >= length) {
                end = 0;
            }

            if (end <= start) {
                start++;
            }
        }

        var addClick = function (target, id, x, y) {

            if (!clicks[target]) {
                clicks[target] = {};
            }

            var click = clicks[target];
            click.x = x;
            click.y = y;
            click.id = id;
            click.timestamp = gameTime.totalElapsed;

            MessageBuffer.addToQueue(target, Talk.Message.INPUT, [ Talk.Input.MOVE, id, x, y, target ]);

        };
        that.addClick = addClick;

        var getLatestClick = function(target, pos) {

            return clicks[target];

        };
        that.getLatestClick = getLatestClick;

        var setGameTime = function (theGameTime) {
            gameTime = theGameTime;
        };
        that.setGameTime = setGameTime;

        return that;
    }();

    return InputBuffer;

});