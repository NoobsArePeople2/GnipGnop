define(function(require) {

    var BitwiseHelper = function () {

        var that = {};

        // See: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
        var binaryString = function (nMask) {
            // nMask must be between -2147483648 and 2147483647
            for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32; nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
            return sMask;
        };
        that.binaryString = binaryString;

        return that;

    }();

    return BitwiseHelper;

});