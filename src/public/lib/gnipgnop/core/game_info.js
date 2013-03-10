define(function() {

    var GameInfo = function () {

        var server = typeof window === 'undefined';
        var that = {};

        that.LOG_CONSOLE = 1;

        var logTarget;
        var setLog = function (target) {

            logTarget = target;
            that.clearLog();

        };
        that.setLog = setLog;

        var log = function (msg, logConsole) {

            // if (server && logConsole === that.LOG_CONSOLE && console) {
            if (logConsole === that.LOG_CONSOLE && console) {
                console.log(msg);
            }

            if (!logTarget) {
                return;
            }

            logTarget.value += msg + "\n";
            logTarget.scrollTop = logTarget.scrollHeight;
        };
        that.log = log;

        var clearLog = function () {
            if (!logTarget) {
                return;
            }

            logTarget.value = '';
        };
        that.clearLog = clearLog;

        var theStage;
        var stage = function(s) {
            s = s || null;
            if (s != null) {
                theStage = s;
            } else {
                return theStage;
            }
        };
        that.stage = stage;

        var theLocalPlayer = -1;
        var localPlayer = function (lp) {
            if (typeof lp === 'number') {
                GameInfo.log("setting local player to: " + lp);
                theLocalPlayer = lp;
            } else {
                return theLocalPlayer;
            }
        };
        that.localPlayer = localPlayer;

        var theGame = null;
        var game = function (g) {
            if (g) {
                theGame = g;
            } else {
                return theGame;
            }
        };
        that.game = game;

        that.stageWidth  = 640;
        that.stageHeight = 480;

        var colors = [
            "red",
            "blue",
            "green",
            "yellow"
        ];
        that.colors = colors;

        var colorTable = {

            "blue": {
                "stroke": "#00BFFF",
                "fill":   "#76DDFF"
            },

            "red": {
                "stroke": "#FF4B42",
                "fill":   "#FF7D76"
            },

            "green": {
                "stroke": "#00ff00",
                "fill":   "#00ff00"
            },

            "black": {
                "stroke": "#333333",
                "fill":   "#333333"
            },

            "white": {
                "stroke": "#ffffff",
                "fill":   "#ffffff"
            },

            "gray": {
                "stroke": "#dddddd",
                "fill":   "#dddddd"
            },

            "darkGray": {
                "stroke": "#222222",
                "fill":   "#222222"
            }

        };
        that.colorTable = colorTable;

        that.fonts = {

            "Racing-Sans": "Racing Sans One, sans-serif"

        };

        return that;

    }();

    return GameInfo;

});