///<reference path="../Settings.ts" />
///<reference path="../animation/SpriteDefinitions.ts" />
///<reference path="../system/AssetManager.ts" />
///<reference path="ForceIndicator.ts" />

import { SpriteDefinition } from "../animation/SpriteDefinitions";
import { AssetManager } from "../system/AssetManager";
import { Logger } from "../system/Utilies";
import { Worm } from "../Worm";
import { ForceIndicator } from "./ForceIndicator";

export class BaseWeapon
{
    ammo : number;
    name : string;
    iconImage : HTMLImageElement;
    isActive : boolean = false;
    worm: Worm | null = null;
    takeOutAnimations: SpriteDefinition;
    takeAimAnimations: SpriteDefinition;
    forceIndicator: ForceIndicator;

    requiresAiming: boolean;

    constructor(name: string, ammo: number, iconSprite : SpriteDefinition, takeOutAnimation: SpriteDefinition, takeAimAnimation: SpriteDefinition)
    {
        this.name = name;
        this.ammo = ammo;

        this.takeOutAnimations = takeOutAnimation;
        this.takeAimAnimations = takeAimAnimation;
        //Setup the icon used in the weapon menu
        this.iconImage = AssetManager.getImage(iconSprite.imageName);

        this.requiresAiming = true;

        this.setIsActive(false);

        this.forceIndicator = new ForceIndicator(0);
    }

    getForceIndicator()
    {
        return this.forceIndicator;
    }

    getIsActive() { return this.isActive; }
    setIsActive(val : boolean) { this.isActive = val; }

    deactivate()
    {

    }

    activate(worm : Worm)
    {

        this.setIsActive(true);
        this.ammo--;
        this.worm = worm;

        Logger.debug(this.name + " was activated ");

    }

    update() { }
    draw(ctx : CanvasRenderingContext2D) { }
}

