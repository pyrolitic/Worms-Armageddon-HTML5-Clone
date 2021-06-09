/**
 *  Minigun.js
 *
 *  License: Apache 2.0
 *  author:  Ciaran McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Effects } from "../animation/Effects";
import { Sprites } from "../animation/SpriteDefinitions";
import { GameInstance } from "../MainInstance";
import { AssetManager } from "../system/AssetManager";
import { Physics } from "../system/Physics";
import { Timer } from "../system/Timer";
import { Worm } from "../Worm";
import { RayWeapon } from "./RayWeapon";

export class Minigun extends RayWeapon
{
    fireRate: Timer;

    constructor(ammo : number)
    {
        super(
            "Minigun",
            ammo,
            Sprites.weaponIcons.minigun,
            Sprites.worms.minigunTakeOut,
            Sprites.worms.minigunAim
       )


        //Amount of the terrain to cut out
        this.damageToTerrainRadius = 30; //px

        //Health removed from worm when shot hits
        this.damgeToWorm = 30;

        this.forceScaler = 30;

        this.fireRate = new Timer(300);
    }


    activate(worm: Worm)
    {
        super.activate(worm);
        (this.worm as Worm).swapSpriteSheet(Sprites.worms.minigunFire);

        //Setup a timer, to stop the weapon firing after so many secounds
        setTimeout(() => {

                //Once finished firing, deactive weapon and singal next turn
                this.setIsActive(false);
                GameInstance.state.tiggerNextTurn();

                (this.worm as Worm).swapSpriteSheet(this.takeAimAnimations);
        }, 1000);
        AssetManager.getSound("MiniGunFire").play();
    }

    update()
    {

        if (super.update())
        {
            this.fireRate.update();

            if (this.fireRate.hasTimePeriodPassed())
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
                       undefined);
                }
            }


        }
        return false;

    }

}




