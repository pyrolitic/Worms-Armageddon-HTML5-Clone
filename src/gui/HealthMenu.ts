/**
 * HealthMenu.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Player } from "../Player";
import { Settings } from "../Settings";
import { Team } from "../Team";

export class HealthMenu
{

    constructor (players : Player[])
    {
        var html = "";

        for (var p in players)
        {
            var team : Team = players[p].getTeam();

            html +=  "<li><span> " + team.name + " </span><img src="+ 
                    Settings.REMOTE_ASSERT_SERVER  +"data/images/Ireland.png> " +
                    "<span id='" +team.teamId+ "' class=health style=width:" + team.getPercentageHealth() + 
                    "%;background:" + team.color + "  ></span></li>";

        }
        $('.healthMenu').html(html);
        this.hide();

    }

    show()
    {
        $('.healthMenu').show();
    }

    hide()
    {
        $('.healthMenu').hide();
    }

    update(teamRef : Team)
    {       
        $('#' + teamRef.teamId).animate({
            width: teamRef.getPercentageHealth() + "%",
        }, 300);
    }

}