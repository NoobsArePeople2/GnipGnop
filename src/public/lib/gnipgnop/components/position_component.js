define(function(require) {

    var component = require('../core/component')
      , vector2   = require('../geom/vector2')

      , ComponentId = require('../components/component_id')

    var create = function(spec) {

        spec = spec || {};
        spec.name = "position_component";

        var that = component.create(spec);
        that.id = ComponentId.POSITION;

        that.position = vector2.create( { x: spec.x || 0, y: spec.y || 0 } );

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
    };

    return {
        create: create
    };

});