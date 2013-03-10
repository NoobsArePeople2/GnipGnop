define([ '../core/state' ],
function (state) {

    var create = function (spec) {

        spec = spec || {};
        spec.name = "game_over_state";
        var that = state.create(spec);

        var systems = spec.systems;
        var numSystems = systems.length;

        var update = function (gameTime) {

            var entities = that.owner.entities;
            var numEntities = entities.length;
            for (var i = 0; i < numSystems; ++i) {

                for (var j = 0; j < numEntities; ++j) {
                    systems[i].update(gameTime, entities[j]);
                }

            }

        };
        that.update = update;

        var onComplete = function () {

            that.machine.onGameOverComplete();

        };

        var enter = function (machine) {

            that.machine = machine;

            var gameOverScreen = that.owner.screens["game_over"];
            gameOverScreen.reset(that.owner.winner);
            that.owner.screens["game_over"].onComplete.add(onComplete);
            that.owner.addSubscreen(that.owner.screens["game_over"]);

        };
        that.enter = enter;

        var exit = function () {

            that.machine = null;
            that.owner.screens["game_over"].onComplete.remove(onComplete);
            that.owner.removeSubscreen(that.owner.screens["game_over"]);

            that.owner.reset();

        };
        that.exit = exit;

        return that;

    }

    return {
        create: create
    };

});