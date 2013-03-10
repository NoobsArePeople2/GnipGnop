define(function () {

    var create = function(spec) {

        spec = spec || {};
        var that = {};

        that.entityId = 0;

        var update = function (gameTime, entity) {

        };
        that.update = update;

        return that;

    }

    return {
        create: create
    };

});
