/**
 * Game.js
 * This is the main game object which controls gameloop and basically everything in the game
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { EffectsManager } from "./animation/EffectsManager";
import { Cloud } from "./animation/Particle";
import { ParticleEffect } from "./animation/ParticleEffect";
import {Map, Maps} from "./environment/Maps";
import {Terrain} from "./environment/Terrain";
import { GameStateManager } from "./GameStateManager";
import { CountDownTimer } from "./gui/CountDownTimer";
import { HealthMenu } from "./gui/HealthMenu";
import { StartMenu } from "./gui/StartMenu";
import {WeaponsMenu} from "./gui/WeaponsMenu";
import { GameInstance } from "./MainInstance";
import { Client } from "./networking/Client";
import { Events } from "./networking/Events";
import { access_token } from "./networking/LeaderBoard/GooglePLus";
import { ClientLobby } from "./networking/ClientLobby";
import {Player, PlayerDataPacket} from "./Player";
import { Settings } from "./Settings";
import { AssetManager } from "./system/AssetManager";
import { Camera } from "./system/Camera";
import { TwinStickControls } from "./system/GamePad";
import { Graphics } from "./system/Graphics";
import { b2Vec2, Physics, PhysiscsDataPacket } from "./system/Physics";
import { keyboard, Logger, Notify, TouchUI, Utilies } from "./system/Utilies";
import { Tutorial } from "./Tutorial";
import { WormManager } from "./WormManager";
import { InstructionChain } from "./networking/InstructionChain";
export class Game
{
    static types = {
        ONLINE_GAME: 0,
        LOCAL_GAME: 1
    };

    actionCanvas : HTMLCanvasElement;
    actionCanvasContext : CanvasRenderingContext2D;

    terrain: Terrain | null = null;
    players: Player[];

    gameType: number;

    weaponMenu: WeaponsMenu | null = null;
    healthMenu: HealthMenu | null = null;
    gameTimer: CountDownTimer | null = null;

    wormManager: WormManager | null = null;
    state: GameStateManager;

    particleEffectMgmt: EffectsManager | null = null;

    //Manages arrows and generate indicators
    miscellaneousEffects: EffectsManager | null = null;

    //Manages things like the clouds
    enviormentEffects: EffectsManager | null = null;

    lobby: ClientLobby;

    winner: Player | null = null;

    static map: Map = new Map(Maps['castle']);

    camera: Camera | null = null;

    //Using in dev mode to collect spawn positions
    spawns : any[];

    tutorial: Tutorial | null = null;

    sticks : TwinStickControls | null = null;


    constructor()
    {
        Graphics.init();
        this.gameType = Game.types.LOCAL_GAME;

        //Create action canvas
        this.actionCanvas = Graphics.createCanvas("action");
        this.actionCanvasContext = this.actionCanvas.getContext("2d") as CanvasRenderingContext2D;

        this.sticks = new TwinStickControls(this.actionCanvas);

        this.setupCanvas();

        //If the window gets resize, resize the canvas
        $(window).resize(() => {
            this.setupCanvas();
        });

        //If we go full screen also resize
        document.addEventListener("fullscreenchange", () => {
            this.setupCanvas();
        }, false);

        document.addEventListener("mozfullscreenchange", () => {
            this.setupCanvas();
        }, false);

        document.addEventListener("webkitfullscreenchange", () => {
            this.setupCanvas();
        }, false);

        Physics.init(this.actionCanvasContext);

        // Manages the state of the game, the player turns etc.
        this.state = new GameStateManager();

        this.players = []; //TODO Make this work as a c-style array(4)

        // Development stuff
        this.spawns = [];
        if (Settings.DEVELOPMENT_MODE && this.particleEffectMgmt != null)
        {
            window.addEventListener("click", (evt: any) =>
            {
                this.particleEffectMgmt.add(new ParticleEffect(this.camera.getX() + evt.pageX, this.camera.getY() + evt.pageY));
                this.spawns.push(new b2Vec2(this.camera.getX() + evt.pageX, this.camera.getY() + evt.pageY));
                Logger.log(JSON.stringify(this.spawns));

            }, false);
        }

        this.lobby = new ClientLobby();
    }

    getGameNetData()
    {
        return new GameDataPacket(this);
    }

    setGameNetData(data : GameDataPacket)
    {
        var gameDataPacket: GameDataPacket = Utilies.copy(new GameDataPacket(this), data);
        gameDataPacket.override(this);
    }

    setupCanvas()
    {
        //Set canvas font stuff
        this.actionCanvas.width = $(window).width() as number;
        this.actionCanvas.height = $(window).height() as number;
        this.actionCanvasContext.font = 'bold 16px Sans-Serif';
        this.actionCanvasContext.textAlign = 'center';
        this.actionCanvasContext.fillStyle = "#384084"; // Water
    };

    goFullScreen()
    {

        //var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
        //        (document.mozFullScreen || document.webkitIsFullScreen);

        //var docElm = document.documentElement;
        //if (!isInFullScreen)
        //{

        //    if (docElm.requestFullscreen)
        //    {
        //        docElm.requestFullscreen();
        //    }
        //    else if (docElm.mozRequestFullScreen)
        //    {
        //        docElm.mozRequestFullScreen();

        //    }
        //    else if (docElm.webkitRequestFullScreen)
        //    {
        //        docElm.webkitRequestFullScreen();
        //    }
        //}
    }

    start(playerIds : number[] | null = null)
    {
        this.terrain = new Terrain(this.actionCanvas, Game.map.getTerrainImg(), Physics.world, Physics.worldScale);
        this.camera = new Camera(this.terrain.getWidth(), this.terrain.getHeight(), this.actionCanvas.width, this.actionCanvas.height);
        this.camera.setX(this.terrain.getWidth() / 2);
        this.camera.setY(this.terrain.getHeight() / 2);


        if (this.gameType == Game.types.LOCAL_GAME)
        {
            for (var i = 0; i < 2; i++)
            {
                this.players.push(new Player());
            }

        } else if (this.gameType == Game.types.ONLINE_GAME && playerIds != null)
        {

            for (var i = 0; i < playerIds.length; i++)
            {
                this.players.push(new Player(playerIds[i]));
            }
        }


        this.state.init(this.players);

        // Allows for a easily accissble way of asking questions of all worms regardless of team
        this.wormManager = new WormManager(this.players);

        // Initalizes UI elements
        this.weaponMenu = new WeaponsMenu();
        this.healthMenu = new HealthMenu(this.players);
        this.gameTimer = new CountDownTimer();

        // Initalizse the various animations/effect managers
        this.particleEffectMgmt = new EffectsManager();
        this.miscellaneousEffects = new EffectsManager();
        this.enviormentEffects = new EffectsManager();

        //Add some random clouds to the enviorment
        for (var i = 0; i < 15; i++)
        {
            this.enviormentEffects.add(new Cloud());
        }

        this.healthMenu.show();
        this.gameTimer.show();
        this.weaponMenu.show();



        // Need to fire the menu call back to remove it and start the game

        if (this.gameType == Game.types.ONLINE_GAME)
        {
            StartMenu.callback();
        }

        //Diable certain keys
        $(document).on({
            keydown :function (e : KeyboardEvent)
            {
                if (e.code == "Backspace")
                {
                    e.preventDefault();
                }
            }
        });

        //Only inited if its a touch device
        TouchUI.init();

        setTimeout(() =>
        {
            this.state.physicsWorldSettled = true;

        }, 1200);

        this.nextTurn();

    }

    // This method allows for quick use of the instruction chain
    // mechanisim over the network to call nextPlayer.
    nextTurn()
    {
        var id = this.state.nextPlayer();

        // If the id is -1 then the next player is dead
        if (id == null)
        {
            this.nextTurn()
        } else
        {
            Logger.log(" Player was " + this.lobby.client_GameLobby.currentPlayerId + " player is now " + id);
            this.lobby.client_GameLobby.currentPlayerId = id;
            this.gameTimer.timer.reset();
            AssetManager.getSound("yessir").play();

            if (this.tutorial == null && Client.isClientsTurn())
            {
                Notify.display("Time's a ticking", "Its your go " + this.state.getCurrentPlayer().getTeam().name, 9000);
            } else if (this.tutorial == null)
            {
                //Quick hack sprint 4 demo in a few hours - All clients are give bouncing arrows over their worms
                // so want to remove all arrows from clients whos go it current isn't
                GameInstance.miscellaneousEffects.stopAll();

                Notify.display(this.state.getCurrentPlayer().getTeam().name + "'s turn", "Sit back relax and enjoy the show", 9000, Notify.levels.warn);
            }
        }

    }

    update()
    {
        if (this.state.isStarted)
        {
            // while no winner, check for one
            if (this.winner == null)
            {
                this.winner = this.state.checkForWinner();

                if (this.winner)
                {
                    this.gameTimer.timer.pause();
                    this.winner.getTeam().celebrate();

                    //TODO fix this up, do server side, just putting in for demo 2moro.
                    if (this.winner.id == Client.id && access_token && GameInstance.gameType != Game.types.LOCAL_GAME)
                    {
                        Notify.display("Congratulations you won!", "", -1,Notify.levels.sucess,true);
                        $.ajax({
                            url: "http://96.126.111.211/updateUser/" + access_token,
                            dataType: 'jsonp'
                        });
                    } else
                    {
                        Notify.display("Unlucky you lost, better luck next time", "", -1, Notify.levels.error,true);
                    }
                }
            }

            // When ready to go to the next player and while no winner
            if (this.state.readyForNextTurn() && this.winner == null)
            {
                //If this player is the host they will decide when to move to next player
                if (Client.isClientsTurn())
                {
                    Client.sendImmediately(Events.client.ACTION, new InstructionChain("nextTurn"));
                    this.nextTurn();
                }
            }

            if (this.tutorial != null)
            {
                this.tutorial.update();
            }

            for (var i = this.players.length - 1; i >= 0; --i)
            {
                this.players[i].update();
            }

            this.terrain.update();
            this.camera.update();
            this.particleEffectMgmt.update();
            this.miscellaneousEffects.update();
            this.enviormentEffects.update();
            this.gameTimer.update();

            if (Client.isClientsTurn())
            {
                GameInstance.sticks.update();
            }
        }
    }

    step()
    {
        if (this.state.isStarted)
        {
            Physics.world.Step(
                  (1 / 60)
               , 10       //velocity iterations
               , 10       //position iterations
            );

            //While there is physics objects to sync do so
            if (this.gameType == Game.types.ONLINE_GAME && this.lobby.client_GameLobby.currentPlayerId == Client.id)
            {
                Client.sendRateLimited(Events.client.UPDATE, new PhysiscsDataPacket(Physics.fastAcessList).toJSON());
            }
        }
        //Physics.world.ClearForces();
    }

    draw()
    {
        this.actionCanvasContext.clearRect(0, 0, this.actionCanvas.width, this.actionCanvas.height);

        this.actionCanvasContext.save();
        this.actionCanvasContext.translate(-this.camera.getX(), -this.camera.getY());
        this.enviormentEffects.draw(this.actionCanvasContext);
        this.terrain.wave.drawBackgroundWaves(this.actionCanvasContext, 0, this.terrain.bufferCanvas.height, this.terrain.getWidth());
        this.actionCanvasContext.restore();

        this.terrain.draw(this.actionCanvasContext);

        this.actionCanvasContext.save();
        this.actionCanvasContext.translate(-this.camera.getX(), -this.camera.getY());

        this.terrain.wave.draw(this.actionCanvasContext, this.camera.getX(), this.terrain.bufferCanvas.height, this.terrain.getWidth());

        if (Settings.PHYSICS_DEBUG_MODE)
        {
            Physics.world.DrawDebugData();
        }

        for (var i = this.players.length - 1; i >= 0; --i)
        {
            this.players[i].draw(this.actionCanvasContext);
        }

        this.miscellaneousEffects.draw(this.actionCanvasContext);
        this.particleEffectMgmt.draw(this.actionCanvasContext);


        this.actionCanvasContext.restore();

        if (Client.isClientsTurn())
            GameInstance.sticks.draw(this.actionCanvasContext);
    }

}


class GameDataPacket
{
    players: PlayerDataPacket[];

    constructor(game: Game, physics = Physics)
    {
        this.players = [];
        for (var p in game.players)
        {
            this.players.push(new PlayerDataPacket(game.players[p]));
        }
    }

    override(game: Game, physics = Physics)
    {
        for (var p in this.players)
        {
            this.players[p].override(game.players[p]);
        }

    }
}