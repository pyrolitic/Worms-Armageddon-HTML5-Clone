/**
 * AssetManager.js
 * This manages the loading of image and sound assets.
 * The loaded images and sounds are then acessable from any where by the following.
 * AssetManager.images["myImageName"] no need for the full url or the extenision
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
//<reference path="../audio/Sound.ts"/>

import { Sprites } from '../animation/SpriteDefinitions';
import { Settings } from '../Settings';
import {Sound, SoundFallback} from './../audio/Sound';
import {Maps} from './../environment/Maps';
import { Logger } from './Utilies';
import {BufferItem, BufferLoader} from './../audio/SoundBufferLoader';

export module AssetManager
{
    export var numAssetsLoaded: number = 0;

    // Placing an image url in the below array
    // will make sure its is loaded before the game starts.
    // you can then acess the image by AssetManager.getImage("placeHolderImage")
    // no need for the full url or the extenision
    var imagesToBeLoaded = [
        Settings.REMOTE_ASSERT_SERVER + "data/images/menu/stick.png"
    ];

    var audioToBeLoaded = [

        Settings.REMOTE_ASSERT_SERVER + "data/sounds/CursorSelect.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/explosion1.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/explosion2.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/explosion3.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/WalkExpand.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/WalkCompress.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/drill.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/JUMP1.WAV",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/TIMERTICK.WAV",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/holygrenade.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/hurry.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/ohdear.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/fire.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/victory.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/ow1.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/ow2.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/ow3.wav",
         Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/byebye.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/traitor.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/youllregretthat.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/justyouwait.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/watchthis.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/fatality.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/laugh.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/incoming.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/grenade.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/Speech/Irish/yessir.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/cantclickhere.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/StartRound.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/JetPackLoop1.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/JetPackLoop2.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/fuse.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/fanfare/Ireland.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/NinjaRopeFire.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/NinjaRopeImpact.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/ROCKETPOWERUP.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/HOLYGRENADEIMPACT.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/GRENADEIMPACT.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/WormLanding.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/THROWPOWERUP.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/THROWRELEASE.wav",
       Settings.REMOTE_ASSERT_SERVER + "data/sounds/SHOTGUNRELOAD.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/ShotGunFire.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/MiniGunFire.wav"

    ];

    export var images : {[key:string]: HTMLImageElement} = {};
    export var sounds : {[key:string]: Sound} = {};

    export function isReady()
    {
        return (numAssetsLoaded) == imagesToBeLoaded.length + audioToBeLoaded.length;
    }

    export function getPerAssetsLoaded()
    {
        //Logger.debug(" ImagesToLoad {0} AudioToLoad {1} and totalsofar {2}".format(imagesToBeLoaded.length, audioToBeLoaded.length, numAssetsLoaded));
        return ((numAssetsLoaded) / (imagesToBeLoaded.length + audioToBeLoaded.length)) * 100;
    }

    export function getImage(s : string) : HTMLImageElement
    {
        return images[s];
    }

    export function getSound(s : string): Sound
    {
        //If sound not found
        if (sounds[s] == null)
        {
            return new Sound("");
        }

        return sounds[s];
    }

    export function loadImages(sources : string[])
    {

        //var images : HTMLImageElement[] = [];
        var loadedImages = 0;
        var numImages = 0;
        // get num of sources
        for (var src in sources)
        {
            numImages++;
        }
        for (var src in sources)
        {
            var name = ((sources[src] as string).match("[a-z,A-Z,0-9]+[.]png") as RegExpMatchArray)[0].replace(".png", "");

            if (images[name] == null)
            {
                images[name] = new Image();

                if (Settings.BUILD_MANIFEST_FILE)
                {
                    $('body').append(images[name]);
                }

                images[name].onload = function ()
                {
                    //Logger.log(" Image " + this.src + " loaded sucessfully ");
                    if (++loadedImages >= numImages)
                    {
                        for (var img in images)
                        {
                            AssetManager.images[img] = images[img];
                        }
                    }

                    numAssetsLoaded++;
                };
            } else
            {
                Logger.error("Image " + sources[src] + " has the same name as" + images[name].src);
            }

            images[name].src = sources[src];
        }

    }

    export function addSpritesDefToLoadList()
    {
        // Load all sprites
        for (var sprite in Sprites.worms)
        {
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/" + Sprites.worms[sprite].imageName + ".png");
        }

        for (var sprite in Sprites.weaponIcons)
        {
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/weaponicons/" + Sprites.weaponIcons[sprite].imageName + ".png");
        }

        for (var sprite in Sprites.weapons)
        {
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/" + Sprites.weapons[sprite].imageName + ".png");
        }

        for (var sprite in Sprites.particleEffects)
        {
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/" + Sprites.particleEffects[sprite].imageName + ".png");
        }

        for (var map in Maps)
        {
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/levels/" + Maps[map].terrainImage + ".png");
            imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "data/images/levels/" + Maps[map].smallImage + ".png");
        }


    }

    export function loadAssets()
    {
        addSpritesDefToLoadList();

        loadImages(imagesToBeLoaded);


        //Hmm seems like IE9 doesn't like loading anymore then 40 audio files in parallel.
        //I have 44 audio assets :( #FuckYouInternetExplorer
        //Putting in a delay for IE users
        //if ($.browser.msie)
        //{
        //    var leftSide = audioToBeLoaded.splice(0, Math.floor(audioToBeLoaded.length / 2));
        //    loadSounds(leftSide);

        //    var timer = setInterval(() => {

        //        if (numAssetsLoaded >= imagesToBeLoaded.length + leftSide.length)
        //        {
        //            loadSounds(audioToBeLoaded);
        //            clearInterval(timer);
        //        }

        //    }, 5000);

        //} else
        //{
            loadSounds(audioToBeLoaded);
        //}
    }

    export function loadSounds(sources : string[])
    {
        //First lets try load our audio using the web audio API
        try
        {
            if (Settings.BUILD_MANIFEST_FILE)
            {
                throw "LOL"
            }

            Sound.context = new AudioContext();
            var bufferLoader = new BufferLoader(Sound.context, sources, function (bufferList : BufferItem[])
            {
                for (var i = 0; i < bufferList.length; i++)
                {
                    sounds[bufferList[i].name] = new Sound(bufferList[i].buffer);
                    numAssetsLoaded++;
                }
            });
            bufferLoader.load();

        }
         catch (e) //web Auido api failed so lets try the normal audio tag
        {
            console.log('Web Audio API is not supported in this browser');
            try
            {
                var testForAudio = new Audio();

                for (var src in sources)
                {
                    var name = ((sources[src] as string).match("[a-z,A-Z,0-9]+[.]") as RegExpMatchArray)[0].replace(".", "")

                    /*// If IE use mp3 instead
                    if ($.browser.msie)
                    {
                        sources[src] = sources[src].replace(".wav", ".mp3");
                        sources[src] = sources[src].replace(".WAV", ".mp3");
                    }

                    //Hmm seems like IE9 doesn't like loading anymore then 40 audio files in parallel.
                    //I have 44 audio assets :( #FuckYouInternetExplorer
                    if ($.browser.msie &&  parseInt(src) >=  40)
                    {
                        numAssetsLoaded += sources.length-parseInt(src);
                        break;
                    }*/

                    sounds[name] = new SoundFallback(sources[src]);
                }
            } catch (e) // All HTML5 audio failed, this is not good :(
            {
                alert("The browser or device your using doesn't seem to like any type of HTML5 audio, sorry");
                numAssetsLoaded += sources.length; // To tell the loader everything is finished
            }
        }
    }

}