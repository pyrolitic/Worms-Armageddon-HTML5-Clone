/**
 * Team
 * This manages all the worms a player controls and it also stores the weapons 
 * manager which controls what weapons a player has at there disposal.
 * It is also reponsibale for updating and drawing all the worms
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
///<reference path="Worm.ts"/>
///<reference path="system/Utilies.ts"/>
///<reference path="weapons/WeaponManager.ts"/>


class Team
{
    worms: Worm[];
    currentWorm: number;
    weaponManager: WeaponManager;
    color;


    constructor ()
    {
        //Random color - Credit Paul Irish
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        this.weaponManager = new WeaponManager();

        this.currentWorm = 0;
        this.worms = [];
        for (var i = 0; i < 2; i++)
        {
            this.worms.push(new Worm(this, Utilies.random(200, 1300), -2));
        }
    }

    getCurrentWorm()
    {
        return this.worms[this.currentWorm];
    }

    getWeaponManager()
    {
        return this.weaponManager;
    }

    setCurrentWorm(wormIndex)
    {
        this.currentWorm = wormIndex;
    }

    update()
    {
        var cachedLenght = this.worms.length;
        for (var i = 0; i < cachedLenght; i++)
        {
            this.worms[i].update();
        }
    }

    draw(ctx)
    {

        var cachedLenght = this.worms.length;
        for (var i = 0; i < cachedLenght; i++)
        {
            this.worms[i].draw(ctx);
        }

    }


}