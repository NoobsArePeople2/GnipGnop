define(function() {

    var create = function(spec) {

        var that = {};
        that.buffer = new Array(60);

        that.start = 0
      , that.end = 0
      , that.length = that.buffer.length;

        for (var i = 0; i < that.length; ++i) {
            that.buffer[i] = {
                timestamp: 0,
                deltaX: 0,
                deltaY: 0,
                velocity: 0
            };
        }

        var next = function () {
            that.end++;
            if (that.end >= that.length) {
                that.end = 0;
            }

            if (that.end == that.start) {
                that.start++;
                if (that.start >= that.length) {
                    that.start = 0;
                }
            }
        }

        var add = function (timestamp, dx, dy, vel) {
            var item = that.buffer[that.end];
            item.timestamp = timestamp;
            item.deltaX = dx;
            item.deltaY = dy;
            item.velocity = vel;

            next();
        };
        that.add = add;

        var rewind = function(timestamp) {
            var index = that.start;
            var item;
            var count = 0;
            while (index != that.end) {
                item = that.buffer[index];
                if (item.timestamp > timestamp) {
                    that.start = index;
                    return count;
                }
                count++;

                index++;
                if (index >= that.length) {
                    index = 0;
                }
            }

            that.start = that.end;
            return count;
        };
        that.rewind = rewind;

        var playback = function(step, simTime) {

            var index = that.start;
            var item;
            while (index != that.end) {

                item = that.buffer[index];
                if (item) {
                    step(simTime);
                }
                index++;

                if (index == that.end) {
                    return;
                }

                if (index >= that.length) {
                    index = 0;
                }
            }
        };
        that.playback = playback;

        return that;

    }

    return {
        create: create
    };

});