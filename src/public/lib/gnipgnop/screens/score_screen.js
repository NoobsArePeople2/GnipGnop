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
        spec.name = "score_screen";
        var that = screen.create(spec);

        that.onComplete = new Signal();

        var playerText
          , scoreText;

        var playerTween
          , scoreTween;

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

            scoreText = new createjs.Text("SCORES!", "60px " + GameInfo.fonts["Racing-Sans"], "black");
            scoreText.textAlign = "center";
            scoreText.x = GameInfo.stageWidth;
            scoreText.y = GameInfo.stageHeight / 2;
            that.container.addChild(scoreText);
        }

        var update = function (gameTime) {

            if (server) {
                time += gameTime.simTime;

                if (time > 2.25) {
                    that.onComplete.dispatch();
                }
            }

        };
        that.update = update;

        var reset = function (player) {

            if (server) {
                time = 0;
                return;
            }

            GameInfo.log("[score_screen] RESET");
            if (player == "Player0") {
                playerText.text  = "PLAYER ONE";
                playerText.color = GameInfo.colorTable[GameInfo.colors[0]].fill;
                scoreText.color  = GameInfo.colorTable[GameInfo.colors[0]].fill;
            } else {
                playerText.text  = "PLAYER TWO";
                playerText.color = GameInfo.colorTable[GameInfo.colors[1]].fill;
                scoreText.color  = GameInfo.colorTable[GameInfo.colors[1]].fill;
            }

            playerText.x = 0;
            playerText.y = GameInfo.stageHeight / 2 - 60;
            playerText.alpha = 0;
            playerTween  = createjs.Tween.get(playerText)
                          .to({ x: GameInfo.stageWidth / 2, alpha: 1 }, 1000, createjs.Ease.quadIn)
                          .to({ x: GameInfo.stageWidth / 2 + 50 }, 750, createjs.Ease.linear)
                          .to({ x: GameInfo.stageWidth, alpha: 0 }, 500, createjs.Ease.quadIn);

            scoreText.x = GameInfo.stageWidth;
            scoreText.y = GameInfo.stageHeight / 2;
            scoreText.alpha = 0;
            scoreTween  = createjs.Tween.get(scoreText)
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