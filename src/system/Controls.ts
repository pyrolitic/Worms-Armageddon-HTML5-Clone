import { keyboard } from "./Utilies"

/**
 *  
 * Centrialized location for controls and input
 *
 *  TODO Complete this when intergrating gamepad
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */

interface Control {
    gamepad?: number;
    keyboard: string;
    mouse?: number;
}

export module Controls
{
    export var toggleWeaponMenu : Control =
    {
        gamepad: -1,
        keyboard: "KeyE",
        mouse: 2
    }

    export var walkLeft : Control =
    {
        gamepad: -1,
        keyboard: "KeyA",
    }

    export var walkRight : Control =
    {
        gamepad: -1,
        keyboard: "KeyD",
    }

    export var jump : Control =
    {
        gamepad: -1,
        keyboard: "Space",
    }

    export var backFlip : Control =
    {
        gamepad: -1,
        keyboard: "Backspace",
    }

    export var aimUp : Control =
    {
        gamepad: -1,
        keyboard: "KeyW",
    }

    export var aimDown : Control =
    {
        gamepad: -1,
        keyboard: "KeyS",
    }

    export var fire : Control =
    {
        gamepad: -1,
        keyboard: "Enter",
        mouse: 0
    }

    /*export function checkControls(control : Control, key : any)
    {
        return (key == control.gamepad || key == control.keyboard ||  key == control.mouse);
    }*/
}