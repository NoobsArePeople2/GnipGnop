define(function(require) {

    var state = require('../core/state');

    var create = function (spec) {

        spec = spec || {};
        spec.name = "score_state";
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
            that.owner.scoreComplete();
        };

        var enter = function (machine) {

            that.machine = machine;

            that.owner.theBall.stop();

            that.owner.screens["score"].reset(that.owner.playerToServe);
            that.owner.screens["score"].onComplete.add(onComplete);
            that.owner.addSubscreen(that.owner.screens["score"]);

        };
        that.enter = enter;

        var exit = function () {

            that.machine = null;
            that.owner.screens["score"].onComplete.remove(onComplete);
            that.owner.removeSubscreen(that.owner.screens["score"]);

        };
        that.exit = exit;

        return that;

    }

    return {
        create: create
    };

});