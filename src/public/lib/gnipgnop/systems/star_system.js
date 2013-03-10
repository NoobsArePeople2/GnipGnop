define(function(require) {

    var game_info_path = '';
    if (typeof window === 'undefined') {
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        game_info_path = "gnipgnop/core/game_info";
    }

    var system      = require('../core/system')
      , GameInfo    = require(game_info_path)
      , ComponentId = require('../components/component_id')
      , MathHelper  = require('../util/math_helper');



    var create = function (spec) {

        var that = system.create(spec);

        // that.entityId = ComponentId.DIST_SCALE | ComponentId.POSITION | ComponentId.DEBUG_DRAW;
        that.entityId = ComponentId.MAGNET | ComponentId.POSITION | ComponentId.DEBUG_DRAW;

        var update = function (gameTime, entity) {

            // console.log("[move_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var game = GameInfo.game();
            var theBall = game.screens[game.currentScreen].theBall;
            if (!theBall) {
                return;
            }

            // var ds    = entity.getComponentById(ComponentId.DIST_SCALE);
            var mag   = entity.getComponentById(ComponentId.MAGNET);
            var pos   = entity.getComponentById(ComponentId.POSITION);
            var draw  = entity.getComponentById(ComponentId.DEBUG_DRAW);

            var ballPos  = theBall.getComponentById(ComponentId.POSITION);
            var ballDraw = theBall.getComponentById(ComponentId.DEBUG_DRAW);

            mag.move(
                MathHelper.distSquared(
                    ballPos.position.x,
                    ballPos.position.y,
                    mag.defaultPosition.x,
                    mag.defaultPosition.y
                ),
                pos.position,
                ballPos.position,
                draw,
                ballDraw.color
            );

            // ds.scaleTo(
            //     MathHelper.distSquared(
            //         ballPos.position.x,
            //         ballPos.position.y,
            //         pos.position.x,
            //         pos.position.y
            //     ),
            //     draw,
            //     ballDraw.color
            // );


        }
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});