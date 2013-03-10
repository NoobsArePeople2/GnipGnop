define(function(require) {

    var Collider = function () {

        var that = {};

        that.HIT_NONE   = 0x0;
        that.HIT_TOP    = 0x1;
        that.HIT_RIGHT  = 0x2;
        that.HIT_BOTTOM = 0x4;
        that.HIT_LEFT   = 0x8;

        return that;

    }();

    return Collider;

});