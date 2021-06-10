/**
 * Drill.js
 * This class manages the Drill tool which the worm
 * can use to drill down into the terrain and also hurt other worms.
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Sprites } from "../animation/SpriteDefinitions";
import { GameInstance } from "../MainInstance";
import { AssetManager } from "../system/AssetManager";
import { Physics } from "../system/Physics";
import { Timer } from "../system/Timer";
import { Logger } from "../system/Utilies";
import { Worm } from "../Worm";
import { BaseWeapon } from "./BaseWeapon";

export class Drill extends BaseWeapon
{
    timeBetweenExploisionsTimer: Timer;
    useDurationTimer: Timer;

    constructor(ammo : number, name = "Drill", icon = Sprites.weaponIcons.drill,takeOutAnimation = Sprites.worms.takeOutDrill, actionAnimation = Sprites.worms.drilling)
    {
        super(
            "Drill", // Weapon name
            ammo, // ammo
            icon, //Icon for menu
            takeOutAnimation, //animation fro worm taking out drill
            actionAnimation //animation fro worm taking out drill
        );

        this.timeBetweenExploisionsTimer = new Timer(450);
        this.useDurationTimer = new Timer(5200);

        // No requirement for crosshairs aiming
        this.requiresAiming = false;
    }

    activate(worm: Worm)
    {
        if (this.ammo > 0)
        {
            super.activate(worm);
            this.useDurationTimer.reset();
            this.timeBetweenExploisionsTimer.reset();
            (this.worm as Worm).setSpriteDef(this.takeAimAnimations, true,false);

            return true;
        } else
        {
            return false;
        }
    }

    deactivate()
    {
        this.setIsActive(false);
        Logger.debug(" deactivedate ");
        (this.worm as Worm).setSpriteDef(this.takeAimAnimations, false); //unlocks sprite
        //this.worm.setSpriteDef(Sprites.worms.idle1);
    }

    update()
    {
        if (this.getIsActive())
        {
            var weaponUseDuration = this.useDurationTimer.hasTimePeriodPassed();
            if (weaponUseDuration)
            {
                this.deactivate();
            }

            AssetManager.getSound("drill").play();

            if (this.timeBetweenExploisionsTimer.hasTimePeriodPassed())
            {
                GameInstance.terrain.addToDeformBatch(Physics.metersToPixels((this.worm as Worm).body.GetPosition().x), Physics.metersToPixels((this.worm as Worm).body.GetPosition().y), 25);
            }

            this.useDurationTimer.update();
            this.timeBetweenExploisionsTimer.update();

        }

    }

}
