define(function(require) {

    var debug_draw_component = require('../components/debug_draw_component')
      , vector2 = require('../geom/vector2')

      , ComponentId = require('../components/component_id')

      , Input = require('../input/input')
      , Keys  = require('../input/keys')

      , GameInfo = require('../core/game_info')

      , MessageBuffer = require('../net/message_buffer')
      , Talk          = require('../../../lib/talk.js');

    var create = function (spec) {

        spec = spec || {};
        var that = debug_draw_component.create(spec);
        that.id = ComponentId.TOUCH_CONTROL;

        var mousePos     = vector2.create( { x: -9999, y: -9999 } );
        var prevMousePos = vector2.create( { x: -9999, y: -9999 } );

        var delta = vector2.create( { x: 0, y: 0 } );

        that.position = mousePos;
        var touching = false;

        var serveDelta = 16;
        var pc = spec.paddle.getComponentById(ComponentId.POSITION);

        var computeInput = function () {

            var kb = Input.getKeyboard(spec.playerId);
            if (kb) {

                if (touching) {

                    if (mousePos.y < pc.position.y) {

                        if (!kb.isKeyDown(Keys.ARROW_UP)) {
                            if (kb.isKeyDown(Keys.ARROW_DOWN)) {
                                kb.clearKeyDown(Keys.ARROW_DOWN);
                                MessageBuffer.addToQueue(Keys.ARROW_DOWN, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.ARROW_DOWN ]);
                            }

                            kb.setKeyDown(Keys.ARROW_UP);
                            MessageBuffer.addToQueue(Keys.ARROW_UP, Talk.Message.INPUT, [ Talk.Input.KEY_DOWN, Keys.ARROW_UP ]);

                        }

                    } else if (mousePos.y > pc.position.y) {
                        if (!kb.isKeyDown(Keys.ARROW_DOWN)) {
                            if (kb.isKeyDown(Keys.ARROW_UP)) {
                                kb.clearKeyDown(Keys.ARROW_UP);
                                MessageBuffer.addToQueue(Keys.ARROW_UP, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.ARROW_UP ]);
                            }

                            kb.setKeyDown(Keys.ARROW_DOWN);
                            MessageBuffer.addToQueue(Keys.ARROW_DOWN, Talk.Message.INPUT, [ Talk.Input.KEY_DOWN, Keys.ARROW_DOWN ]);
                        }
                    }

                    if (spec.playerId == 0 && delta.x > serveDelta) {
                        if (!kb.isKeyDown(Keys.SPACE)) {
                            kb.clearKeyDown(Keys.SPACE);
                            MessageBuffer.addToQueue(Keys.SPACE, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.SPACE ]);
                        }
                    } else if (spec.playerId == 1 && delta.x < -serveDelta) {
                        if (!kb.isKeyDown(Keys.SPACE)) {
                            kb.clearKeyDown(Keys.SPACE);
                            MessageBuffer.addToQueue(Keys.SPACE, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.SPACE ]);
                        }
                    }

                } else {
                    kb.clearKeyDown(Keys.ARROW_UP);
                    kb.clearKeyDown(Keys.ARROW_DOWN);

                    MessageBuffer.addToQueue(Keys.ARROW_UP, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.ARROW_UP ]);
                    MessageBuffer.addToQueue(Keys.ARROW_DOWN, Talk.Message.INPUT, [ Talk.Input.KEY_UP, Keys.ARROW_DOWN ]);
                }

            }

        };

        var onTouchDown = function (e) {

            touching = true;
            if (prevMousePos.x == -9999 && prevMousePos.y == -9999) {
                prevMousePos.reset(e.stageX, e.stageY);
            } else {
                prevMousePos.reset(mousePos.x, mousePos.y);
            }
            mousePos.reset(e.stageX, e.stageY);

            computeInput();

            e.addEventListener("mousemove", function (e) {
                prevMousePos.reset(mousePos.x, mousePos.y);
                mousePos.reset(e.stageX, e.stageY);

                delta.x = mousePos.x - prevMousePos.x;
                delta.y = mousePos.y - prevMousePos.y;

                computeInput();
            });

            e.addEventListener("mouseup", function (e) {

                touching = false;
                computeInput();
                delta.reset(0, 0);

            });

        };

        that.shape.addEventListener("mousedown", onTouchDown);

        return that;

    };

    return {
        create: create
    };

});