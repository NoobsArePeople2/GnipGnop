define([ '../core/system', '../components/component_id' ], function(system, ComponentId) {

    var create = function(spec) {

        var that = system.create(spec);

        that.entityId = ComponentId.POSITION | ComponentId.DEBUG_DRAW;

        var update = function (gameTime, entity) {

            // console.log("[render_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var pos  = entity.getComponentById(ComponentId.POSITION);
            var draw = entity.getComponentById(ComponentId.DEBUG_DRAW);

            draw.setPosition(pos.position.x, pos.position.y);

        };
        that.update = update;

        return that;

    }

    return {
        create: create
    };

});