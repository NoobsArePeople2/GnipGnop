define(function(){

    var create = function(spec) {

        var that = {};

        that.owner = null;
        that.name = spec.name;

        that.id = 0;

        var update = function (gameTime) {

        };
        that.update = update;

        var sync = function (data) {

        };
        that.sync = sync;

        var reset = function () {

        };
        that.reset = reset;

        return that;

    };

    return {
        create: create
    };

});
