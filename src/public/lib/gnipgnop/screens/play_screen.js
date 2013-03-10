var talk_path = '';
var game_info_path = '';
var signals_path = '';
if (typeof window === 'undefined') {
    talk_path = "public/lib/talk";
    game_info_path = "public/lib/gnipgnop/core/game_info";
    signals_path = 'signals';
} else {
    talk_path = "/lib/talk.js";
    game_info_path = "gnipgnop/core/game_info";
    signals_path = '../signals';
}

define(function(require) {

    var screen         = require('../core/screen')
      , InputBuffer    = require('../input/input_buffer')
      , GameInfo       = require(game_info_path)
      , Talk           = require(talk_path)
      , EntityId       = require('../entities/entity_id')
      , MessageBuffer  = require('../net/message_buffer')
      , Signal         = require(signals_path)

      , move_system      = require('../systems/move_system')
      , render_system    = require('../systems/render_system')
      , input_system     = require('../systems/input_system')
      , serve_system     = require('../systems/serve_system')
      , ball_move_system = require('../systems/ball_move_system')
      , collision_system = require('../systems/collision_system')
      , score_system     = require('../systems/score_system')
      , star_system      = require('../systems/star_system')
      , world            = require('../collisions/world')

      , play_screen_state_machine = require('../states/play_screen_state_machine')
      , connecting_state          = require('../states/connecting_state')
      , disconnected_state        = require('../states/disconnected_state')
      , game_over_state           = require('../states/game_over_state')
      , playing_state             = require('../states/playing_state')
      , score_state               = require('../states/score_state')
      , serving_state             = require('../states/serving_state')

      , serve_component = require('../components/serve_component')

      , score_screen      = require('../screens/score_screen')
      , disconnect_screen = require('../screens/disconnect_screen')
      , connecting_screen = require('../screens/connecting_screen')
      , game_over_screen  = require('../screens/game_over_screen')
      , serve_screen      = require('../screens/serve_screen')

      , ground           = require('../entities/ground')
      , ball             = require('../entities/ball')
      , paddle           = require('../entities/paddle')
      , star             = require('../entities/star')
      , ball_fx          = require('../entities/ball_collision_effect')
      , touch_controller = require('../entities/touch_controller');

    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    }

    var create = function(spec) {

        var WAITING_FOR_PLAYERS = 1
          , SERVING             = 2
          , PLAYING             = 3
          , SCORING             = 4
          , GAME_OVER           = 5
          , DISCONNECT          = 6;

        spec = spec || {};
        spec.name = "play_screen";

        var that = screen.create(spec);
        var entities = [];
        var entitiesById = {};
        that.entities = entities;
        var numEntities = 0;
        var numPlayers = 0;

        var scoreToWin = 5
          , scores = [ 0, 0 ];

        that.winner = -1;

        that.world = world.create();

        var systems = {};
        systems["input"]     = input_system.create();
        systems["move"]      = move_system.create();
        systems["render"]    = render_system.create();
        systems["serve"]     = serve_system.create();
        systems["ball_move"] = ball_move_system.create();
        systems["collision"] = collision_system.create( { world: that.world } );
        systems["score"]     = score_system.create();
        systems["star"]      = star_system.create();

        var stateMachine = play_screen_state_machine.create( { owner: that } );
        stateMachine.addState(
            stateMachine.STATE_CONNECTING,
            connecting_state.create( { owner: that, systems: [ systems["collision"], systems["render"] ] } )
        );
        stateMachine.addState(
            stateMachine.STATE_SERVING,
            serving_state.create( { owner: that, systems: [ systems["input"], systems["move"], systems["serve"], systems["collision"], systems["star"], systems["render"] ] } )
        );
        stateMachine.addState(
            stateMachine.STATE_PLAYING,
            playing_state.create( { owner: that, systems: [ systems["input"], systems["move"], systems["ball_move"], systems["collision"], systems["star"], systems["render"] ] } )
        );
        stateMachine.addState(
            stateMachine.STATE_SCORED,
            score_state.create( { owner: that, systems: [ systems["score"], systems["star"], systems["render"] ] } )
        );
        stateMachine.addState(
            stateMachine.STATE_GAME_OVER,
            game_over_state.create( { owner: that, systems: [ systems["star"], systems["render"] ] } )
        );
        stateMachine.addState(
            stateMachine.STATE_DISCONNECT,
            disconnected_state.create( { owner: that, systems: [ systems["star"], systems["render"] ] } )
        );

        var serveComponent;

        var subscreens = []
          , numSubscreens = 0;

        that.onConnected    = new Signal();
        that.onDisconnected = new Signal();

        that.onReadySynced       = new Signal();
        that.onScoreChangeSynced = new Signal();

        var screens = [];
        screens["score"]      = score_screen.create();
        screens["disconnect"] = disconnect_screen.create();
        screens["connecting"] = connecting_screen.create();
        screens["game_over"]  = game_over_screen.create();
        screens["serve"]      = serve_screen.create();
        that.screens = screens;

        var stars = [];
        var ballIndex = 0;
        var ballFx = [];

        var onReady = function (playerId, ready) {

            MessageBuffer.addToQueue("ready-" + playerId, Talk.Message.READY, [ ready ]);

        };

        var onScoreChanged = function (score) {

            scoreToWin = score;
            console.log("[play_screen] changing score to " + scoreToWin);
            MessageBuffer.addToQueue("score-changed", Talk.Message.SCORE_CHANGED, [ score ]);

        };

        screens["connecting"].onReady.add(onReady);
        screens["connecting"].onScoreChanged.add(onScoreChanged);

        var createStarField = function (size) {

            if (server || Modernizr.touch) {
                return;
            }

            var cols = GameInfo.stageWidth / size;
            var rows = GameInfo.stageHeight / size;

            var half = size / 2;

            for (var x = 0; x < cols; ++x) {
                for (var y = 0; y < rows; ++y) {
                    var s = star.create(
                        {
                            x: (x * size) + half,
                            y: (y * size) + half,
                            w: 1,
                            h: 1,
                            color: "gray"
                        }
                    );
                    that.addEntity(s);
                }
            }

        };

        var createBallEffects = function (numEffects) {

            if (server) {
                return;
            }

            for (var i = 0; i < numEffects; ++i) {
                var fx = ball_fx.create({ x: -100, y: -100 });
                ballFx.push(fx);
                that.addEntity(fx);
            }

        };

        var touch_controls;
        var addTouchControls = function (paddle, playerId) {

            if (server || !Modernizr.touch) {
                return;
            }

            touch_controls = touch_controller.create( { paddle: paddle, playerId: playerId } );
            that.addEntity(touch_controls);

        };

        var removeTouchControls = function (playerId) {

            if (server || playerId != GameInfo.localPlayer()) {
                return;
            }

            that.removeEntity(touch_controls);

        };

        var onBallCollided = function (x, y, color) {

            if (server) {
                return;
            }
            ballFx[ballIndex].reset(x, y, color);
            ballIndex++;
            if (ballIndex >= ballFx.length) {
                ballIndex = 0;
            }

        };
        systems["collision"].collided.add(onBallCollided);

        var update = function(gameTime) {

            stateMachine.update(gameTime);

            for (var i = 0; i < numSubscreens; ++i) {
                subscreens[i].update(gameTime);
            }

        };
        that.update = update;

        var draw = function() {
            if (that.stage) {
                that.stage.update();
            }
        };
        that.draw = draw;

        var addEntity = function (ent) {
            // console.log("[play_screen] addEntity '" + ent.name + "', " + entities.length);
            entities.push(ent);
            entitiesById[ent.id] = ent;
            numEntities++;
            that.world.addEntity(ent);

            if (that.container) {
                // console.log("[play_screen] adding entity to container");
                ent.insert(that.container);
            }
        };
        that.addEntity = addEntity;

        var removeEntity = function (ent) {
            var len = entities.length;
            for (var i = 0; i < len; ++i) {
                if (ent && entities[i].id == ent.id) {
                    ent = entities.splice(i, 1)[0];
                    delete entitiesById[ent.id];
                    that.world.removeEntity(ent);
                    numEntities--;
                    break;
                }
            }
            if (that.container && ent) {
                // console.log ("[play_screen] removing entity");
                ent.remove(that.container);
            }
        };
        that.removeEntity = removeEntity;

        var addSubscreen = function (sub) {

            // GameInfo.log("[play_screen] addSubscreen '" + sub.name + "'");
            subscreens.push(sub);
            numSubscreens++;

            if (that.stage) {
                that.stage.addChild(sub.container);
            }

        };
        that.addSubscreen = addSubscreen;

        var removeSubscreen = function (sub) {

            var i = numSubscreens - 1;
            while (i > - 1) {

                if (subscreens[i] === sub) {
                    // GameInfo.log("[play_screen] removeSubscreen '" + sub.name + "'");
                    subscreens.splice(i, 1);
                    numSubscreens--;
                    if (that.stage) {
                        that.stage.removeChild(sub.container);
                    }
                }
                --i;
            }

        };
        that.removeSubscreen = removeSubscreen;

        var onPlayerConnected = function (player) {
            GameInfo.log("[play_screen] onPlayerConnected");

            numPlayers++;

            var getX = function (id) {
                if (id == 0) {
                    return 0;
                } else if (id == 1) {
                    return 640;
                }
            };

            var getY = function (id) {
                return 480 / 2
            };

            GameInfo.log("[play_screen] player: " + player.toString());

            var pad = paddle.create({
                name:  player.name,
                id:    player.id,
                color: player.color,
                x:     getX(player.id),
                y:     getY(player.id)
            });

            that.addEntity(pad);

            that.onConnected.dispatch(player.id);

            if (player.id == GameInfo.localPlayer()) {
                addTouchControls(pad, GameInfo.localPlayer());
            }

        };

        var onPlayerDisconnected = function (player) {
            GameInfo.log("[play_screen] onPlayerDisconnected");
            removeEntity(player);
            numPlayers--;

            removeEntity(that.theBall);
            removeTouchControls(player);

            that.onDisconnected.dispatch(player.id);

            that.screens["disconnect"].reset(player.name);
            stateMachine.onDisconnect(numPlayers);
        };

        var onBallServed = function () {
            console.log("[play_screen] onBallServed");
            stateMachine.onServe();

            if (server) {
                GameInfo.game().sendMessageToAllClients([Talk.Message.SERVED, []]);
            }
        };

        var onScored = function (playerId) {
            console.log("[play_screen] onScored");
            scores[playerId] += 1;

            that.playerToServe = "Player" + playerId;
            that.setPlayerToServe(that.playerToServe);
            if (!server) {
                var elId = (playerId == 0) ? "player_one_score" : "player_two_score";
                var ticker = document.getElementById(elId);
                ticker.innerHTML = scores[playerId].toString();
            }

            if (server) {
                GameInfo.game().sendMessageToAllClients([Talk.Message.SCORED, [ playerId ]]);
            }

            stateMachine.onScore();
        };

        var scoreComplete = function () {
            console.log("[play_screen] scoreComplete");

            if (server) {
                GameInfo.game().sendMessageToAllClients([Talk.Message.SCORE_COMPLETE, [ that.playerToServe, scores, scoreToWin ]]);

                console.log("[play_screen] scoreToWin: " + scoreToWin);
                console.log("[play_screen] player one score: " + scores[0]);
                console.log("[play_screen] player two score: " + scores[1]);

                if (scores[0] >= scoreToWin) {
                    that.winner = 0;
                    stateMachine.onGameOver();
                    return;
                } else if (scores[1] >= scoreToWin) {
                    that.winner = 1;
                    stateMachine.onGameOver();
                    return;
                }

            }

            stateMachine.onScoreComplete();
        };
        that.scoreComplete = scoreComplete;

        var createBall = function (data) {

            var x
              , y
              , r
              , color;

            if (!data) {
                x = 640 / 2;
                y = 480 / 2;
                r = 10;
                color = 'green';
            }

            that.theBall = ball.create( { x: x, y: y, r: r, color: color });
            that.theBall.served.add(onBallServed);
            that.theBall.scored.add(onScored);
            that.addEntity(that.theBall);

            return that.theBall;

        };
        that.createBall = createBall;

        var game = GameInfo.game();
        game.onPlayerConnected.add(onPlayerConnected);
        game.onPlayerDisconnected.add(onPlayerDisconnected);

        var start = function () {
            that.started = true;
            that.playerToServe = "Player0";
            serveComponent = serve_component.create( { ball: that.theBall } );
            stateMachine.onStart();
        };
        that.start = start;

        var reset = function () {
            that.started = false;
            scores[0] = 0;
            scores[1] = 0;
            that.winner = -1;
            that.removeEntity(that.theBall);
            if (serveComponent) {
                for (var i = 0; i < numEntities; ++i) {
                    var ent = entities[i];
                    ent.removeComponent(serveComponent.name);
                }
                serveComponent = null;
            }

            GameInfo.game().reset();

            if (!server) {
                var elId = "player_one_score";
                var ticker = document.getElementById(elId);
                ticker.innerHTML = scores[0].toString();

                elID = "player_two_score";
                ticker = document.getElementById(elId);
                ticker.innerHTML = scores[1].toString();
            }

            for (var i = 0; i < numEntities; ++i) {
                entities[i].reset();
            }

        };
        that.reset = reset;

        var setPlayerToServe = function (player) {

            GameInfo.log("[play_screen] setting '" + player + "' to serve", GameInfo.LOG_CONSOLE);
            for (var i = 0; i < numEntities; ++i) {
                var ent = entities[i];
                if (ent.name == player) {
                    ent.addComponent(serveComponent);
                    that.theBall.setColor(ent.color);
                } else {
                    ent.removeComponent(serveComponent.name);
                }
            }

        };
        that.setPlayerToServe = setPlayerToServe;

        var loadLevel = function (level) {

        };
        that.loadLevel = loadLevel;

        var syncState = function (data) {

            var ents;
            if (!data) {
                ents = [];
                for (var i = 0; i < numEntities; ++i) {
                    var ent = entities[i];
                    ents.push(ent.sync());
                }
                return [ stateMachine.stateName, ents ];
            } else {
                ents = data[1];
                var len = ents.length;
                for (var i = 0; i < len; ++i) {
                    var ent = entitiesById[ents[i][1]];
                    if (ent) {
                        ent.sync(ents[i]);
                    }
                }
            }
        };
        that.syncState = syncState;

        var syncServed = function (data) {

            stateMachine.onServe();

        };
        that.syncServed = syncServed;

        var syncScored = function (data) {

            if (data) {

                that.playerToServe = "Player" + data[0];
                stateMachine.onScore();

            }

        };
        that.syncScored = syncScored;

        var syncScoreComplete = function (data) {

            if (data) {
                that.playerToServe = data[0];
                that.setPlayerToServe(data[0]);
                scores[0] = data[1][0];
                scores[1] = data[1][1];
                scoreToWin = data[2];

                if (!server) {
                    var elId = "player_one_score";// : "player_two_score";
                    var ticker = document.getElementById(elId);
                    ticker.innerHTML = scores[0].toString();

                    elId = "player_two_score";
                    ticker = document.getElementById(elId);
                    ticker.innerHTML = scores[1].toString();

                }

                console.log("[play_screen] scoreToWin: " + scoreToWin);
                console.log("[play_screen] player one score: " + scores[0]);
                console.log("[play_screen] player two score: " + scores[1]);


                if (scores[0] >= scoreToWin) {
                    that.winner = 0;
                    stateMachine.onGameOver();
                    return;
                } else if (scores[1] >= scoreToWin) {
                    that.winner = 1;
                    stateMachine.onGameOver();
                    return;
                }

                that.scoreComplete();
            }

        };
        that.syncScoreComplete = syncScoreComplete;

        var syncReady = function (data) {

            that.onReadySynced.dispatch(data);

        };
        that.syncReady = syncReady;

        var syncScoreChanged = function (data) {

            scoreToWin = data[0];
            console.log("[play_screen] syncing score to win: " + scoreToWin);
            that.onScoreChangeSynced.dispatch(data);

        };
        that.syncScoreChanged = syncScoreChanged;

        var play = function () {

            if (!that.started) {
                if (server) {
                    that.createBall();
                    GameInfo.game().sendMessageToAllClients([Talk.Message.BALL_ADDED, that.theBall.sync()]);
                }

                if (that.theBall) {
                    that.start();
                }
            }

        };
        that.play = play;

        var addEntityBySync = function (ent) {

            if (ent[0] == EntityId.BALL) {
                GameInfo.log("[play_screen] Adding ball");
                that.theBall = ball.create( { x: ent[3][0], y: ent[3][1], r: 10, color: 'green' });
                that.theBall.served.add(onBallServed);
                that.theBall.scored.add(onScored);
                that.addEntity(that.theBall);
            }

        };
        that.addEntityBySync = addEntityBySync;

        if (!server) {
            that.container = new createjs.Container();
            that.container.x = 0;
            that.container.y = 0;
            if (that.stage) {
                GameInfo.log("[play_screen] adding container");
                that.stage.addChild(that.container);
            }

            // var theGround = ground.create({name: "ground", id: 1234});
            // addEntity(theGround);

            that.gui = new createjs.Container();
            that.gui.x = 0;
            that.gui.y = 0;
            if (that.stage) {
                GameInfo.log("[play_screen] adding gui container");
                that.stage.addChild(that.gui);
            }

        }

        stateMachine.setState(stateMachine.STATE_CONNECTING);

        createStarField(32);
        createBallEffects(4);

        return that;

    }

    return {
        create: create
    };

});