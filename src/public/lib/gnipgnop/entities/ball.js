var server = false;
var signals_path = '';
if (typeof window === 'undefined') {
    server = true;
    signals_path = 'signals';
} else {
    signals_path = '../../signals';
}

define(function(require) {

    var entity = require('../core/entity')

      , ball_component       = require('../components/ball_component')
      , position_component   = require('../components/position_component')
      , physics_component    = require('../components/ball_physics_component')
      , collision_component  = require('../components/ball_collision_component')
      , debug_draw_component = require('../components/debug_draw_component')

      , Signal   = require(signals_path)
      , EntityId = require('../entities/entity_id');

    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    }

    var create = function(spec) {

        var that = entity.create(spec);

        that.name = "ball";
        that.id = 123456789;

        var scoring = false;

        that.addComponent(position_component.create(
            {
                x: spec.x,
                y: spec.y
            })
        );

        that.addComponent(physics_component.create());
        that.addComponent(collision_component.create(
            {
                x: spec.x,
                y: spec.y,
                r: spec.r
            })
        );

        that.addComponent(ball_component.create());

        if (!server) {
            that.addComponent(debug_draw_component.create(
                {
                    type: "circle",
                    x: spec.x,
                    y: spec.y,
                    r: spec.r,
                    color: spec.color,
                    reg: "center",
                    alpha: 1
                })
            );
        }

        that.served = new Signal();
        var serve = function (vx, vy) {
            var phys = that.getComponent("ball_physics_component");
            if (phys) {
                phys.serve(vx, vy);
                scoring = false;
                that.served.dispatch();
            }
        };
        that.serve = serve;

        var stop = function () {
            var phys = that.getComponent("ball_physics_component");
            if (phys) {
                phys.velocity.reset();
            }
            var cc = that.getComponent("ball_collision_component");
            if (cc) {
                cc.noHitTime = 0;
            }
        };
        that.stop = stop;

        that.scored = new Signal();
        var score = function(playerId) {
            if (!scoring) {
                console.log("[ball] score");
                scoring = true;
                that.scored.dispatch(playerId);
            }
        };
        that.score = score;

        var setColor = function(color) {

            var comp = that.getComponent("debug_draw_component");
            if (comp) {
                comp.setColor(color);
            }

        };
        that.setColor = setColor;

        var syncArr = [ 0, 0, 0, 0, 0 ];
        var sync = function(data) {

            var pc   = that.getComponent("position_component");
            var phys = that.getComponent("ball_physics_component");
            if (!data) {
                syncArr[0] = EntityId.BALL;
                syncArr[1] = that.id;
                syncArr[2] = that.name;
                syncArr[3] = pc.sync();
                syncArr[4] = phys.sync();
                return syncArr;
            } else {
                pc.sync(data[3]);
                phys.sync(data[4]);
            }
        }
        that.sync = sync;

        return that;

    };

    return {
        create: create
    };

});