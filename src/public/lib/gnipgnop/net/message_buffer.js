define(function() {

    var MessageBuffer = function () {

        var that = {};

        var index = 0;
        var queue = {};
        var addToQueue = function(key, msgType, msg) {

            if (!key) {
                key = "key-" + index;
                index++;
            }

            queue[key] = [ msgType, msg ];
        };
        that.addToQueue = addToQueue;

        var sendQueue = function (socket, messenger) {

            if (!socket || !messenger) {
                return;
            }

            // console.log("[message_buffer] typeof socket: " + typeof socket);

            for (var key in queue) {
                if (queue[key]) {
                    var msg = queue[key];
                    messenger.send(socket, messenger.compose(msg[0], msg[1]));
                    queue[key] = null;
                }
            }
            index = 0;

        };
        that.sendQueue = sendQueue;

        // var sendQueueToClients = function (clients, messenger) {

        //     if (!clients || !messenger) {
        //         return;
        //     }

        //     for (var key in queue) {
        //         if (queue[key]) {
        //             var msg = queue[key];
        //             console.log("[message_buffer] sending message '" + key + "'");
        //             var m = messenger.compose(msg[0], msg[1]);
        //             for (var i in clients) {
        //                 console.log("[message_buffer] client '" + i + "', '" + m[0] + "'");
        //                 messenger.send(clients[i], m);
        //             }
        //             queue[key] = null;
        //         }
        //     }
        //     index = 0;
        // };
        // that.sendQueueToClients = sendQueueToClients;

        return that;

    }();

    return MessageBuffer;

});