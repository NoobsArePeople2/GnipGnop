var requirejs = require('requirejs');
requirejs.config({

    baseUrl: __dirname,
    nodeRequire: require

});

requirejs([ 'http', 'express', 'bison', 'optimist', 'os',
            './public/lib/talk', './public/lib/gnipgnop/game', './public/lib/gnipgnop/net/messenger',
            './public/lib/gnipgnop/core/game_info', './public/lib/gnipgnop/entities/entity_id',
            './public/lib/gnipgnop/net/network' ],
function (  http, express, BISON, optimist, os,
            Talk, Game, messenger,
            GameInfo, EntityId,
            Network ) {

    var argv = optimist
                .default('port', '8080')
                .argv;

    console.log("");
    console.log("---------------------------------------------");
    console.log("  Starting Server...");

    var app = express();
    var game = Game.create();

    app.use(express.static(__dirname + '/public'));

    var server = http.createServer(app);
    var port = argv.port;
    server.listen(port);

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }

    // console.log("Listening on port: " + port);
    console.log("  Listening on '" + addresses[0] + ":" + port + "'");
    console.log("  Creating socket server...");

    var WebSocketServer = require('ws').Server
      , wss = new WebSocketServer({ server: server });

    console.log("  Socket server created");
    console.log("---------------------------------------------");
    console.log("");

    var clients = {};

    // Not sure why this is needed....hmmmmm.....
    game = GameInfo.game();
    game.sendMessageToAllClients = sendMessageToAllClients;
    game.clients = clients;
    game.setConnection(null, messenger);

    wss.on("connection", function(ws) {

        console.log("[server] on 'connection'");

        var player = game.playerConnected();
        if (!player) {
            messenger.send(ws, messenger.compose(Talk.Error.SERVER_FULL, null));
            return;
        }

        ws.id = player.id;
        ws.clientId = "client" + ws.id;
        clients[ws.id] = ws;
        console.log("[server] ws.id: " + ws.id);

        var client = Network.getClient(ws.id);
        client.setConnection(ws, messenger);

        ws.on("close", function() {

            if (game.playerDisconnected(ws.id)) {
                console.log("[server] Player '" + ws.id + "' disconnected :(");
                delete clients[this.id];
            }
            sendMessageToAllClients(messenger.compose(Talk.Message.DISCONNECT, [ ws.id ]));

            game.syncReady([ 0, false ]);
            game.syncReady([ 1, false ]);

        });

        ws.on("message", function(message, flags) {

            flags = flags || {};
            flags.socketIsBinary = ws.isBinary;
            var msg = messenger.read(message, flags)
              , code
              , data;
            if (!msg) {
                console.log("[server] message error.")
                // return;
            } else {
                code = msg[0];
                data = msg[1];
            }

            // console.log("[server] code: " + code);

            switch (code) {
                case Talk.Message.INPUT:


                    if (data[0] == Talk.Input.KEY_DOWN) {
                        // console.log("[server] key '" + data[1] + "' down for " + ws.id);
                        game.setKeyDown(ws.id, data[1]);
                    } else if (data[0] == Talk.Input.KEY_UP) {
                        // console.log("[server] key '" + data[1] + "' up for " + ws.id);
                        game.setKeyUp(ws.id, data[1]);
                    }

                    sendMessageToAllClients(messenger.compose(
                        Talk.Message.INPUT,
                        [
                            data[0],
                            data[1],
                            ws.id
                        ]),
                        [ ws.clientId ]
                    );

                    break

                case Talk.Message.RTT:

                    // console.log("[server] rtt");
                    game.onPing(data);
                    messenger.send(ws, messenger.compose(Talk.Message.RTT, [ data[0], data[1] ]));
                    break;

                case Talk.Message.READY:

                    sendMessageToAllClients(messenger.compose(
                        Talk.Message.READY,
                        [
                            ws.id,
                            data[0],
                        ]),
                        [ ws.clientId ]
                    );

                    if (game.syncReady([ ws.id, data[0] ])) {
                        game.play();
                        sendMessageToAllClients(messenger.compose(Talk.Message.PLAY, []));
                    }

                    break;

                case Talk.Message.SCORE_CHANGED:

                    game.syncScoreChanged(data);
                    sendMessageToAllClients(messenger.compose(
                        Talk.Message.SCORE_CHANGED,
                        [
                            data[0]
                        ]),
                        [ ws.clientId ]
                    );
                    break;

                case Talk.Message.CONNECT:

                    if (data[0]) {
                        console.log ( "[server] Socket '" + ws.id + '" is binary.');
                    } else {
                        console.log ( "[server] Socket '" + ws.id + '" is not binary.');
                    }

                    messenger.send(ws, messenger.compose(Talk.Message.CONNECTED, [ data[0] ] ));

                    break;

                case Talk.Message.CONNECTED:

                    ws.isBinary = data[0];
                    ws.binaryType = 'arraybuffer';
                    console.log("[server] client connection confirmed.");
                    if (ws.isBinary) {
                        console.log ( "[server] Socket '" + ws.id + '" set binary.');
                    } else {
                        console.log ( "[server] Socket '" + ws.id + '" not set to binary.');
                    }

                    player = game.getPlayer(ws.id);
                    console.log("[server] sending player connected message");
                    messenger.send(ws,
                        messenger.compose(
                            Talk.Message.PLAYER_CONNECT,
                            [
                                EntityId.PLAYER,                 // 0
                                player.id,                       // 1
                                player.name,                     // 2
                                player.color,                    // 3
                                game.syncPlayers(),              // 4
                                game.syncState()                 // 5
                            ]
                        )
                    );

                    console.log("[server] sending new player message");
                    sendMessageToAllClients(
                        messenger.compose(
                            Talk.Message.NEW_PLAYER,
                            player.sync()
                        ),
                       [ ws.clientId  ]
                    );

                    break;

            }

        });

    });

    function sendMessageToAllClients(message, excludes) {

        // console.log("[server] sending message to all clients");
        if (excludes == null) {
            for (var i in clients) {
                messenger.send(clients[i], message);
            }
        } else {
            for (var i in clients) {
                if (excludes.indexOf(clients[i].clientId) < 0) {
                    messenger.send(clients[i], message);
                }
            }
        }
    }
});