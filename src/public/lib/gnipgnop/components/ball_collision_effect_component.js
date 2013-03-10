define(function(require) {

    var game_info_path = '';
    if (typeof window === 'undefined') {
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        game_info_path = "gnipgnop/core/game_info";
    }

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id')
      , GameInfo    = require(game_info_path);

    var create = function(spec) {

        spec = spec || {};
        spec.name = "ball_collision_effect_component";

        var that = component.create(spec);
        that.id = ComponentId.EFFECT;

        var playing = false;

        var reset = function (draw) {

            var fx = draw.effects;
            var numFx = fx.length;
            for (var i = 0; i < numFx; ++i) {
                createjs.Tween.removeAllTweens(fx[i]);
                fx[i].scaleX = 0;
                fx[i].scaleY = 0;
            }
            draw.setAlpha(0);

        };
        that.reset = reset;

        var onComplete = function () {

            playing = false;

        };

        var play = function (draw) {

            if (playing) {
                return;
            }

            var fx = draw.effects;
            var numFx = fx.length;
            for (var i = 0; i < numFx; ++i) {
                createjs.Tween.get(fx[i])
                              .to({ scaleX: 0, scaleY: 0, alpha: 0 }, 1, createjs.Ease.linear)
                              .wait(50 * i)
                              .to({ scaleX: 0.5, scaleY: 0.5, alpha: 1 }, 350, createjs.Ease.cubicIn)
                              .to({ scaleX: 1.5, scaleY: 1.5, alpha: 0 }, 350, createjs.Ease.cubicOut)
                              .call(onComplete);
            }

        };
        that.play = play;

        return that;
    }

    return {
        create: create
    };

});