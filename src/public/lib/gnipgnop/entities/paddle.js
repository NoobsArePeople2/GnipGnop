define(function(require) {

    var entity  = require('../core/entity')
      , vector2 = require('../geom/vector2')

      , debug_draw_component = require('../components/debug_draw_component')
      , collision_component  = require('../components/collision_component')
      , position_component   = require('../components/position_component')
      , physics_component    = require('../components/physics_component')
      , input_component      = require('../components/input_component')

      , EntityId = require('../entities/entity_id');

    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    }

    var create = function(spec) {

        var that = entity.create();

        that.name = spec.name;
        that.id = spec.id;
        that.color = spec.color;

        that.addComponent(position_component.create(
            {
                x: spec.x,
                y: spec.y
            })
        );

        that.addComponent(physics_component.create());
        that.addComponent(input_component.create());

        that.addComponent(collision_component.create(
            {
                x: spec.x,
                y: spec.y,
                w: 25,
                h: 100
            })
        );

        if (!server) {
            that.addComponent(debug_draw_component.create(
                {
                    type: "rectangle",
                    x: spec.x,
                    y: spec.y,
                    w: 25,
                    h: 100,
                    color: that.color,
                    reg: "center",
                    alpha: 1
                })
            );
        }

        var position = function () {
            var pc = that.getComponent("position_component");
            return pc.position;
        };
        that.position = position;

        var syncArr = [ 0, 0, 0, 0, 0, 0, 0 ];
        that.syncBuffer = [];
        var sync = function (data) {

            var pc   = that.getComponent("position_component");
            var phys = that.getComponent("physics_component");
            var col  = that.getComponent("collision_component");
            if (!data) {
                syncArr[0] = EntityId.PADDLE;
                syncArr[1] = that.id;
                syncArr[2] = that.name;
                syncArr[3] = that.color;
                syncArr[4] = pc.sync();
                syncArr[5] = phys.sync();
                syncArr[6] = col.sync();
                return syncArr;
            } else {
                that.syncBuffer.push(data);
            }
        };
        that.sync = sync;

        var setKeyboard = function (keyboard) {

            var len = that.numComponents()
              , comp;
            for (var i = 0; i < len; ++i) {
                comp = that.getComponentAt(i);
                if (comp.setKeyboard) {
                    comp.setKeyboard(keyboard);
                }
            }
        };
        that.setKeyboard = setKeyboard;

        var reset = function () {

            that.getComponent("position_component").position.y = 240;

        };
        that.reset = reset;

        var toString = function () {
            return "[paddle] name: " + that.name + ", id: " + that.id + ", color: " + that.color;
        }
        that.toString = toString;

        return that;
    }

    return {
        create: create
    };

});
