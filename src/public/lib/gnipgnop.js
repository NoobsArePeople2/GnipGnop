requirejs.config({

    baseUrl: 'lib/client',

    shim: {
        easel: {
            exports: 'createjs'
        },

        // tween: {
        //     deps: ['easel'],
        //     exports: 'Tween'
        // },

        // ease: {
        //     deps: ['easel', 'tween'],
        //     exports: 'Ease'
        // }
    },

    paths: {
        gnipgnop: '../gnipgnop',
        wtf:      '../',
        easel:    'easel.0.6.0'
        // tween:    'tween',
        // ease:     'ease'
    }

});

var dev = false;

require([ 'gnipgnop/game', 'gnipgnop/net/messenger',
          '../lib/talk.js', 'gnipgnop/core/game_info',
          'gnipgnop/entities/entity_id', 'easel' ],
function( Game, messenger,
          Talk, GameInfo,
          EntityId ) {

        var socket
          , isBinary
          , http
          , host
          , port
          , stage;

        stage = new createjs.Stage("canvas");
        // Snap to pixels for "snappy" performance
        stage.snapToPixel = true;
        // Use touch events on devices that allow it.
        // Gives a significant performance boost on iPad3/iOS6
        createjs.Touch.enable(stage);
        var game = Game.create(stage);
        game = GameInfo.game();

        http = window.location.protocol;
        host = window.location.hostname;
        port = window.location.port;

        // When all else fails
        window.onerror = function(errorMsg, url, lineNumber) {
            var err = "'" + errorMsg + "'' at " + url + " on " + lineNumber;
            // GameInfo.log("[ERROR] " + err);
            alert(err);
        }

        GameInfo.setLog(document.getElementById("log"));
        GameInfo.stage(stage);
        GameInfo.game(game);

        // Don't allow the user to move the viewport
        document.ontouchmove = function(e){
            e.preventDefault();
        }

        var missingReq = false;
        if (!Modernizr.canvas) {
            document.getElementById("errors").style.display = "block";
            document.getElementById("game_wrapper").style.display = "none";
            document.getElementById("err_canvas").style.display = "block";
            missingReq = true;
        }

        if (!Modernizr.websockets) {
            document.getElementById("errors").style.display = "block";
            document.getElementById("game_wrapper").style.display = "none";
            document.getElementById("err_websocket").style.display = "block";
            missingReq = true;
        }

        if (missingReq) {
            return;
        }

        socket = new WebSocket("ws://" + host + ":" + port);
        socket.isBinary = false;
        isBinary = typeof ArrayBuffer !== 'undefined' && typeof socket.binaryType !== 'undefined' && !Modernizr.touch;
        if (isBinary) {
            socket.binaryType = 'arraybuffer';
        }

        socket.onopen = function () {
            messenger.send(socket, messenger.compose(Talk.Message.CONNECT, [ isBinary ]));
        }

        socket.onerror = function(message) {
            GameInfo.log("[gnipgnop] onerror: " + message);
        }

        socket.onclose = function(message) {
            GameInfo.log("[gnipgnop] onclose: " + message);
        }

        socket.onmessage = function(message) {

            var msg = messenger.read(message.data);
            var code = msg[0];
            var data = msg[1];

            // GameInfo.log("[gnipgnop] code: " + code);

            switch (code)
            {
                case Talk.Message.INPUT:

                    // GameInfo.log("[gnipgnop] syncing input");
                    if (data[0] == Talk.Input.KEY_DOWN) {
                        game.setKeyDown(data[2], data[1]);
                    } else if (data[0] == Talk.Input.KEY_UP) {
                        game.setKeyUp(data[2], data[1]);
                    }

                    break;

                case Talk.Message.SYNC_STATE:

                    // GameInfo.log("[gnipgnop] syncing state");
                    game.syncState(data);
                    break;

                case Talk.Message.SYNC_PLAYERS:

                    // GameInfo.log("[gnipgnop] syncing players");
                    game.syncPlayers(data);

                    break;

                case Talk.Message.RTT:

                    // GameInfo.log("[gnipgnop] onPing");
                    game.onPing(data);
                    break;

                case Talk.Message.SERVED:

                    game.syncServed(data);
                    break;

                case Talk.Message.SCORED:

                    game.syncScored(data);
                    break;

                case Talk.Message.SCORE_COMPLETE:

                    game.syncScoreComplete(data);
                    break;

                case Talk.Message.PLAYER_CONNECT:

                    game.setConnection(socket, messenger);

                    GameInfo.log("[gnipgnop] player connect");
                    var player = game.playerConnected(data, true);

                    GameInfo.localPlayer(player.id);
                    game.initializeInput(player.id);
                    var i;

                    // Entities
                    var ents = data[5][1];
                    var len = ents.length;
                    for (i = 0; i < len; ++i) {
                        var ent = ents[i];
                        if (ent && ent[0] != EntityId.PADDLE) {
                            game.addEntityBySync(ent);
                        }
                    }

                    // Players
                    len = data[4].length;
                    for (i = 0; i < len; ++i) {
                        var player = data[4][i];
                        if (player && player[1] != GameInfo.localPlayer()) {
                            game.playerConnected(data[4][i]);
                        }
                    }

                    break;

                case Talk.Message.NEW_PLAYER:

                    GameInfo.log("[gnipgnop] new player!");
                    var player = game.playerConnected(data);

                    break;

                case Talk.Message.BALL_ADDED:

                    GameInfo.log("[gnipgnop] ball added!");
                    game.addEntityBySync(data);

                    break;

                case Talk.Message.PLAY:

                    GameInfo.log("[gnipgnop] play!");
                    game.play();

                    break;

                case Talk.Message.DISCONNECT:

                    GameInfo.log("[gnipgnop] player " + data[0] + " disconnected :(");
                    var player = game.playerDisconnected(data[0]);
                    // Reset ready state for disconnected player
                    game.syncReady([0, false]);
                    game.syncReady([1, false]);

                    break;

                case Talk.Message.CONNECTED:

                    GameInfo.log("[gnipgnop] Received connection confirmation from server. Sending response.");
                    messenger.send(socket, messenger.compose(Talk.Message.CONNECTED, [ data[0] ]));

                    if (data[0] === true) {
                        GameInfo.log("[gnipgnop] Connection confirmed on server, socket is binary.", GameInfo.LOG_CONSOLE);
                        socket.isBinary = true && !Modernizr.touch;
                        socket.binaryType = 'arraybuffer';
                    } else {
                        GameInfo.log("[gnipgnop] Connection confirmed on server, socket is not binary.", GameInfo.LOG_CONSOLE);
                        socket.isBinary = false;
                    }

                    break;

                case Talk.Message.READY:

                    game.syncReady(data);
                    break;

                case Talk.Message.SCORE_CHANGED:

                    game.syncScoreChanged(data);
                    break;

            }

        }

    }
);