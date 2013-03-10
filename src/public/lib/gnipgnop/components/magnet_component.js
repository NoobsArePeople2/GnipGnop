define(function(require) {

    var game_info_path = '';
    if (typeof window === 'undefined') {
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        game_info_path = "gnipgnop/core/game_info";
    }

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id')
      , GameInfo    = require(game_info_path)
      , vector2     = require('../geom/vector2')
      , MathHelper  = require('../util/math_helper');

    var create = function(spec) {

        spec = spec || {};
        spec.name = "magnet_component";

        var that = component.create(spec);
        that.id = ComponentId.MAGNET;

        var defaultPosition = vector2.create( { x: spec.x, y: spec.y } );
        that.defaultPosition = defaultPosition;
        var position = vector2.create( { x: spec.x, y: spec.y } );

        var dist = 2048;

        var magnetized   = false
          , unmagnetized = false;
        var move = function (distSquared, pos, ballPos, draw, color) {

            if (distSquared < dist) {

                unmagnetized = false;
                position.lerpTo(ballPos.x, ballPos.y, 0.1);
                if (draw.color != color) {
                    draw.setColor(color);
                }

            } else if (!unmagnetized && distSquared > dist) {
                unmagnetized = true;
                createjs.Tween.get(position, { override: true })
                                    .to({ x: defaultPosition.x, y: defaultPosition.y}, 1000, createjs.Ease.bounceOut);

            }

            pos.x = position.x;
            pos.y = position.y;

        };
        that.move = move;

        return that;
    }

    return {
        create: create
    };

});