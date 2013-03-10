var talk_path = '';
var signals_path = '';
if (typeof window === 'undefined') {
    talk_path = "public/lib/talk";
    signals_path = 'signals';
} else {
    talk_path = "../lib/talk.js";
    signals_path = '../signals';
}

define([ './entities/player', './screens/play_screen', './screens/debug_screen', './core/game_time',
          talk_path, './input/input_buffer', './net/network', './core/game_info', './net/message_buffer',
          './input/keyboard', './input/input', signals_path, './net/client' ],
function( player, play_screen, debug_screen, game_time,
          Talk, InputBuffer, Network, GameInfo, MessageBuffer,
          keyboard, Input, Signal, client ) {

    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    }

    var MAX_PLAYERS = 2
      , MIN_PLAYERS = 2;

    var FRAME_TIME = 1 / 60
      // , SIM_TIME = 1 / 60
      , SIM_TIME = 1 / 100
      , FRAME_TIME_MS = FRAME_TIME * 1000;

    var players = []
      , numPlayers = 0;

    var CHECK_LATENCY = 3; // seconds
    var accumulator = 0
      , rtt = 0
      , gameTime;


    var socket = null
      , messenger = null;

    var numTicks = 0
      , numTicksTilSync = 20;

    var ready = [ false, false ];

    var create = function(theStage) {

        var that = {};

        stage = theStage;

        that.onPlayerConnected = new Signal();
        that.onPlayerDisconnected = new Signal();

        GameInfo.game(that);

        Input.setKeyboards([ keyboard.create(), keyboard.create() ]);

        gameTime = game_time.create({ frameTime: FRAME_TIME, simTime: SIM_TIME });

        InputBuffer.setGameTime(gameTime);
        // Latency.setGameTime(gameTime);
        // Latency.setCheckPeriod(CHECK_LATENCY);
        var clientSpec = { gameTime: gameTime, checkPeriod: CHECK_LATENCY };
        // GameInfo.log("[game] setting clients", GameInfo.LOG_CONSOLE);
        Network.setClients([ client.create(clientSpec), client.create(clientSpec) ]);

        that.screens = [];
        that.screens.push(play_screen.create({ stage: stage }));
        that.currentScreen = 0;

        if (!server) {
            that.debug_screen = debug_screen.create({ stage: stage });
        }

        var setConnection = function (theSocket, theMessenger) {
            socket = theSocket;
            messenger = theMessenger;

            // Latency.setConnection(socket, messenger);
            Network.getClient(0).setConnection(socket, messenger);
            Network.getClient(1).setConnection(socket, messenger);
        }
        that.setConnection = setConnection;

        var tickServer = function () {

            gameTime.update();
            accumulator += gameTime.elapsed;
            while (accumulator >= gameTime.simTime) {
                that.screens[that.currentScreen].update(gameTime);
                accumulator -= gameTime.simTime;
            }

            // numTicks++;
            // if (numTicks == numTicksTilSync) {
            //     numTicks = 0;
                that.sendMessageToAllClients(
                    messenger.compose(
                        Talk.Message.SYNC_STATE,
                        that.screens[that.currentScreen].syncState()
                    )
                );
            // }

            Input.updateKeyboards(gameTime);
        };
        that.tickServer = tickServer;

        var onKeyDown = function(e) {
            // GameInfo.log("[game] onKeyDown '" + e.keyCode + "'");
            Input.getKeyboard(GameInfo.localPlayer()).setKeyDown(e.keyCode);
            if (Input.getKeyboard(GameInfo.localPlayer()).wasKeyJustPressed(e.keyCode)) {
                MessageBuffer.addToQueue(e.keyCode, Talk.Message.INPUT, [ Talk.Input.KEY_DOWN, e.keyCode ]);
            }
        };

        var onKeyUp = function(e) {
            // GameInfo.log("[game] onKeyUp '" + e.keyCode + "'");
            Input.getKeyboard(GameInfo.localPlayer()).clearKeyDown(e.keyCode);
            MessageBuffer.addToQueue(e.keyCode, Talk.Message.INPUT, [ Talk.Input.KEY_UP, e.keyCode ]);
        }

        var setKeyDown = function(id, keyCode) {

            // GameInfo.log("[game] setKeyDown: " + id + ", " + keyCode);
            Input.getKeyboard(id).setKeyDown(keyCode);

        };
        that.setKeyDown = setKeyDown;

        var setKeyUp = function(id, keyCode) {

            // GameInfo.log("[game] setKeyUp: " + id + ", " + keyCode);
            Input.getKeyboard(id).clearKeyDown(keyCode);

        };
        that.setKeyUp = setKeyUp;

        if (server) {
            setInterval(tickServer, FRAME_TIME_MS);
            // setInterval(tickServer, 100);
        } else {
            createjs.Ticker.useRAF = true;
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addListener(that);
        }

        var tick = function () {

            gameTime.update();
            accumulator += gameTime.elapsed;
            rtt += gameTime.elapsed;
            while (accumulator >= gameTime.simTime) {
                that.screens[that.currentScreen].update(gameTime);
                accumulator -= gameTime.simTime;
            }

            var numScreens = that.screens.length;
            for (var i = 0; i < numScreens; ++i) {
                that.screens[i].draw();
            }

            if (rtt >= CHECK_LATENCY) {
                rtt = 0;
                onPing([ GameInfo.localPlayer(), null ]);
            }
            if (that.debug_screen) {
                that.debug_screen.measuredFps(createjs.Ticker.getMeasuredFPS().toFixed(2));
            }

            MessageBuffer.sendQueue(socket, messenger);
            Input.updateKeyboards(gameTime);
        };
        that.tick = tick;
        var onPing = function (data) {
            Network.onPing(data);
            // Latency.update(data);
            // Latency.queue(data);
            if (that.debug_screen) {
                // that.debug_screen.ping(Latency.average.toFixed(2));
                var client = Network.getClient(GameInfo.localPlayer());
                if (client) {
                    that.debug_screen.ping(client.getAveragePing().toFixed(2));
                }
            }
        }
        that.onPing = onPing;

        var getPlayerId = function (numPlayers) {

            var id = numPlayers;
            for (var i = 0; i < numPlayers; ++i) {
                if (players[i].id == id) {

                    GameInfo.log("[game] id '" + id + "' already in use.");
                    i = 0;
                    id++;

                    if (id >= MAX_PLAYERS) {
                        id = 0;
                    }
                }
            }

            return id;

        };

        var getPlayer = function (id) {

            for (var i = 0; i < numPlayers; ++i) {
                if (players[i] && players[i].id == id) {
                    return players[i];
                }
            }

            return null;
        };
        that.getPlayer = getPlayer;

        var playerConnected = function (data, isLocal) {

            var len = players.length;
            if (len == MAX_PLAYERS) {
                GameInfo.log("[game] Cannot connect more than " + MAX_PLAYERS + " players.")
                return null;
            }

            GameInfo.log("[game] adding player");

            var id
              , name
              , color;

            if (data) {
                id    = data[1];
                name  = data[2];
                color = data[3];
            } else {
                id    = getPlayerId(len);
                name  = "Player" + id;
                color = GameInfo.colors[id];
            }

            var p = player.create({
                name: name,
                id: id,
                color: color
            });
            players.push(p);
            numPlayers++;

            if (!server && isLocal) {
                GameInfo.localPlayer(p.id);
            }

            that.onPlayerConnected.dispatch(p);

            GameInfo.log("[game] added player: " + p.toString(), GameInfo.LOG_CONSOLE);

            return p;

        };
        that.playerConnected = playerConnected;

        var initializeInput = function (playerId) {
            window.onkeyup = onKeyUp;
            window.onkeydown = onKeyDown;

            var kb = Input.getKeyboard(playerId);
            kb.isLocal = true;
        };
        that.initializeInput = initializeInput;

        var playerDisconnected = function (id) {

            var len = players.length;
            for (var i = 0; i < len; ++i) {
                if (players[i].id == id) {
                    GameInfo.log ( "[game] 'Player" + id + "' disconnected");
                    var p = players.splice(i, 1)[0];
                    that.onPlayerDisconnected.dispatch(p);
                    numPlayers--;
                    return p;
                }
            }
            GameInfo.log ( "[game] 'Player" + id + "' could not be found to disconnect");
            return null;

        };
        that.playerDisconnected = playerDisconnected;

        var syncPlayers = function (data) {
            if (!data) {
                var arr = [];
                for (var i = 0; i < numPlayers; ++i) {
                    arr.push(players[i].sync());
                }
                return arr;
            } else {

            }
        };
        that.syncPlayers = syncPlayers;

        var syncState = function (data) {
            if (!data) {
                return that.screens[that.currentScreen].syncState();
            } else {
                that.screens[that.currentScreen].syncState(data);
            }
        };
        that.syncState = syncState;

        var syncServed = function (data) {

            that.screens[that.currentScreen].syncServed(data);

        };
        that.syncServed = syncServed;

        var syncScored = function (data) {

            that.screens[that.currentScreen].syncScored(data);

        };
        that.syncScored = syncScored;

        var syncScoreComplete = function (data) {

            that.screens[that.currentScreen].syncScoreComplete(data);

        };
        that.syncScoreComplete = syncScoreComplete;

        var syncReady = function (data) {

            ready[data[0]] = data[1];
            that.screens[that.currentScreen].syncReady(data);

            return ready[0] && ready[1];

        };
        that.syncReady = syncReady;

        var syncScoreChanged = function (data) {

            that.screens[that.currentScreen].syncScoreChanged(data);

        };
        that.syncScoreChanged = syncScoreChanged;

        var play = function () {

            that.screens[that.currentScreen].play();

        };
        that.play = play;

        var addEntityBySync = function (ent) {
            that.screens[that.currentScreen].addEntityBySync(ent);
        };
        that.addEntityBySync = addEntityBySync;

        var reset = function () {

            console.log("[game] resetting");
            ready[0] = false;
            ready[1] = false;

        };
        that.reset = reset;

    }

    return {
        create: create
    };

});
