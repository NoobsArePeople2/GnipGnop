define(function(require) {

    var ping = require('../net/ping');

    var create = function (spec) {

        spec = spec || {};
        var that = {};

        var messenger
          , socket;

        var thePing = ping.create(spec);

        var setConnection = function (theSocket, theMessenger) {
            socket = theSocket;
            messenger = theMessenger;
            thePing.setConnection(theSocket, theMessenger);
        };
        that.setConnection = setConnection;

        var onPing = function (data) {

            thePing.update(data);

        };
        that.onPing = onPing;

        var getAveragePing = function () {

            return thePing.average;

        };
        that.getAveragePing = getAveragePing;

        var getMostRecentPing = function () {

            return thePing.mostRecent();

        };
        that.getMostRecentPing = getMostRecentPing;

        return that;

    };

    return {
        create: create
    };

});