define([ '../core/state' ],
function (state) {

    var create = function (spec) {

        spec = spec || {};
        spec.name = "playing_state";
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

        return that;

    }

    return {
        create: create
    };

});