import { Sprites } from "../animation/SpriteDefinitions";
import { AssetManager } from "../system/AssetManager";
import { Physics, b2Vec2 } from "../system/Physics";
import { Utilies } from "../system/Utilies";
import { Worm } from "../Worm";
import { ThrowableWeapon } from "./ThrowableWeapon";

export class Dynamite extends ThrowableWeapon
{

    constructor (ammo : number)
    {
        //Modify the takeout animation, to be used as its idel animation or aiming animations
        // though you don't aim dynamaie. It just happens to be easy subclass of Throwable
        var modifedSpriteDef = Utilies.copy(
            {imageName: "", frameY: 0, frameCount: 0, msPerFrame: 0},
            Sprites.worms.takeOutDynamite);
        modifedSpriteDef.frameY = modifedSpriteDef.frameCount-1;

        super(
            "Dynamite", // Weapon name
            ammo,
            Sprites.weaponIcons.dynamite, //Icon for menu
            Sprites.weapons.dynamite, //Inital weapon object state
            Sprites.worms.takeOutDynamite,
            modifedSpriteDef
        );

        this.explosionRadius = 100;

        // Force/worm damge radius
        this.effectedRadius = Physics.pixelToMeters(this.explosionRadius * 1.8);

        // force scaler
        this.explosiveForce = 95;

        // No requirement for crosshairs aiming
        this.requiresAiming = false;

    }

    playWormVoice()
    {
        Utilies.pickRandomSound(["laugh"]).play();
    }


    //Gets the direction of aim from the target and inital velocity
    // The creates the box2d physics body at that pos with that inital v
    setupDirectionAndForce(worm: Worm)
    {
        //super activate calls this so I can play sound here

        var initalPosition = worm.body.GetPosition();
        //initalPosition.Multiply(1.5);
        this.setupPhysicsBodies(initalPosition, new b2Vec2(0, 0));

        // I don't want the dynmatic to roll
        this.body.SetFixedRotation(true);
    }

    throwFar() {
        return false;
    }

    update()
    {
        if (this.getIsActive())
        {
            this.sprite.update();
            AssetManager.getSound("fuse").play(1);
            super.update();
        }

    }

}

