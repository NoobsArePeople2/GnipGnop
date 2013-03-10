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

define([ 'require', signals_path ], function(require, Signal) {

    var screen   = require('../core/screen')
      // , Signal   = require(signals_path)
      , GameInfo = require(game_info_path)


    var create = function (spec) {

        var spec = spec || {};
        spec.name = "connecting_screen";
        var that = screen.create(spec);

        that.onReady = new Signal();
        that.onScoreChanged = new Signal();

        that.hideCompleted = new Signal();

        var background;

        var playerOneText
          , playerTwoText;

        var playerOneColor = GameInfo.colorTable[GameInfo.colors[0]].fill
          , playerTwoColor = GameInfo.colorTable[GameInfo.colors[1]].fill;

        var playerOneConnected = false
          , playerTwoConnected = false;

        var playerToText
          , scoreText;

        var btnScoreUp
          , btnScoreDown;

        var score = 5;

        var btnPlayerOneReady
          , playerOneReadyText
          , btnPlayerTwoReady
          , playerTwoReadyText;

        var playerOneReady = false
          , playerTwoReady = false;

        var alpha = {
            waiting: 0.5,
            ready:   1.0
        };

        var onBtnDown = function (e) {

            if (GameInfo.localPlayer() != 0) {
                return;
            }

            if (e.target == btnScoreUp) {
                btnScoreUp.graphics.clear();
                btnScoreUp.graphics
                    .beginFill(GameInfo.colorTable["white"].fill)
                    .moveTo(middleX, btnUpStartY)
                    .lineTo(middleX + 35, btnUpStartY + 35)
                    .lineTo(middleX - 35, btnUpStartY + 35)
                    .lineTo(middleX, btnUpStartY);
            } else {
                btnScoreDown.graphics
                    .beginFill(GameInfo.colorTable["white"].fill)
                    .moveTo(middleX, btnDownStartY)
                    .lineTo(middleX + 35, btnDownStartY - 35)
                    .lineTo(middleX - 35, btnDownStartY - 35)
                    .lineTo(middleX, btnDownStartY);
            }

        };

        var onBtnUp = function (e) {

            if (e.target == btnScoreUp) {
                btnScoreUp.graphics.clear();
                btnScoreUp.graphics
                    .beginFill(GameInfo.colorTable["gray"].fill)
                    .moveTo(middleX, btnUpStartY)
                    .lineTo(middleX + 35, btnUpStartY + 35)
                    .lineTo(middleX - 35, btnUpStartY + 35)
                    .lineTo(middleX, btnUpStartY);
            } else {
                btnScoreDown.graphics.clear();
                btnScoreDown.graphics
                    .beginFill(GameInfo.colorTable["gray"].fill)
                    .moveTo(middleX, btnDownStartY)
                    .lineTo(middleX + 35, btnDownStartY - 35)
                    .lineTo(middleX - 35, btnDownStartY - 35)
                    .lineTo(middleX, btnDownStartY);
            }

        };

        var onUpClick = function (e) {

            if (GameInfo.localPlayer() != 0 || playerOneReady) {
                onBtnUp(e);
                return;
            }

            var prevScore = score;
            score += 1;
            if (score > 9) {
                score = 9;
            }

            if (prevScore != score) {
                that.onScoreChanged.dispatch(score);
            }
            scoreText.text = score;
            onBtnUp(e);

        };

        var onDownClick = function (e) {

            if (GameInfo.localPlayer() != 0 || playerOneReady) {
                onBtnUp(e);
                return;
            }

            var prevScore = score;
            score -= 1;
            if (score < 3) {
                score = 3;
            }

            if (prevScore != score) {
                that.onScoreChanged.dispatch(score);
            }
            scoreText.text = score;
            onBtnUp(e);

        };

        var markPlayerReady = function (playerId) {

            if (server) {
                return;
            }

            if (playerId == 0) {
                playerOneReady = true;
                btnPlayerOneReady.alpha = alpha.ready;
                playerOneReadyText.alpha = alpha.ready;
            } else {
                playerTwoReady = true;
                btnPlayerTwoReady.alpha = alpha.ready;
                playerTwoReadyText.alpha = alpha.ready;
            }
        };

        var markPlayerUnready = function (playerId) {

            if (server) {
                return;
            }

            if (playerId == 0) {
                playerOneReady = false;
                btnPlayerOneReady.alpha = alpha.waiting;
                playerOneReadyText.alpha = alpha.waiting;
            } else {
                playerTwoReady = false;
                btnPlayerTwoReady.alpha = alpha.waiting;
                playerTwoReadyText.alpha = alpha.waiting;
            }

        };

        var onReadyBtnClick = function (e) {

            if (e.target == btnPlayerOneReady) {

                if (GameInfo.localPlayer() != 0) {
                    return;
                }

                if (!playerOneReady) {
                    markPlayerReady(0)
                } else {
                    markPlayerUnready(0)
                }

                that.onReady.dispatch(0, playerOneReady);

            } else {

                if (GameInfo.localPlayer() != 1) {
                    return;
                }

                if (!playerTwoReady) {
                    markPlayerReady(1)
                } else {
                    markPlayerUnready(1)
                }

                that.onReady.dispatch(1, playerTwoReady);

            }

        };

        if (!server) {
            that.container = new createjs.Container();
            that.container.x = 0;
            that.container.y = 0;

            background = new createjs.Shape();
            background.graphics
                .beginFill(GameInfo.colorTable["black"].fill)
                .drawRect(
                    0, 0,
                    GameInfo.stageWidth, GameInfo.stageHeight
                );
            background.alpha = 1;
            that.container.addChild(background);

            // Player Names
            playerOneText = new createjs.Text("PLAYER ONE", "40px " + GameInfo.fonts["Racing-Sans"], playerOneColor);
            playerOneText.textAlign = "left";
            playerOneText.x = 12;
            playerOneText.y = 12;
            playerOneText.alpha = alpha.waiting;
            that.container.addChild(playerOneText);

            playerTwoText = new createjs.Text("PLAYER TWO", "40px " + GameInfo.fonts["Racing-Sans"], playerTwoColor);
            playerTwoText.textAlign = "left";
            playerTwoText.x = GameInfo.stageWidth - playerTwoText.getMeasuredWidth() * playerTwoText.scaleX - 12;
            playerTwoText.y = 12;
            playerTwoText.alpha = alpha.waiting;
            that.container.addChild(playerTwoText);

            // Ready Buttons
            btnPlayerOneReady = new createjs.Shape();
            btnPlayerOneReady.graphics
                .beginFill(playerOneColor)
                .drawRoundRect(
                    0, 0,
                    212, 75,
                    4, 4);
            btnPlayerOneReady.x = 12;
            btnPlayerOneReady.y = GameInfo.stageHeight - 12 - 75;
            btnPlayerOneReady.alpha = alpha.waiting;
            btnPlayerOneReady.addEventListener("click", onReadyBtnClick);
            that.container.addChild(btnPlayerOneReady);

            playerOneReadyText = new createjs.Text("Ready", "30px " + GameInfo.fonts["Racing-Sans"], GameInfo.colorTable["white"].fill);
            playerOneReadyText.textAlign = "left";
            playerOneReadyText.x = btnPlayerOneReady.x + 60;
            playerOneReadyText.y = btnPlayerOneReady.y + 24;
            playerOneReadyText.alpha = alpha.waiting;
            playerOneReadyText.mouseEnabled = false;
            that.container.addChild(playerOneReadyText);

            btnPlayerTwoReady = new createjs.Shape();
            btnPlayerTwoReady.graphics
                .beginFill(playerTwoColor)
                .drawRoundRect(
                    0, 0,
                    212, 75,
                    4, 4);
            btnPlayerTwoReady.x = GameInfo.stageWidth - 212 - 12;
            btnPlayerTwoReady.y = GameInfo.stageHeight - 12 - 75;
            btnPlayerTwoReady.alpha = alpha.waiting;
            btnPlayerTwoReady.addEventListener("click", onReadyBtnClick);
            that.container.addChild(btnPlayerTwoReady);

            playerTwoReadyText = new createjs.Text("Ready", "30px " + GameInfo.fonts["Racing-Sans"], GameInfo.colorTable["white"].fill);
            playerTwoReadyText.textAlign = "left";
            playerTwoReadyText.x = btnPlayerTwoReady.x + 70;
            playerTwoReadyText.y = btnPlayerTwoReady.y + 24;
            playerTwoReadyText.alpha = alpha.waiting;
            playerTwoReadyText.mouseEnabled = false;
            that.container.addChild(playerTwoReadyText);

            // Score stuff
            playToText = new createjs.Text("Play To", "20px " + GameInfo.fonts["Racing-Sans"], GameInfo.colorTable["white"].fill);
            playToText.textAlign = "left";
            playToText.x = GameInfo.stageWidth / 2 - 32;
            playToText.y = 195;
            playToText.alpha = alpha.waiting;
            that.container.addChild(playToText);

            scoreText = new createjs.Text(score, "40px " + GameInfo.fonts["Racing-Sans"], GameInfo.colorTable["white"].fill);
            scoreText.textAlign = "left";
            scoreText.x =  GameInfo.stageWidth / 2 - 12;
            scoreText.y = 220;
            scoreText.alpha = alpha.waiting;
            that.container.addChild(scoreText);

            var middleX = GameInfo.stageWidth / 2;
            var btnUpStartY = 150;
            btnScoreUp = new createjs.Shape();
            btnScoreUp.graphics
                .beginFill(GameInfo.colorTable["gray"].fill)
                .moveTo(middleX, btnUpStartY)
                .lineTo(middleX + 35, btnUpStartY + 35)
                .lineTo(middleX - 35, btnUpStartY + 35)
                .lineTo(middleX, btnUpStartY);
            btnScoreUp.alpha = alpha.waiting;
            btnScoreUp.addEventListener("click", onUpClick);
            btnScoreUp.addEventListener("mousedown", onBtnDown);

            that.container.addChild(btnScoreUp);

            var btnDownStartY = 300;
            btnScoreDown = new createjs.Shape();
            btnScoreDown.graphics
                .beginFill(GameInfo.colorTable["gray"].fill)
                .moveTo(middleX, btnDownStartY)
                .lineTo(middleX + 35, btnDownStartY - 35)
                .lineTo(middleX - 35, btnDownStartY - 35)
                .lineTo(middleX, btnDownStartY);
            btnScoreDown.alpha = alpha.waiting;
            btnScoreDown.addEventListener("click", onDownClick);
            btnScoreDown.addEventListener("mousedown", onBtnDown);

            that.container.addChild(btnScoreDown);
        }

        var onConnected = function (playerId) {

            if (playerId == 0) {
                playerOneConnected = true;
            } else {
                playerTwoConnected = true;
            }

            if (!server) {
                if (playerId == 0) {
                    playerOneText.alpha = alpha.ready;

                    GameInfo.log("localPlayer: " + GameInfo.localPlayer());
                    if (GameInfo.localPlayer() == 0) {
                        playToText.alpha = alpha.ready;
                        scoreText.alpha = alpha.ready;
                        btnScoreUp.alpha = alpha.ready;
                        btnScoreDown.alpha = alpha.ready;
                    }

                } else {
                    playerTwoText.alpha = alpha.ready;
                }
            }

        };
        that.onConnected = onConnected;

        var onDisconnected = function (playerId) {

            if (playerId == 0) {
                playerOneConnected = false;
            } else {
                playerTwoConnected = false;
            }

            if (!server) {
                if (playerId == 0) {
                    playerOneText.alpha = alpha.waiting;
                } else {
                    playerTwoText.alpha = alpha.waiting;
                }
            }

        };
        that.onDisconnected = onDisconnected;

        var onReadySync = function (data) {

            if (data) {

                if (data[1] === true) {
                    markPlayerReady(data[0]);
                } else {
                    markPlayerUnready(data[0]);
                }

            }

        };
        that.onReadySync = onReadySync;

        var onScoreChangedSync = function (data) {

            if (data) {
                if (data[0] >= 3 && data[0] <= 9) {
                    score = data[0];

                    if (!server) {
                        scoreText.text = score;
                    }
                }
            }

        };
        that.onScoreChangedSync = onScoreChangedSync;

        var update = function (gameTime) {

        };
        that.update = update;

        var hide = function () {

            if (server) {
                setTimeout(that.hideCompleted.dispatch, 1000);
                return;
            }

            createjs.Tween.get(that.container, { override: true })
                    .to({ alpha: 0 }, 1500, createjs.Ease.circOut)
                    .call(that.hideCompleted.dispatch);

        };
        that.hide = hide;

        var reset = function (player) {

            markPlayerUnready(0);
            markPlayerUnready(1);

            if (server) {
                return;
            }

            playerOneText.alpha = alpha.waiting;
            playerTwoText.alpha = alpha.waiting;
            that.container.alpha = 1;

        };
        that.reset = reset;

        return that;
    };

    return {
        create: create
    };

});