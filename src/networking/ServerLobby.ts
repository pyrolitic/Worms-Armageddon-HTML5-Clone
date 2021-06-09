import { Socket, Server } from 'socket.io';
import { ServerSettings } from "./ServerSettings";
import { Events } from "./Events";
import { ServerUtilies } from "./ServerUtilies";
import { BaseLobby, BaseGameLobby, SOCKET_STORAGE_GAMELOBBY_ID } from "./Lobby";
import * as xss from "xss-filters";

export class ServerGameLobby extends BaseGameLobby {
    constructor(name: string, numberOfPlayers: number, mapName : string  = "priates" )
    {
        super(name, numberOfPlayers, mapName);
    }

    server_init()
    {
        this.id = ServerUtilies.createToken() + BaseGameLobby.gameLobbiesCounter;
        BaseGameLobby.gameLobbiesCounter++;
    }

    join(userId : string, googleUserId : string, socket : Socket)
    {
        //Stops a user from joing a room twice
        if (this.contains(userId) == false && this.status == BaseGameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS)
        {
            console.log("Player " + googleUserId + " added to gamelobby " + this.id + " and name " + this.name);

            // Add the player to the gameLobby socket.io room
            socket.join(this.id);

            //if (this.currentPlayerId == null)
            {
                this.currentPlayerId = userId;
            }

            // Write the gameLobbyId to the users socket
            socket.data[SOCKET_STORAGE_GAMELOBBY_ID] = this.id;

            this.playerIds.push(userId);

            //if the room is full start game
            if (this.isFull())
            {
                socket.emit(Events.gameLobby.START_GAME_HOST, this);
                this.status = BaseGameLobby.LOBBY_STATS.GAME_IN_PLAY;

            } else
            {
                this.status = BaseGameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS;
            }
        }
    }

    remove(userId : string)
    {
       var index = this.playerIds.indexOf(userId);

       if (index >= 0)
       {
           ServerUtilies.deleteFromCollection(this.playerIds, index);
       }
    }
}

