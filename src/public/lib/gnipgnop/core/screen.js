define(function(){

    var create = function (spec) {

        var that = {};
        that.name = spec.name;
        that.stage = spec.stage || null;
        that.game = null;

        var update = function (gameTime) {

        };
        that.update = update;

        var draw = function () {

        };
        that.draw = draw;

        var syncState = function (data) {
            if (!data) {
                return [];
            }
        };
        that.syncState = syncState;

        return that;

    };

    return {
        create: create
    };

});
