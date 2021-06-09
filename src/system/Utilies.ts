/**
 * Utitles
 * This namespace contains helper functions that I use a lot around the code base
 * or encapluate snippets of code I use a lot in the codebase though by naming it
 * asa function gives the code more readablity.
 *
 * Logger
 * Just wraps the console.log functions alloing me to switch them on and off easily
 *
 * Keyboard
 * Keeps track of which keys are pressed and allows for polling in gameloop
 * which is faster then event based input.
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Sound } from "../audio/Sound";
import { Settings } from "../Settings";
import { AssetManager } from "./AssetManager";
import { b2Vec2 } from "./Physics";

interface String
{
    format(...numbers: String[]) : void;
}

/*String.prototype.format = function (...numbers: String[])
{
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number)
    {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
            ;
    });
};*/

export function StringFormat (fmt : string, ...numbers: string[])
{
    var args = arguments;
    return fmt.replace(/{(\d+)}/g, function (match, number)
    {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
            ;
    });
};

export module Notify
{
    export var locked = false;
    export var levels = {
        sucess: "alert-success",
        warn: "alert-warn",
        error: "alert-error"
    };

    export function display(header: string, message: string, autoHideTime = 2800, cssStyle = Notify.levels.sucess,doNotOverWrite = false)
    {
        if (!locked)
        {
            locked = doNotOverWrite;
            $("#notifaction").removeClass(levels.warn);
            $("#notifaction").removeClass(levels.error);
            $("#notifaction").removeClass(levels.sucess);
            $("#notifaction").addClass(cssStyle);

            $("#notifaction strong").empty();
            $("#notifaction strong").html(header);

            $("#notifaction p").empty();
            $("#notifaction p").html(message);

            $("#notifaction").animate({
                top:  (parseInt($("#notifaction").css("height"))) +"px"
            }, 400, function ()
            {
                if (autoHideTime > 0)
                {
                    setTimeout(hide, autoHideTime);
                }
            });


        }


    }

    export function hide(callback : CallableFunction)
    {
        if (!locked)
        {
            $("#notifaction").animate({
                top: (-parseInt($("#notifaction").css("height"))) - 100 + "px"
            }, 400, () => {
                locked = false;
                if (callback != null)
                {
                    callback();
                }
            });
        }
    }

}

export module Utilies
{

    //Allows for the copying of Object types into their proper types, used for copy constructer
    //for objects that are sent over the network. I have intergrated this function, into
    // the constructor of the Person object so it acts like C-style copy construction
    // WARNING: This creates a deep copy, so reference are not preserved
    export function copy<T>(newObject : T, oldObject : T)
    {

        for (var member in oldObject)
        {
            // if the member is itself an object, then we most also call copy on that
            if (typeof (oldObject[member]) == "object")
            {
                //FIXME : Should be usig this try catch, fix it later
                try
                {
                    newObject[member] = copy(newObject[member], oldObject[member])
                } catch (e)
                {

                }
            } else
            {
                // if its a primative member just assign it
                try
                {
                    newObject[member] = oldObject[member];
                } catch (e)
                {

                }
            }
        }

        return newObject;
    };

    export function sign(x : number) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

    export function findByValue(needle : any, haystack : any, haystackProperity : any, )
    {

        for (var i = 0; i < haystack.length; i++)
        {
            if (haystack[i][haystackProperity] === needle)
            {
                return haystack[i];
            }
        }
        throw "Couldn't find object with proerpty " + haystackProperity + " equal to " + needle;
    }

    export function random(min : number, max : number)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function pickRandom(collection : any[])
    {
        return collection[random(0, collection.length - 1)];
    }

