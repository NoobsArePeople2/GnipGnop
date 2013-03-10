define(function(require) {

    var server = typeof window === 'undefined';
    var game_info_path = '';
    if (server) {
         game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
         game_info_path = "gnipgnop/core/game_info";
    }

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id')

      , vector2     = require('../geom/vector2')

      , MathHelper  = require('../util/math_helper')
      , Collider    = require('../collisions/collider')

      , GameInfo    = require(game_info_path);

    var create = function(spec) {

        spec = spec || {};
        spec.name = "ball_collision_component";

        var that = component.create(spec);
        that.id = ComponentId.COLLISION;

        that.radius = spec.r;
        that.position = vector2.create( { x: spec.x, y: spec.y } );

        var collideWithWorldBounds = function (w, h) {

            var hit = Collider.HIT_NONE;

            if (that.position.y - that.radius < 0) {
                that.position.y = that.radius;
                hit |= Collider.HIT_TOP;
            } else if (that.position.y + that.radius > h) {
                that.position.y = h - that.radius;
                hit |= Collider.HIT_BOTTOM;
            }

            if (that.position.x - that.radius < 0 ) {
                // Player Two Scores!
                GameInfo.log("[ball_collision_component] Player Two Scores! " + new Date().toString(), GameInfo.LOG_CONSOLE);
                GameInfo.log("", GameInfo.LOG_CONSOLE);
                if (server) {
                    that.owner.score(1);
                }
                hit |= Collider.HIT_LEFT;
            } else if (that.position.x + that.radius > w) {
                // Player One Scores
                GameInfo.log("[ball_collision_component] Player One Scores! " + new Date().toString(), GameInfo.LOG_CONSOLE);
                GameInfo.log("", GameInfo.LOG_CONSOLE);
                if (server) {
                    that.owner.score(0);
                }
                hit |= Collider.HIT_RIGHT;
            }

            return hit;

        };
        that.collideWithWorldBounds = collideWithWorldBounds;

        that.noHitTime = 0;
        var collidesWith = function (other) {

            if (that.noHitTime > 0) {
                return null;
            }

            var col = other.getComponentById(ComponentId.COLLISION);
            var numVerts
              , i
              , x, y
              , depth = vector2.create();


            if (col.halfWidth && col.halfHeight) {

                var distX = Math.abs(that.position.x - col.position.x);
                var distY = Math.abs(that.position.y - col.position.y);
                var factorX, factorY;

                if (distX > col.halfWidth + that.radius) {
                    return null;
                } else if (that.position.y + that.radius < col.position.y - col.halfHeight) {
                    // ball bottom above paddle top
                    return null;
                } else if (that.position.y - that.radius > col.position.y + col.halfHeight) {
                    // ball top below paddle bottom
                    return null;
                }

                if (distY > col.halfHeight + that.radius) {
                    return null;
                } else if (that.position.x + that.radius < col.position.x - col.halfWidth) {
                    // ball right is left of paddle left
                    return null;
                } else if (that.position.x - that.radius > col.position.x + col.halfWidth) {
                    // ball left is right of paddle right
                    return null;
                }

                if (that.position.x < col.position.x) {
                    factorX = 1;
                } else {
                    factorX = -1;
                }

                if (that.position.y < col.position.y) {
                    factorY = 1;
                } else {
                    factorY = -1;
                }

                noHitTime = 0.25;
                if (distX <= col.halfWidth) {
                    return depth.reset((distX - col.halfWidth - that.radius) * factorX,
                                       (distY - col.halfHeight - that.radius) * factorY);
                } else if (distY <= col.halfHeight) {
                    return depth.reset((distX - col.halfWidth - that.radius) * factorX,
                                       (distY - col.halfHeight - that.radius) * factorY);
                }

                return null;

            }

            return null;

        };
        that.collidesWith = collidesWith;

        var update = function (gameTime) {

            that.noHitTime -= gameTime.simTime;

        };
        that.update = update;

        return that;
    }

    return {
        create: create
    };

});