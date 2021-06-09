import { LobbyMenu } from "../gui/LobbyMenu";
import { Maps, Map } from "../environment/Maps";
import { Client } from "./Client";
import { Game } from "../Game";
import { Events } from "./Events";
import { Settings } from "../Settings";
import { BaseLobby, BaseGameLobby } from "./Lobby";
import { Player } from "../Player";
import { Logger, Notify, Utilies } from "../system/Utilies";
import { GameInstance } from "../MainInstance";

export class ClientGameLobby extends BaseGameLobby {
    constructor(name: string, numberOfPlayers: number, mapName : string  = "priates" )
    {
        super(name, numberOfPlayers, mapName);
    }

    client_init()
    {
        //Have the host client setup all the player objects with all the other clients ids
        Client.socket.on(Events.gameLobby.START_GAME_HOST, (data) =>
        {
            var gameLobby = (Utilies.copy(new BaseGameLobby("", 0), data));
            Game.map = new Map(Maps[gameLobby.mapName]);

            //Update local copy of the lobby
            GameInstance.lobby.client_GameLobby = gameLobby;
            //Pass player ids to init the game
            GameInstance.start(gameLobby.playerIds);

            //Once we have init the game, we most send all the game info to the other players
            Client.socket.emit(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, { "lobby": gameLobby, "gameData": GameInstance.getGameNetData() });
        });

        // Start the game for all other playrs by passing the player information create
        // by the host client to them.
        Client.socket.on(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, (data) =>
        {
             var gameLobby = (Utilies.copy(new BaseGameLobby("", 0), data.lobby));
             Game.map = new Map(Maps[gameLobby.mapName]);

             //Update local copy of the lobby
            GameInstance.lobby.client_GameLobby = gameLobby;

            //Just popluate the array with some players, we will override them with proper data now
            for (var i = 0; i <  gameLobby.playerIds.length ; i++)
            {
                GameInstance.players.push(new Player(gameLobby.playerIds[i]));
            }

            GameInstance.setGameNetData(data.gameData);
            GameInstance.start();
        });

        Client.socket.on(Events.gameLobby.PLAYER_DISCONNECTED, function (playerId)
        {
            Logger.log("Events.gameLobby.PLAYER_DISCONNECTED " + playerId);


            for (var j = GameInstance.players.length - 1; j >= 0; j--)
            {
                if (GameInstance.players[j].id == playerId)
                {
                    Notify.display(
                        GameInstance.players[j].getTeam().name + " has disconnected ",
                        "Looks like you were too much competition for them. They just gave up, well done!! Although they might have just lost connection... though we will say you won =)",
                    13000)

                    var worms = GameInstance.players[j].getTeam().getWorms();
                    //Kill all the players worms.
                    for (var i = 0; i < worms.length; i++)
                    {
                        worms[i].hit(999,null,true);
                    }

                    //If the user who disconnected is the current one signal next turn
                    if (GameInstance.players[j].id == GameInstance.state.getCurrentPlayer().id)
                    {
                        GameInstance.state.tiggerNextTurn();
                    }
                    return;
                }
            }
        });
    }
}

export class ClientLobby extends BaseLobby {
    //This is used on the client side and is a reference
    // to the game lobby the client is attached to.
    client_GameLobby: ClientGameLobby;
    menu: LobbyMenu | null = null;

    constructor() {
        super();
        this.client_GameLobby = new ClientGameLobby("", 0);
    }

    init() {
        this.menu = new LobbyMenu(this);

        // Somthing didnt go right with connnecting to the server so exit
        if (!Client.connectionToServer(Settings.NODE_SERVER_IP, Settings.NODE_SERVER_PORT)) {
            return false;
        }

        GameInstance.gameType = Game.types.ONLINE_GAME;

        // Create lobby
        Client.socket.on(Events.lobby.UPDATE_USER_COUNT, (userCount) => {
            Logger.log("Events.lobby.NEW_USER_CONNECTED " + userCount);
            this.userCount = userCount;
            (this.menu as LobbyMenu).updateUserCountUI(this.userCount);
        });

        //Bind events
        Client.socket.on(Events.client.UPDATE_ALL_GAME_LOBBIES, (data) => {
            Logger.debug(" Events.client.UPDATE_ALL_GAME_LOBBIES " + data);
            var gameLobbyList: { [key: string]: BaseGameLobby; } = JSON.parse(data);
            var updatedGameLobbies: { [key: string]: BaseGameLobby; } = {};
            for (var gameLobby in gameLobbyList) {
                updatedGameLobbies[gameLobby] = (Utilies.copy(new BaseGameLobby("", 0), gameLobbyList[gameLobby]));
            }

            this.gameLobbies = updatedGameLobbies;
            (this.menu as LobbyMenu).updateLobbyListUI(this);

        });

        this.client_GameLobby.client_init();
    }

    createGameLobby(name: string, numberOfPlayers: number, mapName: string) {
        (this.menu as LobbyMenu).displayMessage(" Waiing on more players.... ");
        Client.socket.emit(Events.lobby.CREATE_GAME_LOBBY, { "name": name, "nPlayers": numberOfPlayers, "mapName": mapName });
    }

    joinGameLobby(lobbyId: string) {
        (this.menu as LobbyMenu).displayMessage(" Waiting on more players.... ");
        Client.socket.emit(Events.gameLobby.PLAYER_JOIN, lobbyId);
    }

    joinQuickGame() {
        for (var i in this.gameLobbies) {
            var lob: BaseGameLobby = this.gameLobbies[i];

            if (lob.isFull() == false) {
                if (lob.contains(Client.id)) {
                    Notify.display("Your already join the lobby", "Still waiting for players");
                }

                else {
                    (this.menu as LobbyMenu).displayMessage(" Waiting on more players.... ");
                    Client.socket.emit(Events.gameLobby.PLAYER_JOIN, lob.id);
                    return true;
                }
            }
        }

        //If it doesn't find any empty lobby for the user it creates one.
        this.createGameLobby("Default QuickGame", 2, Maps.smallCastle.name);
    }
}
