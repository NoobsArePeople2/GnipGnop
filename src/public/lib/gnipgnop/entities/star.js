define(function(require) {

    var entity   = require('../core/entity')
      , EntityId = require('../entities/entity_id')

      , position_component       = require('../components/position_component')
      , distance_scale_component = require('../components/distance_scale_component')
      , magnet_component         = require('../components/magnet_component')
      , debug_draw_component     = require('../components/debug_draw_component');

    var create = function (spec) {

        var spec = spec || {};
        var that = entity.create(spec);

        that.name = "star";
        that.id = EntityId.STAR;

        that.addComponent(position_component.create(
            {
                x: spec.x,
                y: spec.y
            })
        );

        that.addComponent(magnet_component.create(
            {
                x: spec.x,
                y: spec.y
            })
        );

        if (!server) {
            that.addComponent(debug_draw_component.create(
                {
                    type: "circle",
                    x: spec.x,
                    y: spec.y,
                    w: spec.w,
                    h: spec.h,
                    r: spec.w,
                    color: spec.color,
                    reg: "center",
                    alpha: 0.1,
                    stroke: 0
                })
            );
            that.getComponent("debug_draw_component").setAlpha(0.25);
        }

        var reset = function () {

            that.getComponent("debug_draw_component").setColor(spec.color);

        };
        that.reset = reset;

        return that;

    };

    return {
        create: create
    };

});