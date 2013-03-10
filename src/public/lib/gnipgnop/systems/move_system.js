var game_info_path = '';
if (typeof window === 'undefined') {
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    game_info_path = "gnipgnop/core/game_info";
}

// define([ '../core/system', game_info_path, '../components/component_id', '../net/latency' ],
// function(system, GameInfo, ComponentId, Latency) {

// define([ '../core/system', game_info_path, '../components/component_id', '../net/latency' ],
// function(system, GameInfo, ComponentId, Latency) {
define(function(require) {

    var system      = require('../core/system')
      , GameInfo    = require(game_info_path)
      , ComponentId = require('../components/component_id')
      // , Latency     = require('../net/latency')
      , Network     = require('../net/network');


    var create = function (spec) {

        var that = system.create(spec);

        // that.gameWidth  = GameInfo.gameWidth();
        // that.gameHeight = GameInfo.gameHeight();
        that.gameWidth  = 640;
        that.gameHeight = 480;

        that.entityId = ComponentId.INPUT | ComponentId.POSITION | ComponentId.PHYSICS;

        var update = function (gameTime, entity) {

            // console.log("[move_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            // var cc    = entity.getComponentById(ComponentId.COLLISION);
            var input = entity.getComponentById(ComponentId.INPUT);
            var phys  = entity.getComponentById(ComponentId.PHYSICS);
            var pos   = entity.getComponentById(ComponentId.POSITION);

            var syncData;

            // if (entity.syncData) {
            if (entity.id == GameInfo.localPlayer()) {

                if (entity.syncBuffer.length > 0) {

                    // console.log("color: " + entity.color);
                    syncData = entity.syncBuffer[entity.syncBuffer.length - 1];

                    // How long did it take the sync message to get here?
                    // var time = Network.getClient(GameInfo.localPlayer()).getMostRecentPing() * 0.001;
                    var time = Network.getClient(GameInfo.localPlayer()).getMostRecentPing();
                    if (isNaN(time)) {
                        time = 0;
                    }
                    // time += 100;
                    time *= 0.001;

                    // Where are we right now?
                    var ox = pos.position.x;
                    var oy = pos.position.y;

                    // Move to the position from the sync message
                    pos.sync(syncData[4]);
                    phys.sync(syncData[5]);

                    // console.log("time: " + time);

                    // Interpolation back to "now" from the sync time
                    // 'ticks' ensures we don't get locked in here for all eternity.
                    // This can happen when a browser or tab loses focus or otherwise
                    // processes at a slower rate.
                    var ticks = 0;
                    while (time >= gameTime.simTime && ticks < 30) {
                        // console.log("updating1..." + time + ", sim time: " + gameTime.simTime);
                        phys.step(gameTime.simTime, pos, phys, input);
                        time -= gameTime.simTime;
                        // console.log("updating2..." + time + ", sim time: " + gameTime.simTime);
                        ticks++;
                    }

                    // Lerp to the original position from above
                    pos.position.lerpTo(ox, oy);
                    entity.syncBuffer = [];

                }

            } else {
                if (entity.syncBuffer.length > 1) {

                    syncData = entity.syncBuffer[entity.syncBuffer.length - 1];
                    var to = syncData[4][1];
                    var distY = to - pos.position.y;
                    var vel = syncData[5][0];
                    var t = distY / vel;

                    createjs.Tween.get(pos.position, { override: true })
                          .to({ y: to }, t, createjs.Ease.cubicInOut);
                    entity.syncBuffer.shift();

                }
            }

            phys.step(gameTime.simTime, pos, phys, input);

        }
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});