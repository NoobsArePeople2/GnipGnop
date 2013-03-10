define(function(require) {

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id')
      , vector2     = require('../geom/vector2')
      , MathHelper  = require('../util/math_helper')
      , Collider    = require('../collisions/collider');

    var create = function(spec) {

        spec = spec || {};
        spec.name = "collision_component";

        var that = component.create(spec);
        that.id = ComponentId.COLLISION;

        var halfHeight = spec.h / 2;
        var halfWidth  = spec.w / 2;
        that.halfHeight = halfHeight;
        that.halfWidth = halfWidth;

        // Start at top left.
        // x,y is the center of the object.
        var vertices = [];
        vertices.push(vector2.create( { x: -halfWidth, y: -halfHeight } ));
        vertices.push(vector2.create( { x:  halfWidth, y: -halfHeight } ));
        vertices.push(vector2.create( { x:  halfWidth, y:  halfHeight } ));
        vertices.push(vector2.create( { x: -halfWidth, y:  halfHeight } ));

        // that.vertices = vertices;
        that.position = vector2.create( { x: spec.x, y: spec.y } );

        var collideWithWorldBounds = function (w, h) {

            var hit = Collider.HIT_NONE;

            if (that.position.y - that.halfHeight < 0) {
                that.position.y = that.halfHeight;
                hit |= Collider.HIT_TOP;
            } else if (that.position.y + that.halfHeight > h) {
                that.position.y = h - that.halfHeight;
                hit |= Collider.HIT_BOTTOM;
            }

            if (that.position.x - that.halfWidth < 0 ) {
                that.position.x = that.halfWidth;
                hit |= Collider.HIT_LEFT;
            } else if (that.position.x + that.halfWidth > w) {
                that.position.x = w - that.halfWidth;
                hit |= Collider.HIT_RIGHT;
            }

            return hit;

        };
        that.collideWithWorldBounds = collideWithWorldBounds;

        var update = function (gameTime) {

        };
        that.update = update;

        var syncArr = [ 0, 0 ];
        var sync = function (data) {
            if (!data) {
                syncArr[0] = that.position.x;
                syncArr[1] = that.position.y;
                return syncArr;
            } else {
                that.position.reset(data[0], data[1]);
            }
        };
        that.sync = sync;

        return that;
    }

    return {
        create: create
    };

});