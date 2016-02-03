RH.EndGameScreen = (function() {
    'use strict';
    var ScoreScreen = RH.ScoreScreen;

    function EndGameScreen(canvas, game, callback) {
        this.canvas = canvas;
        this.game = game;
        this.callback = callback;
        this.t0 = RH.getTime();
        this.isOn = true;

        var ctx = this.canvas.getContext("2d");
        var W = this.canvas.width;
        var H = this.canvas.height;
        ctx.save();
        ctx.font = "40px Arial";
        ctx.fillStyle = "#696969";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.game.scoreCalculator.hasLost()) {
            ctx.fillText("Game Over", W / 2, H / 2 - 25);
            ctx.fillText("You scored " + this.game.scoreCalculator.totalScore + " points!", W / 2, H / 2 + 25);
            ctx.fillText("Press a button to restart level.", W / 2, H / 2 + 75);
        } else {
            ctx.fillText("Congratulation", W / 2, H / 2 - 25);
            ctx.fillText("You scored " + this.game.scoreCalculator.totalScore + " points!", W / 2, H / 2 + 25);
            ctx.fillText("Press a button to go the next level.", W / 2, H / 2 + 75);

        }
        ctx.restore();
    }

    EndGameScreen.prototype = {

        update: function() {

        },
        stop: function() {
            this.isOn = false;
            this.callback();
        },
        onEvent: function(isUp, event) {
            if (this.isOn && !isUp && RH.getTime() > this.t0 + 500) {
                this.stop();
            }
        }

    };

    return EndGameScreen;
}());