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
      , vector2     = require('../geom/vector2');

    var create = function(spec) {

        spec = spec || {};
        spec.name = "distance_scale_component";

        var that = component.create(spec);
        that.id = ComponentId.DIST_SCALE;

        var scale = vector2.create( { x: 1, y: 1 } );
        var dist = 2048;
        var percentCutoff = 0.25;

        var scalingUp = false
          , scalingDown = false;
        var scaleTo = function (distSquared, draw, color) {

            if (!scalingUp && distSquared < dist) {
                scalingUp = true;
                scalingDown = false;
                createjs.Tween.get(scale, { override: true })
                                    .to({ x: 14, y: 14}, 125, createjs.Ease.circOut);

                if (draw.color != color) {
                    draw.setColor(color);
                }
            } else if (!scalingDown && distSquared > dist) {
                scalingDown = true;
                scalingUp = false;
                createjs.Tween.get(scale, { override: true })
                                    .to({ x: 1, y: 1}, 1000, createjs.Ease.circInOut);

            }

            var percent = scale.x / 16;
            if (percent <= 0) {
                percent = 0.1;
            } else if (percent >= percentCutoff) {
                percent = percentCutoff;
            }
            draw.setAlpha(percent);
            draw.setScale(scale.x, scale.y);

        };
        that.scaleTo = scaleTo;

        return that;
    }

    return {
        create: create
    };

});