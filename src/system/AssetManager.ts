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
///<reference path="../audio/Sound.ts"/>
declare var BufferLoader;

module AssetManager
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
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/MiniGunFire.wav",
        Settings.REMOTE_ASSERT_SERVER + "data/sounds/MINEIMPACT.wav",
         Settings.REMOTE_ASSERT_SERVER + "data/sounds/MINETICK.wav"

    ];

    export var images = [];
    export var sounds = [];

    export function isReady()
    {
        return (numAssetsLoaded) == imagesToBeLoaded.length + audioToBeLoaded.length;
    }

    export function getPerAssetsLoaded()
    {
        //Logger.debug(" ImagesToLoad {0} AudioToLoad {1} and totalsofar {2}".format(imagesToBeLoaded.length, audioToBeLoaded.length, numAssetsLoaded));
        return ((numAssetsLoaded) / (imagesToBeLoaded.length + audioToBeLoaded.length)) * 100;
    }

    export function getImage(s)
    {
        return images[s];
    }

    export function getSound(s): Sound
    {
        //If sound not found
        if (sounds[s] == null)
        {
            return new Sound(null);
        }

        return sounds[s];
    }

    export function loadImages(sources)
    {

        var images = [];
        var loadedImages = 0;
        var numImages = 0;
        // get num of sources
        for (var src in sources)
        {
            numImages++;
        }
        for (var src in sources)
        {
            var name = sources[src].match("[a-z,A-Z,0-9]+[.]png")[0].replace(".png", "");

            if (images[name] == null)
            {
                images[name] = new Image();
                images[name].onload = function ()
                {
                    Logger.log(" Image " + this.src + " loaded sucessfully ");
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
        loadSounds(audioToBeLoaded);
    }

    export function loadSounds(sources)
    {
        try
        {
            Sound.context = new webkitAudioContext();
            var bufferLoader = new BufferLoader(Sound.context, sources, function (bufferList)
            {
                for (var i = 0; i < bufferList.length; i++)
                {
                    sounds[bufferList[i].name] = new Sound(bufferList[i].buffer);
                    numAssetsLoaded++;
                }
            });
            bufferLoader.load();

        }
         catch (e)
        {
            console.log('Web Audio API is not supported in this browser');

            for (var src in sources)
            {
                var name = sources[src].match("[a-z,A-Z,0-9]+[.]")[0].replace(".", "")

                // If IE use mp3 instead 
                if ($.browser.msie)
                {
                    sources[src] = sources[src].replace(".wav", ".mp3");
                    sources[src] = sources[src].replace(".WAV", ".mp3");
                }

                sounds[name] = new SoundFallback(sources[src]);
            }
        }
    }

}