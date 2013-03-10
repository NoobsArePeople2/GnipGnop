define(function(require) {

    var entity   = require('../core/entity')
      , EntityId = require('../entities/entity_id')

      , position_component       = require('../components/position_component')
      , ball_collision_effect_component = require('../components/ball_collision_effect_component')
      , ball_collision_draw_component   = require('../components/ball_collision_draw_component');

    var create = function (spec) {

        var spec = spec || {};
        var that = entity.create(spec);

        that.name = "ball_collision_effect";
        that.id = EntityId.BALL_COLLISION_EFFECT;

        that.addComponent(position_component.create(
            {
                x: spec.x,
                y: spec.y
            })
        );

        that.addComponent(ball_collision_effect_component.create(
            {

            })
        );

        that.addComponent(ball_collision_draw_component.create(
            {
                stroke: 8,
                numEffects: 4,
                x: spec.x,
                y: spec.y,
                color: "blue"
            })
        );

        var reset = function (x, y, color) {

            that.getComponent("position_component").position.reset(x, y);

            if (color) {
                that.getComponent("ball_collision_draw_component").setColor(color);
            }
            that.getComponent("ball_collision_effect_component").play(that.getComponent("ball_collision_draw_component"));

        };
        that.reset = reset;

        return that;

    };

    return {
        create: create
    };

});