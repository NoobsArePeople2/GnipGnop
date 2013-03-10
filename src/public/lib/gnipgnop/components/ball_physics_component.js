// define([ '../core/component', '../components/component_id', '../geom/vector2' ],
// function(component, ComponentId, vector2) {

define(function(require) {

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id')
      , vector2     = require('../geom/vector2');

    var create = function(spec) {

        spec = spec || {};
        spec.name = "ball_physics_component";

        var that = component.create(spec);
        that.id = ComponentId.PHYSICS;

          that.acceleration = 115
        , that.velocity = vector2.create( { x: 0, y: 0 } )
        , that.maxVelocity = vector2.create( { x: 1200, y: 1200 } );

        var step = function(simTime, posComp, physComp, inputComp) {

            var deltaX
              , deltaY;


            deltaX = physComp.velocity.x * simTime;
            deltaY = physComp.velocity.y * simTime;

            posComp.position.x += deltaX;
            posComp.position.y += deltaY;

        };
        that.step = step;

        var serve = function (vx, vy) {
            console.log("[ball_physics_component] serve");
            that.velocity.reset(vx, vy);
        };
        that.serve = serve;

        var accelerate = function(simTime) {

        };
        that.accelerate = accelerate;

        var decelerate = function(simTime) {

        };
        that.decelerate = decelerate;

        var syncArr = [ 0, 0 ];
        var sync = function (data) {
            if (!data) {
                // syncArr[0] = that.velocity;
                syncArr[0] = that.velocity.x;
                syncArr[1] = that.velocity.y;
                return syncArr;
            } else {
                // that.velocity = data[0];
                that.velocity.reset(data[0], data[1]);
            }
        };
        that.sync = sync;

        return that;
    };

    return {
        create: create
    };

});