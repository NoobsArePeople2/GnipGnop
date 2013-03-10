define(function(require) {

    var EntityId = require('../entities/entity_id');

    var create = function (spec) {

        var that = {};
        spec = spec || {};

        that.name = spec.name;
        that.id = spec.id;
        that.color = spec.color;

        var sync = function () {
            // console.log("[player] sync");
            return [ EntityId.PLAYER, that.id, that.name, that.color ];
        };
        that.sync = sync;

        var toString = function () {
            return "[player] name: '" + that.name + "', id: '" + that.id + "', color: '" + that.color + "'";
        };
        that.toString = toString;

        return that;

    };

    return {
        create: create
    };

});