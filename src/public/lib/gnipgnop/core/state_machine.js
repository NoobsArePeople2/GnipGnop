var game_info_path = '';
if (typeof window === 'undefined') {
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    game_info_path = "gnipgnop/core/game_info";
}

define(function(require) {

    var GameInfo = require(game_info_path);

    var create = function (spec) {

        spec = spec || {};
        var that = {};

        that.owner = spec.owner;

        var currentState = null
          , prevState = null
          , stateName = '';

        var transitioning = false;

        var states = {};
        var addState = function (name, state) {

            states[name] = state;

        };
        that.addState = addState;

        var onExit = function () {

            GameInfo.log("[state_machine] Setting state to '" + currentState.name + "'", GameInfo.LOG_CONSOLE);
            prevState.onExit.remove(onExit);
            currentState.enter(that);
            transitioning = false;

        };

        var setState = function (name) {

            if (transitioning) {
                return;
            }

            if (name == stateName) {
                // New state same as current one
                return;
            }

            var state = states[name];
            if (!state) {
                return;
            }



            that.stateName = name;
            transitioning = true;
            prevState = currentState;
            currentState = state;

            if (prevState) {

                if (prevState.onExit) {

                    prevState.onExit.add(onExit);
                    prevState.exit();

                    return;
                }

                GameInfo.log("[state_machine] Setting state to '" + name + "'", GameInfo.LOG_CONSOLE);
                prevState.exit();

            }

            currentState.enter(that);

            transitioning = false;

        };
        that.setState = setState;

        var update = function (gameTime) {

            currentState.update(gameTime);

        };
        that.update = update;

        return that;
    };

    return {
        create: create
    };

});