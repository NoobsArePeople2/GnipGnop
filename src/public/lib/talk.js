define(function() {

    var Message = {
        CONNECT:        1,
        DISCONNECT:     2,
        START:          3,
        STOP:           4,
        ERROR:          5,
        INPUT:          6,
        UPDATE:         7,

        PLAYER_CONNECT: 8,
        NEW_PLAYER:     9,
        SYNC:           10,
        SYNC_PLAYERS:   11,

        RTT:            12,  // Round Trip Time

        CONNECTED:      13,
        SYNC_STATE:     14,

        BALL_ADDED:     15,

        SCORED:         16,
        SCORE_COMPLETE: 17,
        SERVED:         18,

        READY:          19,
        SCORE_CHANGED:  20,
        PLAY:           21
    };

    var Input = {
        MOVE:     1,
        KEY_DOWN: 2,
        KEY_UP:   3
    };

    var Error = {
        INVALID_DATA:        1,
        MESSAGE_TOO_SHORT:   2,
        ALREADY_CONNECTED:   3,
        UNSUPPORTED_VERSION: 4,
        SERVER_FULL:         5
    };

    return {
        Message: Message,
        Input:   Input,
        Error:   Error
    };

});