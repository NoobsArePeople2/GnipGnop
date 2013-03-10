define(function(require) {

    var state_machine = require('../core/state_machine')

      , Input = require('../input/input');

    var create = function (spec) {

        var that = state_machine.create(spec);

          that.STATE_CONNECTING = "state_connecting"
        , that.STATE_SERVING    = "state_serving"
        , that.STATE_PLAYING    = "state_playing"
        , that.STATE_SCORED     = "state_scored"
        , that.STATE_GAME_OVER  = "state_game_over"
        , that.STATE_DISCONNECT = "state_disconnect";

        that.stateName = that.STATE_CONNECTING;

        var onStart = function () {
            if (that.stateName == that.STATE_CONNECTING) {
                that.owner.setPlayerToServe("Player0");
                that.setState(that.STATE_SERVING);
            }
        };
        that.onStart = onStart;

        var onDisconnect = function (numPlayers) {
            if (numPlayers < 2) {
                if (that.stateName != that.STATE_CONNECTING && that.stateName != that.STATE_DISCONNECT) {
                    that.setState(that.STATE_DISCONNECT);
                    Input.clear();
                }
            }
        };
        that.onDisconnect = onDisconnect;

        var onDisconnectComplete = function () {
            if (that.stateName == that.STATE_DISCONNECT) {
                that.setState(that.STATE_CONNECTING);
                Input.clear();
            }
        };
        that.onDisconnectComplete = onDisconnectComplete;

        var onScore = function () {
            if (that.stateName == that.STATE_PLAYING) {
                that.setState(that.STATE_SCORED);
                Input.clear();
            }
        };
        that.onScore = onScore;

        var onScoreComplete = function () {
            if (that.stateName == that.STATE_SCORED) {
                that.setState(that.STATE_SERVING);
                Input.clear();
            }
        };
        that.onScoreComplete = onScoreComplete;

        var onServe = function () {
            if (that.stateName == that.STATE_SERVING) {
                Input.clear();
                that.setState(that.STATE_PLAYING);
            }
        };
        that.onServe = onServe;

        var onGameOver = function () {
            if (that.stateName != that.STATE_GAME_OVER) {
                that.setState(that.STATE_GAME_OVER);
                Input.clear();
            }
        };
        that.onGameOver = onGameOver;

        var onGameOverComplete = function () {
            if (that.stateName == that.STATE_GAME_OVER) {
                that.setState(that.STATE_CONNECTING);
                Input.clear();
            }
        };
        that.onGameOverComplete = onGameOverComplete;

        return that;

    };

    return {
        create: create
    };

});