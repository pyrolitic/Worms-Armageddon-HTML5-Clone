/**
 *  Shotgun.js
 *
 *  License: Apache 2.0
 *  author:  Ciaran McCann
 *  url: http://www.ciaranmccann.me/
 */

import { Effects } from "../animation/Effects";
import { SpriteDefinition, Sprites } from "../animation/SpriteDefinitions";
import { GameInstance } from "../MainInstance";
import { AssetManager } from "../system/AssetManager";
import { Physics } from "../system/Physics";
import { Timer } from "../system/Timer";
import { Worm } from "../Worm";
import { RayWeapon } from "./RayWeapon";
export class Shotgun extends RayWeapon
{
    fireAnimations: SpriteDefinition[];
    fireAnimationIndex: number;
    animationSheetChangeTimer: Timer;
    shotsTaken;

    constructor(ammo : number)
    {
        super(
            "Shotgun",
            ammo,
            Sprites.weaponIcons.shotgun,
            Sprites.worms.shotgunTakeOut,
            Sprites.worms.aimingShotgun
       )

        //Collection of three sprite sheets which
        // we will switch between to create the fire animation
        this.fireAnimations = [Sprites.worms.shotgunFirePump, Sprites.worms.aimingShotgun, Sprites.worms.shotgunFireAnimation1];
        this.fireAnimationIndex = 0;

        //Amount of the terrain to cut out
        this.damageToTerrainRadius = 30; //px

        //Health removed from worm when shot hits
        this.damgeToWorm = 30;

        this.forceScaler = 40;

        this.animationSheetChangeTimer = new Timer(300);

        this.shotsTaken = 0;

    }


    activate(worm: Worm)
    {
        if (this.getIsActive() == false)
        {
            super.activate(worm);

            this.animationSheetChangeTimer.reset();
            this.fireAnimationIndex = 0;
            AssetManager.getSound("SHOTGUNRELOAD").play(1, 0.3);
            this.shotsTaken++;
        }
    }

    update()
    {
        if (super.update())
        {
            this.animationSheetChangeTimer.update();

            if (this.animationSheetChangeTimer.hasTimePeriodPassed())
            {
                (this.worm as Worm).swapSpriteSheet(this.fireAnimations[this.fireAnimationIndex]);
                this.fireAnimationIndex++;
            }


            if (this.fireAnimationIndex >= this.fireAnimations.length)
            {
                var hitPiont = Physics.shotRay((this.worm as Worm).body.GetPosition(), (this.worm as Worm).target.getTargetDirection().Copy());
                if (hitPiont)
                {
                    Effects.explosion(hitPiont,
                        this.damageToTerrainRadius,
                        1,
                        this.forceScaler,
                        this.damgeToWorm,
                        this.worm,
                        AssetManager.getSound("ShotGunFire"));
                } else
                {
                    //Even if we miss the shot make a sound
                    AssetManager.getSound("ShotGunFire").play();
                }
                this.animationSheetChangeTimer.pause();
                this.fireAnimationIndex = 0;

                setTimeout(() => {
                    this.setIsActive(false);
                    (this.worm as Worm).swapSpriteSheet(this.fireAnimations[this.fireAnimationIndex]);

                    if (this.shotsTaken >= 2)
                    {
                        this.shotsTaken = 0;
                        GameInstance.state.tiggerNextTurn();
                    }

                }, 400);


            }

        }

        return false;
    }
}