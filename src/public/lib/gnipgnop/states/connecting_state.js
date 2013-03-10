define(function(require) {

    var signals_path = '';
    if (typeof window === 'undefined') {
        signals_path = 'signals';
    } else {
        signals_path = '../../signals';
    }

    var state = require('../core/state')

      , Signal = require(signals_path);

    var create = function (spec) {

        spec = spec || {};
        spec.name = "connecting_state";
        var that = state.create(spec);

        that.onExit = new Signal();

        var systems = spec.systems;
        var numSystems = systems.length;
        var connectingScreen;

        var hiding = false
          , hideTime = 0;

        var update = function (gameTime) {

            var entities = that.owner.entities;
            if (!entities) {
                return;
            }
            var numEntities = entities.length;
            for (var i = 0; i < numSystems; ++i) {

                for (var j = 0; j < numEntities; ++j) {
                    systems[i].update(gameTime, entities[j]);
                }

            }

        };
        that.update = update;

        var enter = function (machine) {

            that.machine = machine;
            connectingScreen = that.owner.screens["connecting"];

            connectingScreen.reset();
            that.owner.onConnected.add(connectingScreen.onConnected);
            that.owner.onDisconnected.add(connectingScreen.onDisconnected);
            that.owner.onReadySynced.add(connectingScreen.onReadySync);
            that.owner.onScoreChangeSynced.add(connectingScreen.onScoreChangedSync);

            that.owner.addSubscreen(connectingScreen);

        };
        that.enter = enter;

        var onHideComplete = function () {

            that.owner.removeSubscreen(connectingScreen);
            connectingScreen = null;
            that.onExit.dispatch();

        };

        var exit = function () {

            that.machine = null;

            that.owner.onConnected.remove(connectingScreen.onConnected);
            that.owner.onDisconnected.remove(connectingScreen.onDisconnected);
            that.owner.onReadySynced.remove(connectingScreen.onReadySync);
            that.owner.onScoreChangeSynced.remove(connectingScreen.onScoreChangedSync);

            connectingScreen.hideCompleted.add(onHideComplete);
            connectingScreen.hide();

            // that.owner.removeSubscreen(connectingScreen);
            // connectingScreen = null;

        };
        that.exit = exit;

        return that;

    }

    return {
        create: create
    };

});