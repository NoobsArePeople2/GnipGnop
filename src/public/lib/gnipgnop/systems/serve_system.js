define(function(require) {

    var system = require('../core/system')
      , ComponentId = require('../components/component_id')
      , GameInfo    = require('../core/game_info');

    var create = function (spec) {

        var that = system.create(spec);
        that.entityId = ComponentId.SERVE | ComponentId.POSITION | ComponentId.INPUT | ComponentId.PHYSICS;

        var update = function (gameTime, entity) {

            // console.log("[render_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var pos     = entity.getComponentById(ComponentId.POSITION);
            var sc      = entity.getComponentById(ComponentId.SERVE);
            var ballPos = sc.ball.getComponentById(ComponentId.POSITION);
            var input   = entity.getComponentById(ComponentId.INPUT)

            // console.log("[serve_system] entity.name '" + entity.name + "'");
            if (entity.name == "Player0") {
                ballPos.position.x = pos.position.x + 30;
            } else {
                ballPos.position.x = pos.position.x - 30;
            }

            ballPos.position.y = pos.position.y;

            if (input.serve) {
                console.log("[serve_system] serving");
                var phys = entity.getComponentById(ComponentId.PHYSICS);
                // entity.removeComponent(sc.name);
                if (entity.name == "Player0") {
                    sc.ball.serve(200, 0);
                } else {
                    sc.ball.serve(-200, 0);
                }
            }

        };
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});