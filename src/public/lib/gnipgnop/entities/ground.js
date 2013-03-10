define([ '../core/entity', '../geom/vector2', '../components/debug_draw_component'], function(entity, vector2, debug_draw_component) {

    var create = function(spec) {

        var that = entity.create();

        that.name = spec.name;
        that.id = spec.id;

        that.position = vector2.create(spec);

        that.addComponent(debug_draw_component.create(
            {
                type: "rectangle",
                x: 0,
                y: 0,
                w: 960,
                h: 640,
                color: "black",
                alpha: 1
            })
        );

        var clickHandler = function(handler) {
            that.getComponent("debug_draw_component").clickHandler(handler);
        };
        that.clickHandler = clickHandler;

        return that;
    }

    return {
        create: create
    };

});