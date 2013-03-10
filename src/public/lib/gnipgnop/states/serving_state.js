// define([ '../core/state' ],
// function (state) {
define(function(require) {

    var state = require('../core/state')
      , GameInfo = require('../core/game_info');

    var create = function (spec) {

        spec = spec || {};
        spec.name = "serving_state";
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

        var enter = function (machine) {

            that.machine = machine;

            if (that.owner.playerToServe == "Player" + GameInfo.localPlayer()) {
                that.owner.addSubscreen(that.owner.screens["serve"]);
                that.owner.screens["serve"].reset();
                that.owner.screens["serve"].show();
            }

        };
        that.enter = enter;

        var exit = function () {

            that.machine = null;
            that.owner.removeSubscreen(that.owner.screens["serve"]);

        };
        that.exit = exit;

        return that;

    }

    return {
        create: create
    };

});