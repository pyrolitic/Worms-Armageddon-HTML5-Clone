/**
 *
 * LeaderboardsView.js manages updating the leaderboards view and all that shit
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
///<reference path="../Game.ts"/>

import { Settings } from "../Settings";
import { LobbyMenu } from "./LobbyMenu";


export class LeaderBoardView
{
    private leaderBoardView: string;
    private profileView: string;

    static CSS_ID = {
        LEADERBOARDS_TABLE: "#leaderBoardsTable tbody"
    }

    constructor()
    {
        this.leaderBoardView = '<div id="leaderBoards" style="display:none">' +
          '<table id=' + LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE.replace('#', '') + ' class="table table-striped table-bordered" > ' +
          '<thead>  <tr>  <th>Player</th>  <th>Wins/Loss</th> </tr>  </thead>  ' +
          '<tbody></tbody></table>' +
          '</div>';

        this.profileView = '<div id="profile" style="display:none">' +
          '<p>If you would like to remove <strong>All</strong> trace of your leaderboard rankings, you can revoke your Google+ token<br>  <br><a href="#" class="btn" id="googlePlusdisconnectUser">Revoke</a></p>' +
          '</div>';
    }

    getView()
    {
        return this.leaderBoardView;
    }

    getProfileView()
    {
        return this.profileView;
    }

    populateTable(userData : any)
    {
        $(LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE).empty()

        for (var player in userData)
        {
            if (userData[player]["name"] != "")
            {
                $(LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE).append(' <tr> <td><img width=30 height=30 src=' + userData[player]["image"] + ' /> <span> ' + userData[player]["name"] + '</td> <td> ' + userData[player]["score"] + '</span></td>  </tr>');
            }
        }

        $(LobbyMenu.CSS_ID.LOBBY_TABLE).append('</tbody></table>');
    }

    update()
    {

        var callback = (leaderBoardData : any) => {

            var leaderBoardData = JSON.parse(leaderBoardData);
            var combinedUserData : {[key: string]: {image: string, name:string, score:number}} = {};
            var dataLoadCount = 0;

            for (var player in leaderBoardData)
            {
                combinedUserData[leaderBoardData[player]["userId"]] = { "image": "", "name": "", "score": leaderBoardData[player]["winCount"] };

                var url = "https://www.googleapis.com/plus/v1/people/" + leaderBoardData[player]["userId"] + "/?key=" + Settings.API_KEY;

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: (userDataFromGoogle : any) =>
                    {
                        //If a users account has been disabled this will be null
                        if (userDataFromGoogle.id)
                        {
                            combinedUserData[userDataFromGoogle.id].image = userDataFromGoogle.image.url;
                            combinedUserData[userDataFromGoogle.id].name = userDataFromGoogle.displayName;

                        }
                        dataLoadCount++;


                        if (dataLoadCount == leaderBoardData.length)
                        {
                            this.populateTable(combinedUserData);
                        }

                    }
                });

            }

        }

        $.ajax({
            url: Settings.LEADERBOARD_API_URL + '/getLeaderBoard',
            dataType: 'jsonp',
            success: callback
        });

    }
}