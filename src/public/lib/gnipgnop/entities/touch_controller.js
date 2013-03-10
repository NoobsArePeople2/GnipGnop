define(function(require) {

    var entity = require('../core/entity')
      , GameInfo = require('../core/game_info')
      , EntityId = require('../entities/entity_id')

      , position_component   = require('../components/position_component')
      , debug_draw_component = require('../components/debug_draw_component')
      , touch_control_component = require('../components/touch_control_component');

    var create = function (spec) {

        spec = spec || {};
        var that = entity.create(spec);
        that.name = "touch_controller";
        that.id = EntityId.TOUCH_CONTROLLER;

        // var x = (spec.playerId == 0) ? 64 : GameInfo.stageWidth - 64
        var x = GameInfo.stageWidth / 2
          , y = GameInfo.stageHeight / 2
          // , w = 128
          , w = GameInfo.stageWidth
          , h = GameInfo.stageHeight
          , c = (spec.playerId == 0) ? "red" : "blue";

        console.log("[touch_controller] x: " + x);

        that.addComponent(touch_control_component.create(
            {
                type: "rectangle",
                x: x,
                y: y,
                w: w,
                h: h,
                // color: c,
                color: "darkGray",
                reg: "center",
                alpha: 0.25,
                paddle: spec.paddle,
                playerId: spec.playerId
            })
        );

        that.addComponent(position_component.create( { x: x, y: y } ));

        return that;

    };

    return {
        create: create
    }

});