    var pickUnqineCollection : {[key:string]: any} = {};
    export function pickUnqine(collection : any[], stringId: string) : any
    {
        if (pickUnqineCollection[stringId])
        {
            var items = pickUnqineCollection[stringId];

            if (items.length <= 0)
            {
                Logger.error("Out of unqine items in collection " + stringId);
                return;
            }

            var index = random(0, items.length - 1)
            var unqineItem = items[index];
            deleteFromCollection(items, index);
            return unqineItem;

        } else
        {
            pickUnqineCollection[stringId] = collection;
            return pickUnqine(collection, stringId);
        }
    }


    export function pickRandomSound(collection: string[])
    {
        var sound: Sound = AssetManager.getSound(collection[random(0, collection.length - 1)]);

        if (!sound.play)
        {
            Logger.warn(" Somthing looks dogoy with the sound object " + sound);
        }

        return sound;
    }


    export function deleteFromCollection(collection : any[], indexToRemove : any)
    {
        delete collection[indexToRemove];
        collection.splice(indexToRemove, 1);
    }

    export function isBetweenRange(value : number, rangeMax : number, rangeMin : number)
    {
        return value >= rangeMin && value <= rangeMax;
    }

    export function angleToVector(angle: number)
    {
        return new b2Vec2(Math.cos(angle), Math.sin(angle));
    }

    export function vectorToAngle(vector : {x:number, y:number})
    {
        return Math.atan2(vector.y, vector.x);
    }

    export function toRadians(angleInDegrees: number)
    {
        return angleInDegrees * (Math.PI / 180);
    }

    export function toDegrees(angleInRdains: number)
    {
        return angleInRdains * (180 / Math.PI);
    }

    //export function isBetweenRangeTest()
    //{
    //    var t1 = isBetweenRange(3.3, 10, -10);
    //    var t2 = isBetweenRange(-2.3, 40, -3);
    //    var t3 = isBetweenRange(-25.3, 40, -3);

    //    if ( t1 == false || t2 == false || t3 == true)
    //    {
    //        Logger.error(" isBetweenRangeTestFailed ");
    //    } else
    //    {
    //        Logger.log("isBetweenTestPassed");
    //    }
    //};


	export function compress(s : any){
		var dict : {[key:string]: number} = {};
	    var data = (s + "").split("");
	    var tok : number[] = [];
	    var currChar : string;
	    var phrase = data[0];
	    var code = 256;
	    for (var i=1; i<data.length; i++) {
	        currChar=data[i];
	        if (dict[phrase + currChar] != null) {
	            phrase += currChar;
	        }
	        else {
	            tok.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
	            dict[phrase + currChar] = code;
	            code++;
	            phrase=currChar;
	        }
	    }
	    tok.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        var out : string[] = [];
	    for (var i=0; i<tok.length; i++) {
	        out[i] = String.fromCharCode(tok[i]);
	    }
	    return out.join("");
	}

	export function decompress(s : any)
	{
	    var dict : {[key:string]: any} = {};
	    var data = (s + "").split("");
	    var currChar = data[0];
	    var oldPhrase = currChar;
	    var out : string[] = [currChar];
	    var code = 256;
	    var phrase: string;
	    for (var i = 1; i < data.length; i++)
	    {
	        var currCode = data[i].charCodeAt(0);
	        if (currCode < 256)
	        {
	            phrase = data[i];
	        }
	        else
	        {
	            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
	        }
	        out.push(phrase);
	        currChar = phrase.charAt(0);
	        dict[code] = oldPhrase + currChar;
	        code++;
	        oldPhrase = phrase;
	    }
	    return out.join("");

	}

    export function isNumber(n : any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

}



export module Logger
{

    export function log(message : string)
    {
        if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            console.info(message);
    }

    export function warn(message : string)
    {
        if (Settings.DEVELOPMENT_MODE || Settings.LOG)
         console.warn(message);
    }

    export function debug(message : string)
    {
        if (Settings.DEVELOPMENT_MODE || Settings.LOG )
            console.log(message);
    }

    export function error(message : string)
    {
        if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            console.error(message);
    }
}

export module TouchUI
{
    var isFireHeld = false;
    var isJumpPressed = false;

