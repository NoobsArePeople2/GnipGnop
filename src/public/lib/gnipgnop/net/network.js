define(function(require) {

    var GameInfo = require('../core/game_info');

    var Network = function () {

        var that = {};

        var clients
          , numClients = 0;

        var server = false;
        if (typeof window === 'undefined') {
            server = true;
        }

        var setClients = function (cls) {
            clients = cls;
            numClients = clients.length;
        };
        that.setClients = setClients;

        var getClient = function (index) {
            return clients[index];
        };
        that.getClient = getClient;

        var onPing = function (data) {

            var client = that.getClient(data[0]);
            if (client) {
                client.onPing(data[1]);
            }

        };
        that.onPing = onPing;

        return that;

    }();

    return Network;

});