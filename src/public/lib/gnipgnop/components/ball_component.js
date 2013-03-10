define([ '../core/component', '../components/component_id', '../geom/vector2' ],
function( component, ComponentId, vector2) {

    var create = function(spec) {

        spec = spec || {};
        spec.name = "ball_component";

        var that = component.create(spec);
        that.id = ComponentId.BALL;

        var theServer;
        var server = function (s) {
            if (s) {
                console.log("[ball_component] setting server");
                theServer = s;
            } else {
                console.log("[ball_component] getting server");
                return theServer;
            }
        };
        that.server = server;

        return that;
    }

    return {
        create: create
    };

});