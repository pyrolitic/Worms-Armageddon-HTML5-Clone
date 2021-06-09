/**
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import express = require('express');
import {LeaderBoardApi, Settings} from './LeaderBoardApi';

var app = express();

var settings : Settings = {
    port:80,
    database: "wormsGame",
    userTable: "users",
    apiKey: "AIzaSyA1aZhcIhRQ2gbmyxV5t9pGK47hGsiIO7U"
}

var api : LeaderBoardApi = new LeaderBoardApi(settings);

app.get('/findUserIdByToken/:token', (req : any, res : any) =>
{
      var authToken = req.params.token;
      api.findUsersIdByToken(authToken, (userId : string) => {
              res.send(userId);
      });
});
app.get('/getLeaderBoard', function (req : any, res : any) { api.getLeaderBoard(req, res) });
app.get('/updateUser/:token', function (req : any, res : any) { api.updateUser(req, res) });
app.get('/remove/:token', function (req : any, res : any) { api.remove(req, res) });


app.listen(settings.port);
console.log('Listening on '+ settings.port);
