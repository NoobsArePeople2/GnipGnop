define(function(require) {

    var ComponentId = require('../components/component_id');

    var create = function (spec) {

        var that = {};

        var ents = {};

        var addEntity = function (ent) {

            // console.log("[world] adding ent '" + ent.name + "'")
            if (ent.getComponentById(ComponentId.COLLISION)) {
                ents[ent.id] = ent;
                // console.log("[world] added ent '" + ent.name + "'")
            }

        };
        that.addEntity = addEntity;

        var removeEntity = function (ent) {

            if (ents[ent.id]) {
                delete ents[ent.id];
            }

        };
        that.removeEntity = removeEntity;

        var query = function (ent) {

            var others = [];
            var col = ent.getComponentById(ComponentId.COLLISION);
            var other;
            for (other in ents) {
                if (other != ent.id) {
                    others.push(ents[other]);
                }
            }

            return others;

        };
        that.query = query;

        return that;

    };

    return {
        create: create
    };

});