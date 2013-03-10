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
        spec.name = "debug_draw_component";
        spec.reg = spec.reg || "topLeft";

        var that = component.create(spec);
        that.id = ComponentId.DEBUG_DRAW;

        that.shape = new createjs.Shape();
        that.shape.x = spec.x || 0;
        that.shape.y = spec.y || 0;

        that.color = spec.color;

        var type = spec.type;
        var w   = spec.w
          , h   = spec.h
          , r   = spec.r
          , reg = spec.reg
          , a   = spec.alpha
          , stroke = spec.stroke || 1;

        var setColor = function (color) {

            that.color = color;
            that.shape.graphics.clear();
            if (type == "circle") {
                that.shape.graphics
                    .setStrokeStyle(stroke)
                    .beginStroke(GameInfo.colorTable[color].stroke)
                    .beginFill(GameInfo.colorTable[color].fill)
                    .drawCircle(0, 0, r);
            } else if (type == "rectangle") {
                that.shape.graphics
                    .setStrokeStyle(1, "square")
                    .beginStroke(GameInfo.colorTable[color].stroke)
                    .beginFill(GameInfo.colorTable[color].fill)
                    .drawRect(
                        0, 0,
                        w, h

                    );

                that.shape.alpha = a;
                if (reg == "center") {
                    that.shape.regX = w / 2;
                    that.shape.regY = h / 2;
                }
            }

        };
        that.setColor = setColor;
        that.setColor(that.color);

        var setAlpha = function (alpha) {
            a = alpha;
            that.shape.alpha = a;
        };
        that.setAlpha = setAlpha;

        var setScale = function (sx, sy) {
            that.shape.scaleX = sx;
            that.shape.scaleY = sy;
        };
        that.setScale = setScale;

        var update = function (gameTime) {

        };
        that.update = update;

        var insert = function(cont) {
            // console.log("[debug_draw_component] inserting");
            cont.addChild(that.shape);
        };
        that.insert = insert;

        var remove = function(cont) {
            // console.log("[debug_draw_component] removing");
            cont.removeChild(that.shape);
        };
        that.remove = remove;

        var setPosition = function (x, y) {

            that.shape.x = x;
            that.shape.y = y;

        };
        that.setPosition = setPosition;

        var clickHandler = function (handler) {
            that.shape.onClick = handler;
        };
        that.clickHandler = clickHandler;

        var toString = function() {
            return "[debug_draw_component] pos: " + that.shape.x + ", " + that.shape.y + ", color: " + that.color;
        };
        that.toString = toString;

        return that;
    }

    return {
        create: create
    };

});