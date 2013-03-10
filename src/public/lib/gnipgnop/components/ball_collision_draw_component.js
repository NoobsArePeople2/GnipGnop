define(function(require) {

    var game_info_path = '';
    if (typeof window === 'undefined') {
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        game_info_path = "gnipgnop/core/game_info";
    }

    var component = require('../core/component')
      , ComponentId = require('../components/component_id')

      , GameInfo = require(game_info_path);

    var create = function(spec) {

        spec = spec || {};
        spec.name = "ball_collision_draw_component";
        spec.reg = spec.reg || "topLeft";

        var that = component.create(spec);
        that.id = ComponentId.DEBUG_DRAW;

        var stroke = spec.stroke || 5;
        var effects = [];
        var numEffects = spec.numEffects || 1;
        that.effects = effects;

        that.color = spec.color;

        var createEffects = function () {
            for (var i = 0; i < numEffects; ++i) {
                GameInfo.log("[ball_collision_draw_component] Creating effect " + i);
                var circle = new createjs.Shape();
                circle.graphics.setStrokeStyle(stroke);
                circle.graphics.beginStroke(GameInfo.colorTable[that.color].stroke);
                circle.graphics.drawCircle(0, 0, 32);
                circle.alpha = 0;
                circle.x = spec.x || 0;
                circle.y = spec.y || 0;
                circle.scaleX = 0;
                circle.scaleY = 0;
                // circle.compositeOperation = "xor";
                effects.push(circle);
            }
        };

        var setColor = function (color) {

            that.color = color;
            for (var i = 0; i < numEffects; ++i) {
                var circle = effects[i];

                if (circle) {
                    circle.graphics.clear();
                    circle.graphics.setStrokeStyle(stroke);
                    circle.graphics.beginStroke(GameInfo.colorTable[that.color].stroke);
                    circle.graphics.drawCircle(0, 0, 32);
                }
            }

        };
        that.setColor = setColor;

        var update = function (gameTime) {

        };
        that.update = update;

        var setPosition = function (x, y) {

            for (var i = 0; i < numEffects; ++i) {
                var fx = effects[i];
                fx.x = x;
                fx.y = y;
            }

        };
        that.setPosition = setPosition;

        var insert = function(cont) {
            GameInfo.log("[ball_collision_draw_component] inserting");
            cont.addChild(that.shape);
            for (var i = 0; i < numEffects; ++i) {
                cont.addChild(effects[i]);
            }
        };
        that.insert = insert;

        var remove = function(cont) {
            GameInfo.log("[ball_collision_draw_component] removing");
            for (var i = 0; i < numEffects; ++i) {
                cont.removeChild(effects[i]);
            }

        };
        that.remove = remove;

        createEffects();

        return that;
    }

    return {
        create: create
    };

});