    export function isTouchDevice() {
      return 'ontouchstart' in window || navigator.msMaxTouchPoints;

    };


    export function init()
    {
        if (TouchUI.isTouchDevice())
        {
            var fireButtonCssId = "touchFireButton";
            var jumpButtonCssId = "touchJump";
            //Using this to also insert the touch contorls for tablets
            $('body').append("<div class=touchButton id=" + fireButtonCssId + ">Fire</div>");
            $('body').append("<div class=touchButton id=" + jumpButtonCssId + ">Jump</div>");

            $("#" + fireButtonCssId).on({
                touchstart: (e : TouchEvent) =>
                {
                    e.preventDefault();
                    isFireHeld = true;
                    Logger.log("touchstarted");
                },
                touchend: (e : TouchEvent) =>
                {
                    isFireHeld = false;
                    Logger.log("touchend");
                }
            });

            $("#" + jumpButtonCssId).on({
                touchstart:  (e : TouchEvent) =>
                {
                    e.preventDefault();
                    isJumpPressed = true;
                },
                touchend: (e : TouchEvent) =>
                {
                    isJumpPressed = false;
                }
            });
        }
    }


    export function isFireButtonDown(reset = false)
    {
        if (isFireHeld && reset)
        {
            isFireHeld = false;
            return true;
        }

        return  isFireHeld;
    }

    export function isJumpDown(reset = false)
    {
         if (isJumpPressed && reset)
        {
            isJumpPressed = false;
            return true;
        }

        return  isJumpPressed;
    }




}

export module keyboard
{
    var keyDown : Set<string> = new Set();

    window.addEventListener("keydown", (ev) => {
        keyDown.add(ev.code);
    });
    window.addEventListener("keyup", (ev) => {
        keyDown.delete(ev.code);
    });

    export function isKeyDown(code : string, actLikeKeyPress = false)
    {
        if(keyDown.has(code)) {
            if (actLikeKeyPress) {
                keyDown.delete(code);
            }
            return true;
        }
        return false;
    }

    /*export function isKeyDown(keyCode : number, actLikeKeyPress = false)
    {
        if(keys[keyCode]) {
            if (actLikeKeyPress)
            {
                delete keys[keyCode]
            }

            return true;
        }
        return false;
    }*/

    export function getKeyName(code: string)
    {
        var m;
        if((m = code.match(/^Key(\w)$/))) {
            return m[1];
        }
        if((m = code.match(/^Arrow(\w+)$/))) {
            var dir = m[1].toLowerCase();
            return {"left": "⬅", "right": "➡", "up": "⬆", "down": "⬇"}[dir];
        }
        return code;
    }

    /*export var keyCodes : {[key:string]: number} = {
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,
        'Shift': 16,
        'Ctrl': 17,
        'Alt': 18,
        'Pause': 19,
        'Capslock': 20,
        'Esc': 27,
        'Pageup': 33,
        'Space': 32,
        'Pagedown': 34,
        'End': 35,
        'Home': 36,
        'Leftarrow': 37,
        'Uparrow': 38,
        'Rightarrow': 39,
        'Downarrow': 40,
        'Insert': 45,
        'Delete': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 101,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'numpad0': 96,
        'numpad1': 97,
        'numpad2': 98,
        'numpad3': 99,
        'numpad4': 100,
        'numpad6': 102,
        'numpad7': 103,
        'numpad8': 104,
        'numpad9': 105,
        'Multiply': 106,
        'Plus': 107,
        'Minut': 109,
        'Dot': 110,
        'Slash1': 111,
        'F1': 112,
        'F2': 113,
        'F3': 114,
        'F4': 115,
        'F5': 116,
        'F6': 117,
        'F7': 118,
        'F8': 119,
        'F9': 120,
        'F10': 121,
        'F11': 122,
        'F12': 123,
        'equal': 187,
        'Coma': 188,
        'Slash': 191,
        'Backslash': 220
    }*/
}