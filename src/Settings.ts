/**
 *  Global settings for the whole game
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
export module Settings
{

    //Game vars
    export var PLAYER_TURN_TIME = 45 * 1000; // 60 secounds
    export var TURN_TIME_WARING = 5; // after 10 secounds warn player they are running out of time

    //General game settings
    export var SOUND = false;

    //Server details
    export var NODE_SERVER_IP = 'http://127.0.0.1';
    export var LEADERBOARD_API_URL = 'http://127.0.0.1';
    export var NODE_SERVER_PORT = '8080';

    // development vars
    export var DEVELOPMENT_MODE = false;
    export var LOG = true;

    //When I want to build the manifest file using
    // http://westciv.com/tools/manifestR/
    export var BUILD_MANIFEST_FILE = false;

    export var REMOTE_ASSERT_SERVER = "../"; //"../college/fyp/"

    export var API_KEY = "AIzaSyA1aZhcIhRQ2gbmyxV5t9pGK47hGsiIO7U";

    export var PHYSICS_DEBUG_MODE = false;
    export var RUN_UNIT_TEST_ONLY = !true;

    export var NETWORKED_GAME_QUALITY_LEVELS = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2
    }

    export var NETWORKED_GAME_QUALITY = NETWORKED_GAME_QUALITY_LEVELS.HIGH;


    //Pasers commandline type arguments from the page url like this ?argName=value
    export function getSettingsFromUrl()
    {
        var argv = getUrlVars();
        var commands = ["physicsDebugDraw","devMode","unitTest","sound"]

        if (argv[commands[0]] == "true")
        {
            PHYSICS_DEBUG_MODE = true;
        }

        if (argv[commands[1]] == "true")
        {
            DEVELOPMENT_MODE = true;
        }

        if (argv[commands[2]] == "true")
        {
           var testWindow = window.open('test.html', '|UnitTests', 'height=1000,width=700,top:100%') as Window;
           testWindow.location.reload(); // This is so if the window was left open it refreshs

        }

        if (argv[commands[3]] == "false")
        {
            SOUND = false;
        }

        //Logger.log(" Notice: argv are as follows " + commands);
    }

    export function getUrlVars() : {[key: string] : string}
    {
        // This isn't conceptually "replacing" anything, but seems to be an easy way to iterate through the results?
        // Was originally returning true instead of the original value, but TS complained.
        // -M
        var vars : {[key: string] : string} = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key : string, value) =>
        {
            vars[key] = value;
            return window.location.href;
        });
        return vars;
    }
}