define([ '../core/screen'], function(screen) {

    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    }

    var create = function(spec) {
        var spec = spec || {};
        spec.name = "debug_screen";

        var that = screen.create(spec);

        if (!server) {
            that.container = new createjs.Container();
            that.container.x = 0;
            that.container.y = 0;

            if (that.stage) {
                that.stage.addChild(that.container);
            }

            var pingText = new createjs.Text("", "12px Arial", "#dddddd");
            pingText.textAlign = "left";
            pingText.x = 0;
            pingText.y = 0;
            pingText.maxWidth = 100;
            that.pingText = pingText;
            that.container.addChild(that.pingText);

            var measuredFpsText = new createjs.Text("", "12px Arial", "#dddddd");
            measuredFpsText.textAlign = "left";
            measuredFpsText.x = 100;
            measuredFpsText.y = 0;
            measuredFpsText.maxWidth = 200;
            that.measuredFpsText = measuredFpsText;
            that.container.addChild(that.measuredFpsText);

        }

        var ping = function(value) {
            that.pingText.text = "Ping: " + value + " ms";
        };
        that.ping = ping;

        var measuredFps = function(value) {
            that.measuredFpsText.text = "FPS: " + value;
        };
        that.measuredFps = measuredFps;

        var toggleVisible = function() {
            if (server) {
                that.container.visible = !that.container.visible;
            }
        };
        that.toggleVisible = toggleVisible;

        return that;
    }

    return {
        create: create
    };

});