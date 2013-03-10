define( [ '../core/component', '../components/component_id' ],
function(  component, ComponentId ) {

    var create = function (spec) {

        spec = spec || {};
        spec.name = "serve_component";

        var that = component.create(spec);
        that.id = ComponentId.SERVE;

        that.ball = spec.ball;

        return that;
    };

    return {
        create: create
    };

});