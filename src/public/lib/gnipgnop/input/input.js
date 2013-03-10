define(function(require) {

    var GameInfo = require('../core/game_info');

    var Input = function () {

        var that = {};

        var keyboards
          , numKeyboards = 0;

        var server = false;
        if (typeof window === 'undefined') {
            server = true;
        }

        var setKeyboards = function (kbs) {
            keyboards = kbs;
            numKeyboards = keyboards.length;
        };
        that.setKeyboards = setKeyboards;

        var getKeyboard = function (index) {
            return keyboards[index];
        };
        that.getKeyboard = getKeyboard;

        var updateKeyboards = function (gameTime) {
            for (var i = 0; i < numKeyboards; ++i) {
                keyboards[i].update(gameTime);
            }
        };
        that.updateKeyboards = updateKeyboards;

        var clearKeyboards = function () {
            for (var i = 0; i < numKeyboards; ++i) {
                keyboards[i].clear();
            }
        };
        that.clearKeyboards = clearKeyboards;

        var clear = function () {
            that.clearKeyboards();
        };
        that.clear = clear;

        return that;

    }();

    return Input;

});