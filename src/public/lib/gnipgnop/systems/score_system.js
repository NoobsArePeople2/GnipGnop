define(function(require) {

    var system      = require('../core/system')
      , ComponentId = require('../components/component_id')
      , GameInfo    = require('../core/game_info');

    var create = function (spec) {

        var that = system.create(spec);
        that.entityId = ComponentId.PHYSICS;

         var update = function (gameTime, entity) {

            // console.log("[render_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var phys = entity.getComponentById(ComponentId.PHYSICS);

            if (phys.velocity.reset) {
                phys.velocity.reset();
            } else {
                phys.velocity = 0;
            }

        };
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});