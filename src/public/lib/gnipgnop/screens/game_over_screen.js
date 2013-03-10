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
        spec.name = "game_over_screen";
        var that = screen.create(spec);

        that.onComplete = new Signal();

        var playerText
          , winsText;

        var playerTween
          , winsTween;

        var time = 0;

        if (!server) {
            that.container = new createjs.Container();
            that.container.x = 0;
            that.container.y = 0;

            playerText = new createjs.Text("PLAYER", "60px " + GameInfo.fonts["Racing-Sans"], "black");
            playerText.textAlign = "center";
            playerText.x = 0;
            playerText.y = GameInfo.stageHeight / 2 - 60;
            that.container.addChild(playerText);

            winsText = new createjs.Text("WINS!", "60px " + GameInfo.fonts["Racing-Sans"], "black");
            winsText.textAlign = "center";
            winsText.x = GameInfo.stageWidth;
            winsText.y = GameInfo.stageHeight / 2;
            that.container.addChild(winsText);
        }

        var update = function (gameTime) {

            time += gameTime.simTime;

            if (time > 2.25) {
                time = -1;
                that.onComplete.dispatch();
            }

        };
        that.update = update;

        var reset = function (winner) {

            time = 0;
            if (server) {
                return;
            }

            if (winner == 0) {
                playerText.text      = "PLAYER ONE";
                playerText.color     = GameInfo.colorTable[GameInfo.colors[0]].fill;
                winsText.color = GameInfo.colorTable[GameInfo.colors[0]].fill;
            } else {
                playerText.text      = "PLAYER TWO";
                playerText.color     = GameInfo.colorTable[GameInfo.colors[1]].fill;
                winsText.color = GameInfo.colorTable[GameInfo.colors[1]].fill;
            }

            playerText.x = 0;
            playerText.y = GameInfo.stageHeight / 2 - 60;
            playerText.alpha = 0;
            playerTween  = createjs.Tween.get(playerText)
                          .to({ x: GameInfo.stageWidth / 2, alpha: 1 }, 1000, createjs.Ease.quadIn)
                          .to({ x: GameInfo.stageWidth / 2 + 50 }, 750, createjs.Ease.linear)
                          .to({ x: GameInfo.stageWidth, alpha: 0 }, 500, createjs.Ease.quadIn);

            winsText.x = GameInfo.stageWidth;
            winsText.y = GameInfo.stageHeight / 2;
            winsText.alpha = 0;
            winsTween  = createjs.Tween.get(winsText)
                          .to({ x: GameInfo.stageWidth / 2, alpha: 1 }, 1000, createjs.Ease.quadIn)
                          .to({ x: GameInfo.stageWidth / 2 - 50 }, 750, createjs.Ease.linear)
                          .to({ x: 0, alpha: 0 }, 500, createjs.Ease.quadIn);

        };
        that.reset = reset;

        return that;
    };

    return {
        create: create
    };

});