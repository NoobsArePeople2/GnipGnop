define(function() {

    var create = function(spec) {

        var that = {};
        spec = spec || {};
        that.x = spec.x || 0;
        that.y = spec.y || 0;

        var reset = function(x, y) {
            that.x = x || 0;
            that.y = y || 0;

            return that;
        }
        that.reset = reset;

        var moveBy = function (dx, dy) {
            that.x += dx;
            that.y += dy;
        };
        that.moveBy = moveBy;

        var dot = function(v) {

            return ((that.x * v.x) + (that.y * v.y));

        }
        that.dot = dot;

        var isZero = function() {

            return that.x == 0 && that.y == 0;

        }
        that.isZero = isZero;

        var toString = function () {

            return "x: " + that.x + ", y: " + that.y;

        };
        that.toString = toString;

        /**
         * If y is null, assume x is a vector2.
         */
        var lerpTo = function (x, y, amount) {

            amount = amount || 0.5;
            if (y != null) {
                that.x += (x - that.x) * amount;
                that.y += (y - that.y) * amount;
            } else {
                that.x += (x.x - that.x) * amount;
                that.y += (x.y - that.y) * amount;
            }

            return that;

        };
        that.lerpTo = lerpTo;

        var net = [ 0, 0 ];
        var toNetwork = function() {
            net[0] = that.x;
            net[1] = that.y;
            return net;
        }
        that.toNetwork = toNetwork;

        return that;

    }

    return {
        create: create
    };

});
