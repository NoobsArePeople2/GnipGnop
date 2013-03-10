define(function(require) {

    var create = function (spec) {

        spec = spec || {};
        var that = {};

        that.name = spec.name;
        that.owner = spec.owner;
        that.machine = null;

        var update = function (gameTime) {

        };
        that.update = update;

        var exit = function () {

            that.machine = null;

        };
        that.exit = exit;

        var enter = function (machine) {

            that.machine = machine;

        };
        that.enter = enter;

        return that;

    };

    return {
        create: create
    };

});