/**
 * NetworkedTimer.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Timer } from "../system/Timer";
import { Client } from "./Client";
import { Events } from "./Events";

export class NetworkTimer extends Timer
{

    currentServerTime : number; // When last checked
    packetRateTimer: Timer;

    constructor(gameTurnTimeDuraction : number)
    {
        super(gameTurnTimeDuraction);
        this.packetRateTimer = new Timer(1000);
        this.currentServerTime = Date.now();
    }

    update()
    {
        this.packetRateTimer.update();
        super.update();

        if (this.packetRateTimer.hasTimePeriodPassed())
        {
            Client.socket.emit(Events.client.GET_GAME_TIME, '', (data : number) =>
            {
                this.currentServerTime = data;
            });
        }
    }


    //override
    getTimeNow()
    {
        return this.currentServerTime;
    }

}