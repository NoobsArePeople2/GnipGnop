// define([ '../util/guid' ], function(guid) {
define(function(require) {

    var server = typeof window === 'undefined';
    var game_info_path;
    if (server) {
        game_info_path = "public/lib/gnipgnop/core/game_info";
    } else {
        game_info_path = "gnipgnop/core/game_info";
    }

    var guid     = require('../util/guid')
      , GameInfo = require(game_info_path);

    var create = function (spec) {

        spec = spec || {};
        var that = {};

        that.id = spec.id || guid.generate();
        that.systemId = spec.id || 0;

        var components = [];
        var numComponents = 0;

        var computeSystemId = function () {

            var systemId = 0;

            for (var i = 0; i < numComponents; ++i) {
                systemId |= that.getComponentAt(i).id;
            }

            return systemId;

        };

        var hasComponent = function (comp) {

            var i = numComponents - 1;
            while (i > -1) {
                if (components[i].name == comp.name) {
                    return true;
                }
                --i;
            }

            return false;

        }

        var addComponent = function (comp) {

            if (hasComponent(comp)) {
                return;
            }

            comp.owner = that;
            components.push(comp);
            numComponents = components.length;

            that.systemId = computeSystemId();

        };
        that.addComponent = addComponent;

        var getComponent = function (name) {

            // var len = components.length;
            var len = numComponents;
            for (var i = 0; i < len; ++i) {
                if (components[i].name == name) {
                    return components[i];
                }
            }

            return null;
        };
        that.getComponent = getComponent;

        var getComponentById = function (id) {

            var len = numComponents;
            for (var i = 0; i < len; ++i) {
                if ((components[i].id & id) === id) {
                    return components[i];
                }
            }

            return null;
        };
        that.getComponentById = getComponentById;

        var getComponentAt = function (index) {
            return components[index];
        };
        that.getComponentAt = getComponentAt;

        var removeComponent = function (name) {

            var i = numComponents - 1;
            while (i > -1) {

                if (components[i].name == name) {
                    var comp = components.splice(i, 1);
                    numComponents--;
                    that.systemId = computeSystemId();

                    return comp[0];
                }
                --i;
            }

            return null;
        };
        that.removeComponent = removeComponent;

        var numComponents = function () {
            return numComponents;
        };
        that.numComponents = numComponents;

        var update = function (gameTime) {

            // console.log ("[entity] update()");
            for (var i = 0; i < numComponents; ++i) {
                components[i].update(gameTime);
            }

        };
        that.update = update;

        var insert = function (cont) {
            var len = components.length;
            var comp;
            for (var i = 0; i < len; ++i) {
                comp = components[i];
                if (comp.insert) {
                    // console.log("[entity] inserting component");
                    comp.insert(cont);
                }
            }
        };
        that.insert = insert;

        var remove = function (cont) {
            var len = components.length;
            var comp;
            for (var i = 0; i < len; ++i) {
                comp = components[i];
                if (comp.remove) {
                    comp.remove(cont);
                }
            }
        };
        that.remove = remove;

        var sync = function () {

        };
        that.syncsync = sync;

        var reset = function () {

            for (var i = 0; i < numComponents; ++i) {
                components[i].reset();
            }

        };
        that.reset = reset;

        return that;
    }

    return {
        create: create
    };

});

