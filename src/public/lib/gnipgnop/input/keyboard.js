var signals_path = '';
if (typeof window === 'undefined') {
    signals_path = 'signals';
} else {
    signals_path = '../../signals';
}

define(function(require) {

    var Keys     = require('../input/keys')
      , Signal   = require(signals_path)
      , GameInfo = require('../core/game_info');

    var create = function (spec) {

        var BUTTON_JUST_RELEASED = -1;
        var BUTTON_UP            = 0;
        var BUTTON_HELD          = 1;
        var BUTTON_JUST_PRESSED  = 2;

        spec = spec || {};
        var that = {};
        that.isLocal = spec.isLocal || false;

        var server = false;
        if (typeof window === 'undefined') {
            server = true;
        }

        var buttons = {};

        that.keyDown = new Signal();
        that.keyUp   = new Signal();

        var setKeyDown = function (keyCode) {

            if (buttons[keyCode] && buttons[keyCode] > 0) {
                buttons[keyCode] = BUTTON_HELD;
            } else {
                buttons[keyCode] = BUTTON_JUST_PRESSED;
            }

        };
        that.setKeyDown = setKeyDown;

        var clearKeyDown = function (keyCode) {

            buttons[keyCode] = BUTTON_JUST_RELEASED;

        };
        that.clearKeyDown = clearKeyDown;

        var isKeyDown = function (keyCode) {

            if (!buttons[keyCode]) {
                return false;
            }

            return buttons[keyCode] > 0;

        };
        that.isKeyDown = isKeyDown;

        var wasKeyJustPressed = function (keyCode) {

            if (!buttons[keyCode]) {
                return false;
            }

            return buttons[keyCode] == BUTTON_JUST_PRESSED;

        };
        that.wasKeyJustPressed = wasKeyJustPressed;

        var wasKeyJustReleased = function (keyCode) {

            if (buttons[keyCode] === undefined) {
                return false;
            }

            return buttons[keyCode] == BUTTON_JUST_RELEASED;

        };
        that.wasKeyJustReleased = wasKeyJustReleased;

        var clear = function () {

            for (var keyCode in buttons) {
                buttons[keyCode] = BUTTON_UP;
            }

        };
        that.clear = clear;

        var update = function (gameTime) {

            var keyCode;
            if (that.isLocal || server) {
                for (keyCode in buttons) {
                    if (buttons[keyCode] < 0) {
                        buttons[keyCode] = BUTTON_UP;
                    } else if (buttons[keyCode] > 1) {
                        buttons[keyCode] = BUTTON_HELD;
                    }
                }
            } else {
                // For non-local (i.e., keyboards of remote players) we
                // need to update the keyboard when the button state
                for (keyCode in buttons) {
                    if (buttons[keyCode] == BUTTON_JUST_PRESSED) {
                        // GameInfo.log("[keyboard] button '" + keyCode + "' set to 'held'");
                        buttons[keyCode] = BUTTON_HELD;
                    } else if (buttons[keyCode] == BUTTON_JUST_RELEASED) {
                        // GameInfo.log("[keyboard] button '" + keyCode + "' set to 'up'");
                        buttons[keyCode] = BUTTON_UP;
                    }
                }
            }

        };
        that.update = update;

        return that;

    }

    return {
        create: create
    };

});