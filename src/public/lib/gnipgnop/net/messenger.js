var bison_path = '';
var game_info_path = '';
if (typeof window === 'undefined') {
    bison_path = 'bison';
    game_info_path = "public/lib/gnipgnop/core/game_info";
} else {
    bison_path = '../../bison';
    game_info_path = "gnipgnop/core/game_info";
}

define([ bison_path, game_info_path ],
function(BISON,      GameInfo) {

    // See: https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays
    var server = false;
    if (typeof window === 'undefined') {
        server = true;
    } else {
        BISON = window.BISON;
    }

    var MTU = 1400       // bytes
      , TCP_HEADER = 20  // bytes
      , BYTES_PER_ELEMENT = Uint32Array.BYTES_PER_ELEMENT
      , MAX_LEN = (MTU - TCP_HEADER) / BYTES_PER_ELEMENT;

    var useMTU = false;

    var sendMTUBytes = new Uint32Array(MAX_LEN);


    function sendMTU(socket, data) {

        var encoded = BISON.encode(data);
        var bytes;
        if (socket.isBinary) {
            var len = encoded.length;
            if (len > MAX_LEN) {
                console.log("[net] ERROR: Message length exceeds maximum message size!");
                return null;
            }

            bytes = sendMTUBytes;
            bytes[0] = len;

            for (var i = 0; i < len; ++i) {
                bytes[i+1] = encoded.charCodeAt(i);
            }
            encoded = bytes;
        }

        if (server) {
            socket.send(encoded, { binary: socket.isBinary, mask: false });
        } else {
            socket.send(encoded);
        }
    }

    function readMTU(data, flags) {

        if (data instanceof ArrayBuffer || (flags && flags.binary)) {
            var bytes = new Uint32Array(data);
            data = String.fromCharCode.apply(null, bytes.subarray(1, bytes[0]));
        }

        // Basic sanity checks.
        var msg;
        try {
            msg = BISON.decode(data);
        } catch (e) {
            console.log("[net] Error decoding BISON (MTU)");
            return false;
        }

        if (!(msg instanceof Array) || msg.length < 2) {
            console.log("[net] Message not array or less than 2 length");
            return false;
        }

        return msg;
    }

    function send(socket, data) {

        var encoded;
        try {
            encoded = BISON.encode(data);
        } catch (e) {
            return false;
        }
        var bytes;
        if (socket.isBinary) {
            var len = encoded.length,
                bytes = new Uint32Array(len);

            for (var i = 0; i < len; ++i) {
                bytes[i] = encoded.charCodeAt(i);
            }
            encoded = bytes;
        }

        if (server) {
            socket.send(encoded, { binary: socket.isBinary, mask: false });
        } else {
            socket.send(encoded);
        }

    }

    function read(data, flags) {

        var bytes;
        if (data instanceof ArrayBuffer || (flags && (flags.binary || flags.socketIsBinary))) {
            bytes = new Uint32Array(data);
            data = String.fromCharCode.apply(null, bytes);
        }

        // Basic sanity checks.
        var msg;
        try {
            msg = BISON.decode(data);
        } catch (e) {
            console.log("[net] Error decoding BISON");
            return false;
        }

        if (!(msg instanceof Array) || msg.length < 2) {
            console.log("[net] Message not array or less than 2 length");
            return false;
        }

        return msg;
    }

    var msgArr = [ null, null ];
    function compose(code, data) {
        msgArr[0] = code;
        msgArr[1] = data;

        return msgArr;
    }

    if (useMTU) {
        return {
            send: sendMTU,
            read: readMTU,
            compose: compose
        };
    } else {
        return {
            send: send,
            read: read,
            compose: compose
        };
    }

});