define(function(require) {

    var component   = require('../core/component')
      , ComponentId = require('../components/component_id');

    var create = function(spec) {

        spec = spec || {};
        spec.name = "physics_component";

        var that = component.create(spec);
        that.id = ComponentId.PHYSICS;

          that.acceleration = 500
        , that.deceleration = 500
        , that.velocity = 0
        , that.maxVelocity = 300
        , that.direction = 0;

        var step = function(simTime, posComp, physComp, inputComp) {

            var delta;
            if (inputComp.moveDir != inputComp.NONE) {
                physComp.accelerate(simTime, inputComp.moveDirChanged);
                delta = physComp.velocity * simTime * inputComp.moveDir;
            } else {
                physComp.decelerate(simTime);
                delta = physComp.velocity * simTime * inputComp.prevDir;
            }

            if (delta > 0) {
                that.direction = 1;
            } else {
                that.direction = -1;
            }

            posComp.position.y += delta;

        };
        that.step = step;

        var accelerate = function(simTime, moveDirChanged) {
            that.velocity = that.velocity + that.acceleration * simTime;
            var mv = (moveDirChanged) ? that.maxVelocity / 2 : that.maxVelocity;
            if (that.velocity > mv) {
                that.velocity = mv;
            }
        };
        that.accelerate = accelerate;

        var decelerate = function(simTime) {
            that.velocity = that.velocity - that.deceleration * simTime;
            if (that.velocity < 0) {
                that.velocity = 0;
            }
        };
        that.decelerate = decelerate;

        var syncArr = [ 0 ];
        var sync = function (data) {
            if (!data) {
                syncArr[0] = that.velocity;
                return syncArr;
            } else {
                that.velocity = data[0];
            }
        };
        that.sync = sync;

        return that;
    };

    return {
        create: create
    };

});