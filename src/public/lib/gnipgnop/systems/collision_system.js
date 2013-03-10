define(function(require) {

    var game_info_path = '';
    var signals_path = '';
    if (typeof window === 'undefined') {
        game_info_path = "public/lib/gnipgnop/core/game_info";
        signals_path = 'signals';
    } else {
        game_info_path = "gnipgnop/core/game_info";
        signals_path = '../../signals';
    }

    var system      = require('../core/system')
      , GameInfo    = require(game_info_path)
      , ComponentId = require('../components/component_id')
      , Collider    = require('../collisions/collider')
      , Signal      = require(signals_path);

    var BitwiseHelper = require('../util/bitwise_helper');

    var create = function (spec) {

        var that = system.create(spec);

        that.world = spec.world;

        that.gameWidth  = 640;
        that.gameHeight = 480;

        that.entityId = ComponentId.POSITION | ComponentId.COLLISION | ComponentId.PHYSICS;

        that.collided = new Signal();

        var update = function (gameTime, entity) {

            // console.log("[move_system] entity.systemId: " + entity.systemId + ", entityId: " + that.entityId);
            if ((entity.systemId & that.entityId) !== that.entityId) {
                // Entity does not have the proper signature to be update by this system
                return;
            }

            var cc    = entity.getComponentById(ComponentId.COLLISION);
            var pos   = entity.getComponentById(ComponentId.POSITION);
            var phys  = entity.getComponentById(ComponentId.PHYSICS);

            cc.update(gameTime);
            cc.position.reset(pos.position.x, pos.position.y);
            var hit = cc.collideWithWorldBounds(that.gameWidth, that.gameHeight);
            pos.position.reset(cc.position.x, cc.position.y);

            if (cc.collidesWith) {

                if ((hit & Collider.HIT_TOP) === Collider.HIT_TOP ||
                    (hit & Collider.HIT_BOTTOM) === Collider.HIT_BOTTOM) {
                    phys.velocity.y *= -1;
                }

                var others = that.world.query(entity);
                var depth;
                var i
                  , len = others.length;

                for (i = 0; i < len; ++i) {

                    if (depth = cc.collidesWith(others[i])) {

                        // that.collided.dispatch(pos.position.x, pos.position.y);

                        if (Math.abs(depth.x) < Math.abs(depth.y)) {
                            pos.position.moveBy(depth.x, 0);
                        } else {
                            pos.position.moveBy(0, depth.y);
                        }
                        var otherPhys = others[i].getComponentById(ComponentId.PHYSICS);

                        var draw = entity.getComponentById(ComponentId.DEBUG_DRAW);
                        var otherDraw = others[i].getComponentById(ComponentId.DEBUG_DRAW);
                        var color = null;
                        if (draw && otherDraw) {
                            if (draw.color != otherDraw.color) {
                                draw.setColor(otherDraw.color);
                            }
                            color = otherDraw.color;
                        }

                        that.collided.dispatch(pos.position.x, pos.position.y, color);

                        var vx = -1.1 * phys.velocity.x;
                        var vy = otherPhys.velocity * otherPhys.direction;

                        if (vx > phys.maxVelocity.x) {
                            vx = phys.maxVelocity.x;
                        } else if (vx < -phys.maxVelocity.x) {
                            vx = -phys.maxVelocity.x;
                        }

                        if (vy > phys.maxVelocity.y) {
                            vy = phys.maxVelocity.y;
                        } else if (vx < -phys.maxVelocity.y) {
                            vy = -phys.maxVelocity.y;
                        }

                        if (vy > -5 && vy < 5) {
                            vy = phys.velocity.y * -1;
                        }

                        phys.velocity.reset(vx, vy);
                    }
                }
            }

        }
        that.update = update;

        return that;

    };

    return {
        create: create
    };

});