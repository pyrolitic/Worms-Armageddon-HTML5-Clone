/**
 *
 * Server.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */

import {createServer, Server as HttpServer} from "http";
import * as express from "express";
import {Server, Socket} from "socket.io";
import { Events, } from './Events';
import { ServerLobby } from "./ServerLobby";
import { ServerSettings } from "./ServerSettings";

export class GameServer
{
    io: Server;
    lobby: ServerLobby;
    //bandwidthMonitor;

    constructor (server : HttpServer)
    {
        //this.bandwidthMonitor = new BandwidthMonitor(true);       
        this.io = new Server(server, {
            cors: {
                origin: ServerSettings.ORIGIN,
                //methods: ["GET", "POST"],
            }
        });
        this.lobby = new ServerLobby();

        this.io.on('connection', (socket : Socket) =>
        {
            console.log("connection from", socket.handshake.address);
            this.lobby.onConnection(socket,this.io);
            this.lobby.init(socket,this.io);
            this.lobby.onDisconnection(socket,this.io);

            //This allows the clients to get the  current time of the server
            socket.on(Events.client.GET_GAME_TIME, (msg,func) =>
            {
                func(Date.now());
            });
        });
    }

    init()
    {
        // Setup a default lobby
        this.lobby.createGameLobby("Default", 2, "priates");
        
    }
}

var app = express();
var http = createServer(app);
export let gameServer = new GameServer(http);

app.use(express.static('.'));

http.listen(ServerSettings.PORT, ServerSettings.HOST, 50, () => {
    console.log("created server, listening on", ServerSettings.HOST, ServerSettings.PORT);
    gameServer.init();
});
