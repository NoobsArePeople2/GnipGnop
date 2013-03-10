var game_info_path = '';
if (typeof window === 'undefined') {
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    game_info_path = "gnipgnop/core/game_info";
}

define([ '../core/system', '../components/component_id', '../input/input',
          game_info_path ],
function( system, ComponentId, Input,
          GameInfo ) {

    var create = function (spec) {

        var that = system.create(spec);

        that.entityId = ComponentId.INPUT;

        var update = function (gameTime, entity) {

            if ((entity.systemId & that.entityId) !== that.entityId) {
                // No matchy
                return;
            }

            var input = entity.getComponentById(ComponentId.INPUT);
            // GameInfo.log("[input_system] entity.id: " + entity.id);
            input.updateInput(Input.getKeyboard(entity.id));

        };
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});