/**
 * Sound.js
 * Sound wraps the Web audio api. When a sound file is loaded
 * one of these is created using the sound buffer. It allows for a
 * cleaner and simple api for doing basic things like playing sound, controling volume etc
 *
 * SoundFallback use just the simple Audio tag, works ok but not as feature full as web audio api.
 *
 *  License: Apache 2.0
 *  author:  Ciarán McCann
 *  url: http://www.ciaranmccann.me/
 */
/////<reference path="../system/Utilies.ts"/>
//declare var webkitAudioContext;

import { Settings } from "../Settings";
import { AssetManager } from "../system/AssetManager";
import { Logger } from "../system/Utilies";

export class Sound
{
    static context : AudioContext;

    source : AudioBufferSourceNode | null = null;
    buffer : AudioBuffer | string;
    playing: boolean;

    constructor(buffer : AudioBuffer | string)
    {
        this.buffer = buffer;
        this.playing = false;

        if (!this.buffer)
        {
            Logger.error("buffer null");
        }
    }

    play(volume = 1, time = 0, allowSoundOverLay = false)
    {
        if (Settings.SOUND && this.buffer != null)
        {
            // if sound is playing don't replay it
            if (this.playing == false || allowSoundOverLay == true)
            {
                this.source = Sound.context.createBufferSource();
                this.source.buffer = this.buffer as AudioBuffer;

                var gainNode = Sound.context.createGain();
                this.source.connect(gainNode);
                gainNode.connect(Sound.context.destination);
                gainNode.gain.value = volume;
                this.source.start(time);
                this.playing = true;
                var bufferLenght = (this.buffer as AudioBuffer).duration;

                setTimeout(() => {
                    this.playing = false;
                }, bufferLenght * 1000);
            }

        } else
        {
            Logger.debug("Sounds are currently disabled");
        }
    }

    isPlaying()
    {
        return this.playing;
    }

    pause()
    {
        if (Settings.SOUND && this.buffer != null) {
            if(this.source != null) {
                if (typeof(this.source.stop) !== 'undefined') {
                    this.source.stop(0);
                }
            }
        }
    }


}

//SoundFallback use just the simple Audio tag, works ok but not as feature full as web audio api.
export class SoundFallback extends Sound
{
    audio: HTMLAudioElement;

    constructor(soundSrc : string)
    {
        super(soundSrc);
        this.audio = SoundFallback.load(soundSrc);
    }

    static load(soundSrc : string) : HTMLAudioElement
    {
        let audio = <HTMLAudioElement>document.createElement("Audio");

        // When the sound loads sucesfully tell the asset manager
        $(audio).on("loadeddata", () =>
        {
            AssetManager.numAssetsLoaded++;
            Logger.log(" Sound loaded " + audio.src );
        });

        audio.onerror = () => {
            Logger.error( " Sound failed to load " + audio.src);
        }

        audio.src = soundSrc;
        $('body').append(audio);

        return audio;
    }

    play(volume = 1, time = 0, allowSoundOverLay = false)
    {
        if (Settings.SOUND)
        {
            // if sound is playing don't replay it
            //if (this.playing == false || allowSoundOverLay == true)
            {

                this.audio.volume = volume;
                this.audio.play();
                this.playing = true;
            }

        } else
        {
            Logger.debug("Sounds are currently disabled");
        }
    }

    isPlaying()
    {
        return this.playing;
    }

    pause()
    {
        if (Settings.SOUND)
        {
            this.audio.pause();
        }
    }
}


