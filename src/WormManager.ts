/**
 * WormManager.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */

import { GameInstance } from "./MainInstance";
import { Client } from "./networking/Client";
import { Events } from "./networking/Events";
import { InstructionChain } from "./networking/InstructionChain";
import { Player } from "./Player";
import { Logger } from "./system/Utilies";
import { ProjectileWeapon } from "./weapons/ProjectileWeapon";
import { ThrowableWeapon } from "./weapons/ThrowableWeapon";
import { Worm } from "./Worm";
import { WormAnimationManger } from "./WormAnimationManger";


export class WormManager
{

    allWorms: Worm[];

    constructor (players : Player[])
    {
        this.allWorms = [];

        // Get a reference to all the worms from each team
        // for fast acessing, when asking quetions of all them.
        for (var i = 0; i < players.length; i++)
        {
            var worms = players[i].getTeam().getWorms();
            for (var j = 0; j < worms.length; j++)
            {
                this.allWorms.push(worms[j]);
            }
        }

        Logger.log( this.allWorms.toString());
    }

    findWormWithName(name: string)
    {
        for (var i = this.allWorms.length - 1; i >= 0; --i)
        {
            if (this.allWorms[i].name == name)
            {
                return this.allWorms[i];
            }
        }

        Logger.error("Unable to find worm with name " + name);
        return null;
    }

    // are all the worms completely finished, animations, health reduction, actions etc.
    areAllWormsReadyForNextTurn()
    {
        return WormAnimationManger.playerAttentionSemaphore == 0 && this.areAllWormsStationary() && this.areAllWormsDamageTaken() && this.areAllWeaponsDeactived();
    }

    // Are all the worms stop, not moving at all. 
    areAllWormsStationary()
    {

        for (var i = this.allWorms.length-1; i >= 0; --i)
        {
            if (this.allWorms[i].isStationary() == false)
            {
                return false;
            }
        }

        return true;
    }

    findFastestMovingWorm()
    {
        var highestVecloity = 0;
        var wormWithHighestVelocity : Worm | null = null;
        var lenght = 0;

        for (var i = this.allWorms.length-1; i >= 0; --i)
        {
            lenght = this.allWorms[i].body.GetLinearVelocity().Length();

            if (lenght > highestVecloity)
            {
                highestVecloity = lenght;
                wormWithHighestVelocity = this.allWorms[i];
            }
        }

        return wormWithHighestVelocity ;
    }


    areAllWeaponsDeactived()
    {
        for (var i = this.allWorms.length-1; i >= 0; --i)
        {
            if (this.allWorms[i].team.getWeaponManager().getCurrentWeapon().getIsActive() == true)
            {
                return false;
            }
        }

        return true;
    }

    //deactivate all non-time based weapons, such as jetpacks and ropes etc. 
    deactivedAllNonTimeBasedWeapons()
    {
        for (var i = this.allWorms.length-1; i >= 0; --i)
        {
            var weapon = this.allWorms[i].team.getWeaponManager().getCurrentWeapon();
            if (weapon.getIsActive() == true)
            {
                if ((weapon instanceof ThrowableWeapon || weapon instanceof ProjectileWeapon) == false)
                {
                    weapon.deactivate();
                }
            }
        }

        return true;
    }

    // Are all worm accumlated damage pionts taken from their total health yet?
    areAllWormsDamageTaken()
    {
        for (var i = 0; i < this.allWorms.length; i++)
        {
            if (this.allWorms[i].damageTake != 0)
            {
                return false;
            }

            // May have taken the health away but are now waiting for the death squence to start, so contine to return false
            if (this.allWorms[i].getHealth() == 0 && this.allWorms[i].damageTake == 0 && this.allWorms[i].isDead == false)
            {
                return false;
            }
        }

        return true;
    }

    syncHit(wormName : string | any[], damage : number)
    {
        if (Client.isClientsTurn())
        {
            var parameters = [wormName, damage];
            Client.sendImmediately(Events.client.ACTION, new InstructionChain("wormManager.syncHit", parameters));

        } else
        {
            var dm = wormName[1];
            var wn = wormName[0];

           var worm : Worm | null=  GameInstance.wormManager.findWormWithName(wn);

            if (worm)
            {
                worm.damageTake += dm;
                worm.hit(0, null);
            }
               
        }
    }

}