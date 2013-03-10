define(function () {

    // All times in milliseconds
    var create = function(spec) {
        spec = spec || {};
        var that = {};

        that.frameTime = spec.frameTime || 1 / 60;
        that.simTime = spec.simTime || 1 / 100;

        that.totalElapsed = 0;
        that.elapsed = 0;

        that.previousTime = new Date().getTime();

        var update = function() {

            var currentTime = new Date().getTime();

            that.elapsed = (currentTime - that.previousTime) / 1000;
            that.totalElapsed += that.elapsed;

            that.previousTime = currentTime;
        };
        that.update = update;

        return that;
    };

    return {
        create: create
    };

});