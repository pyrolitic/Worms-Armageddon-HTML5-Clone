/**
 * RayBased Weapons.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { SpriteDefinition } from "../animation/SpriteDefinitions";
import { BaseWeapon } from "./BaseWeapon";

export class RayWeapon extends BaseWeapon
{
    damageToTerrainRadius: number;
    damgeToWorm: number;
    forceScaler: number = 1;

    constructor(name : string, ammo : number, iconSpriteDef : SpriteDefinition, takeOutAnimation: SpriteDefinition, takeAimAnimation: SpriteDefinition)
    {
        super(
            name,
            ammo,
          iconSpriteDef,
          takeOutAnimation,
          takeAimAnimation
        );

        //Amount of the terrain to cut out
        this.damageToTerrainRadius = 30; //px

        //Health removed from worm when shot hits
        this.damgeToWorm = 10;

 
    }

    update()
    {
        super.update();
        return (this.ammo != 0) && this.getIsActive();
    }

}
