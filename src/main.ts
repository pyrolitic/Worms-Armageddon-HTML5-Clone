/**
 *
 * Worms Armageddon HTML5 Clone
 *
 * Main entry piont
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { StartMenu } from "./gui/StartMenu";
import { createGameInstance, GameInstance } from "./MainInstance";
import { Settings } from "./Settings";
import { AssetManager } from "./system/AssetManager";
import { Graphics } from "./system/Graphics";

declare global {
    interface Window {
        jQuery: any;
        $: any;
    }
}

$(document).ready(() => {

    Settings.getSettingsFromUrl();

    if (!Settings.RUN_UNIT_TEST_ONLY)
    {
        var startMenu = new StartMenu();

        createGameInstance();
        AssetManager.loadAssets();

        startMenu.onGameReady(function ()
        {
            startMenu.hide();
            if (GameInstance.state.isStarted == false)
            {
                GameInstance.start();
            }

            function gameloop()
            {
               if(Settings.DEVELOPMENT_MODE)
                Graphics.stats.update();

                GameInstance.step();
                GameInstance.update();
                GameInstance.draw();
                window.requestAnimationFrame(gameloop);
            }
            gameloop();

        });
    }

});