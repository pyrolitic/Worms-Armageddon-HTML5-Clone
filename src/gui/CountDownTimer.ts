/**
 * CountDownTimer.js
 * This is encpluates the count down timer position in the bottom left hand couter
 * It also handles the switching of players when their time runs out. 
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Game } from "../Game";
import { GameInstance } from "../MainInstance";
import { NetworkTimer } from "../networking/NetworkTimer";
import { Settings } from "../Settings";
import { AssetManager } from "../system/AssetManager";
import { Timer } from "../system/Timer";
export class CountDownTimer
{

    timer: Timer;
    previousSecound: number;

    constructor()
    {

        //Choice a type of timer based on where we are playing online or not
        if (GameInstance.gameType == Game.types.ONLINE_GAME)
        {
            this.timer = new NetworkTimer(Settings.PLAYER_TURN_TIME);
        } else
        {
            this.timer = new Timer(Settings.PLAYER_TURN_TIME);
        }


        this.previousSecound = this.timer.timePeriod;
        $('#turnTimeCounter').hide();
    }

    show()
    {
        $('#turnTimeCounter').show();
    }

    update()
    {

        if (Settings.DEVELOPMENT_MODE)
            this.timer.pause();

        this.timer.update();
        var timeLeft = Math.floor(this.timer.getTimeLeft() / 1000);

        // Dont update the HTML element while 
        if (timeLeft != this.previousSecound && timeLeft >= 0)
        {
            if (timeLeft == 5)
            {
                AssetManager.getSound("hurry").play();
            }


            this.previousSecound = timeLeft;
            $('#turnTimeCounter').html(timeLeft.toString());

            if (timeLeft < Settings.TURN_TIME_WARING && timeLeft >= 0)
            {
                $('#turnTimeCounter').css("background", "red");
                AssetManager.getSound("TIMERTICK").play(0.3);

            } else
            {
                $('#turnTimeCounter').css("background", "black");
            }

        }

        if (this.timer.hasTimePeriodPassed(false))
        {
            this.timer.pause();
            GameInstance.state.timerTiggerNextTurn();
        }

    }

}