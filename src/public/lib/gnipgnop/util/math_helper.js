define(function() {

    var lerp = function (from, to, amount) {

        amount = amount || 0.5;
        return from + ( to - from ) * 0.5;

    };

    var dist = function (x1, y1, x2, y2) {

        return Math.sqrt ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };

    var distSquared = function (x1, y1, x2, y2) {

        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    };

    return {
        lerp:        lerp,
        dist:        dist,
        distSquared: distSquared
    };

});