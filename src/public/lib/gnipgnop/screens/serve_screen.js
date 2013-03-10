define(function(require) {

    var server = typeof window === 'undefined';
    var signals_path = '';
    var game_info_path;
    if (server) {
        signals_path = 'signals';
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        signals_path = '../../signals';
        game_info_path = "gnipgnop/core/game_info";
    }

    var screen   = require('../core/screen')
      , Signal   = require(signals_path)
      , GameInfo = require(game_info_path)

    var create = function (spec) {

        var spec = spec || {};
        spec.name = "disconnect_screen";
        var that = screen.create(spec);

        that.onComplete = new Signal();

        var instructionsText;

        if (!server) {
            that.container = new createjs.Container();
            that.container.x = 0;
            that.container.y = 0;

            instructionsText = new createjs.Text("PLAYER", "30px " + GameInfo.fonts["Racing-Sans"], GameInfo.colorTable["gray"].fill);
            if (Modernizr.touch) {
                instructionsText.text = "Tap above and below your paddle to move.\n";
                instructionsText.text += "Swipe toward the other player to serve."
            } else {
                instructionsText.text = "Use the up and down arrows to move.\n";
                instructionsText.text += "Tap space to serve."
            }
            instructionsText.textAlign = "center";
            instructionsText.x = GameInfo.stageWidth / 2;
            instructionsText.y = GameInfo.stageHeight / 2 - 60;
            that.container.addChild(instructionsText);
        }

        var update = function (gameTime) {

        };
        that.update = update;

        var reset = function (player) {

            if (server) {
                return;
            }
            instructionsText.alpha = 0;

        };
        that.reset = reset;

        var show = function () {

            if (server) {
                return;
            }

            createjs.Tween.get(instructionsText)
                  .to({ alpha: 1 }, 500, createjs.Ease.quadIn);

        };
        that.show = show;

        var hide = function () {

            if (server) {
                return;
            }

            createjs.Tween.get(instructionsText)
                  .to({ alpha: 0 }, 500, createjs.Ease.quadIn);

        };
        that.hide = hide;

        return that;
    };

    return {
        create: create
    };

});