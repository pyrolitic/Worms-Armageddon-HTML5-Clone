/**
 *
 * Lobby.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
export var SOCKET_STORAGE_GAMELOBBY_ID = 'gameLobbyId';

export class BaseGameLobby
{
    static LOBBY_STATS = {
        WATTING_FOR_PLAYERS: 0,
        GAME_IN_PLAY: 1
    }

    protected playerIds: string[];
    name: string;
    id: string = "";
    gameLobbyCapacity: number;

    status: number;

    mapName;
    currentPlayerId: string;

    static gameLobbiesCounter = 0;

    constructor(name: string, numberOfPlayers: number, mapName : string  = "priates" )
    {
        this.name = name;
        this.mapName = mapName;
        this.playerIds = [];
        this.gameLobbyCapacity = numberOfPlayers;
        this.currentPlayerId = "";
        this.status = BaseGameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS;
    }

    getNumberOfPlayers()
    {
        return this.gameLobbyCapacity;
    }

    getPlayerSlots(){
        return this.playerIds.length;
    }
    
    contains(playerId: string) : boolean
    {
        for (var i in this.playerIds)
        {
            if (this.playerIds[i] == playerId)
            {
                return true;
            }
        }

        return false;
    }

    isLobbyEmpty()
    {
        return (this.playerIds.length == 0);
    }

    isFull()
    {
        return this.gameLobbyCapacity == this.playerIds.length;
    }
}

export class BaseLobby
{
    protected gameLobbies : {[key:string] : BaseGameLobby};
    userCount: number;
    highestUserCount: number = 0;

    constructor()
    {
        this.userCount = 0;
        this.highestUserCount = 0;
        this.gameLobbies = {};
    }

    getGameLobbies()
    {
        return this.gameLobbies;
    }
}

