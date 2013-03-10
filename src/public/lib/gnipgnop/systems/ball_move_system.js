var game_info_path = '';
if (typeof window === 'undefined') {
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    game_info_path = "gnipgnop/core/game_info";
}

define(function(require) {

    var system      = require('../core/system')
      , GameInfo    = require(game_info_path)
      , ComponentId = require('../components/component_id');

    var create = function (spec) {

        var that = system.create(spec);

        // that.gameWidth  = GameInfo.gameWidth();
        // that.gameHeight = GameInfo.gameHeight();
        that.gameWidth  = 640;
        that.gameHeight = 480;

        that.entityId = ComponentId.BALL | ComponentId.POSITION | ComponentId.PHYSICS | ComponentId.COLLISION;

        var update = function (gameTime, entity) {

            // console.log("[move_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var cc    = entity.getComponentById(ComponentId.COLLISION);
            var phys  = entity.getComponentById(ComponentId.PHYSICS);
            var pos   = entity.getComponentById(ComponentId.POSITION);

            phys.step(gameTime.simTime, pos, phys, null);

        }
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});