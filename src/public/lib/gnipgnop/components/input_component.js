define(function(require) {

    var component = require('../core/component')

      , ComponentId = require('../components/component_id')
      , Keys        = require('../input/keys')

    var create = function(spec) {

        spec = spec || {};
        spec.name = "input_component";

        var that = component.create(spec);
        that.id = ComponentId.INPUT;

          that.LEFT  = -1
        , that.UP    = -1
        , that.RIGHT =  1
        , that.DOWN  =  1
        , that.NONE  =  0;

          that.moveDir = that.NONE
        , that.prevDir = that.NONE;

        that.serve = false;

        var updateInput = function(keyboard) {

            if (keyboard.isKeyDown(Keys.ARROW_UP)) {
                that.moveDir = that.UP;
                that.prevDir = that.moveDir;
            } else if (keyboard.isKeyDown(Keys.ARROW_DOWN)) {
                that.moveDir = that.DOWN;
                that.prevDir = that.moveDir;
            } else {
                that.moveDir = that.NONE;
            }

            if (that.moveDir != that.NONE && that.moveDir != that.prevDir) {
                that.moveDirChanged = true;
            } else {
                that.moveDirChanged = false;
            }

            if (keyboard.wasKeyJustReleased(Keys.SPACE)) {
                that.serve = true;
            } else {
                that.serve = false;
            }

        };
        that.updateInput = updateInput;

        return that;
    };

    return {
        create: create
    };

});