export class ServerLobby extends BaseLobby {
    onConnection(socket: Socket, io: Server) {
        this.userCount++;
        if (this.userCount > this.highestUserCount) {
            this.highestUserCount = this.userCount;
        }

        //When any user connects to the node server we set their socket an ID
        //so we can idefnitny them unqine in their dealings with the server
        var token = ServerUtilies.createToken() + this.userCount;

        socket.data.userId = token;
        console.log("User connected and assigned ID " + token + " from " + socket.handshake.address);
        //io.log.info(Util.format("User connected and assigned ID " + token + " from " + socket.handshake.address));
        socket.emit(Events.client.ASSIGN_USER_ID, token);

        io.sockets.emit(Events.lobby.UPDATE_USER_COUNT, this.userCount);

        // When someone makes a connection send them the lobbie
        socket.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(this.getGameLobbies()));
    }

    onDisconnection(socket: Socket, io: Server) {
        socket.on('disconnect', () => {
            //ServerUtilies.info(io, " User exit ");

            this.userCount--;
            io.sockets.emit(Events.lobby.UPDATE_USER_COUNT, this.userCount);


            this.removePlayerFormCurrentLobby(socket, io);

        });
    }

    removePlayerFormCurrentLobby(socket: Socket, io: Server) {
        var userId = socket.data.userId;
        var gameLobbyId = socket.data.gameLobbyId;
        if (gameLobbyId) {
            socket.broadcast.to(gameLobbyId).emit(Events.gameLobby.PLAYER_DISCONNECTED, userId);
            socket.leave(gameLobbyId);

            if (this.gameLobbies[gameLobbyId]) {
                (this.gameLobbies[gameLobbyId] as ServerGameLobby).remove(userId);

                //Checks if there is anyone left in the room
                if (this.gameLobbies[gameLobbyId].isLobbyEmpty()) {
                    //Delete gameb lobby
                    delete this.gameLobbies[gameLobbyId];

                    //Update all clients that this lobby is now closed.
                    io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(this.getGameLobbies()));
                }
            }
        }
    }

    init(socket: Socket, io: Server) {

        // Create lobby
        socket.on(Events.lobby.CREATE_GAME_LOBBY, (data) => {

            //If the user was connected to another room disconnect them
            this.removePlayerFormCurrentLobby(socket, io);

            data.nPlayers = xss.inHTMLData(data.nPlayers);
            data.name = xss.inHTMLData(data.name);
            data.name = data.name.substring(0, 20);
            data.mapName = xss.inHTMLData(data.mapName);

            // Check the user input
            if (data.nPlayers > ServerSettings.MAX_PLAYERS_PER_LOBBY || data.nPlayers < 2) {
                data.nPlayers = 4;
            }

            //Once a new game lobby has been created, add the user who created it.
            var userId = socket.data.userId;
            var googleUserId = socket.data.googleUserId;

            console.log("@ Create lobby by user with ID " + data.name + " with name " + googleUserId + " using map " + data.mapName);
            var newGameLobby = this.createGameLobby(data.name, parseInt(data.nPlayers), data.mapName);
            newGameLobby.join(userId, googleUserId, socket);

            console.log(" Lobby list " + this.gameLobbies);
            io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(this.getGameLobbies()));
        });

        // Google plus login
        socket.on(Events.lobby.GOOGLE_PLUS_LOGIN, (googleAuthToken) => {
            // TODO use this inside of cURL
            //request({
            //    uri: "localhost:12060/repository/schema/fieldType",
            //    method: "POST",
            //    json: {
            //        action: "create",
            //        fieldType: {
            //            name: "n$name",
            //            valueType: { primitive: "STRING" },
            //            scope: "versioned",
            //            namespaces: { "my.demo": "n" }
            //        }
            //    }
            //});
            //io.log.info(Util.format("@ Events.lobby.GOOGLE_PLUS_LOGIN " + googleAuthToken));
            ////Call the RESTful api to find how the userId of the auth user from the token
            //curl(ServerSettings.LEADERBOARDS_API + "findUserIdByToken/" + googleAuthToken, function (err)
            //{
            //    var googleUserId = JSON.parse(this.body);
            //    //Assiocate this socket with the G+ userId
            //    socket.set('googleUserId', googleUserId);
            //});
        });

        // PLAYER_JOIN Game lobby
        socket.on(Events.gameLobby.PLAYER_JOIN, (gamelobbyId) => {

            //If the user was connected to another room disconnect them
            this.removePlayerFormCurrentLobby(socket, io);

            console.log("@ Events.client.JOIN_GAME_LOBBY " + gamelobbyId);

            // Get the usersId
            var userId = socket.data.userId;
            var googleUserId = socket.data.googleUserId;
            var gamelobby: ServerGameLobby = this.gameLobbies[gamelobbyId] as ServerGameLobby;
            gamelobby.join(userId, googleUserId, socket);

            io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(this.getGameLobbies()));
        });

        socket.on(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, (data) => {
            var userId = socket.data.userId;
            var gameLobbyId = socket.data.gameLobbyId;
            //this.gameLobbies[gameLobbyId].currentPlayerId = userId;
            console.log("@ Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS " + userId + " for lobby " + gameLobbyId + "   " + data);
            socket.broadcast.to(gameLobbyId).emit(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, data);
        });

        /************************************************************
        *   Game sync event bindings
        ************************************************************/
        socket.on(Events.client.UPDATE, (data) => {
            var userId = socket.data.userId;
            var gameLobbyId = socket.data.gameLobbyId;
            console.log("@ UPDATE   " + data);
            socket.broadcast.to(gameLobbyId).emit(Events.client.UPDATE, data);
        });

        socket.on(Events.client.ACTION, (data) => {
            var userId = socket.data.userId;
            var gameLobbyId = socket.data.gameLobbyId;
            console.log("@ Events.gameLobby.UPDATE from userId " + userId + " for lobby " + gameLobbyId + "   " + data);
            socket.broadcast.to(gameLobbyId).emit(Events.client.ACTION, data);

        });

        // This is done to make the action packets smaller
        socket.on(Events.client.CURRENT_WORM_ACTION, (data) => {
            var userId = socket.data.userId;
            var gameLobbyId = socket.data.gameLobbyId;
            console.log("@ Events.client.CURRENT_WORM_ACTION" + userId + " for lobby " + gameLobbyId + "   " + data);
            socket.broadcast.to(gameLobbyId).emit(Events.client.CURRENT_WORM_ACTION, data);
        });
    }

    // Creates the gamelobby object on the server
    createGameLobby(name: string, numberOfPlayers: number, mapName: string) {
        var newGameLobby = new ServerGameLobby(name, numberOfPlayers, mapName);
        newGameLobby.server_init();

        // lobbies are indexed by their unqine token
        this.gameLobbies[newGameLobby.id] = newGameLobby;

        return this.gameLobbies[newGameLobby.id] as ServerGameLobby;
    }
}
