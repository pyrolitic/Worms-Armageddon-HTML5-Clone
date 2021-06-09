/**
 * JetPack.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Sprite } from "../animation/Sprite";
import { Sprites } from "../animation/SpriteDefinitions";
import { Client } from "../networking/Client";
import { Events } from "../networking/Events";
import { InstructionChain } from "../networking/InstructionChain";
import { Controls } from "../system/Controls";
import { b2Vec2, Physics } from "../system/Physics";
import { keyboard, Utilies } from "../system/Utilies";
import { Worm } from "../Worm";
import { BaseWeapon } from "./BaseWeapon";
import { ThrowableWeapon } from "./ThrowableWeapon";

export class JetPack extends BaseWeapon
{
    thurstScaler: number;
    bottomflame: Sprite;
    sideflame: Sprite;
    forceDir : any;

    fuel: number;
    
    INITAL_FUEL: number;

    constructor (ammo : number)
    {
        super(
           "Jet Pack",
           ammo,
         Sprites.weaponIcons.jetPack,
         Sprites.worms.takeOutJetPack,
         Sprites.worms.defualtJetPack
       );

        this.thurstScaler = 0.15 * Worm.DENSITY;
        this.forceDir = new b2Vec2(0, 0);
        this.bottomflame = new Sprite(Sprites.weapons.jetPackFlamesDown);
        this.sideflame = new Sprite(Sprites.weapons.jetPackFlamesSide);

        // No requirement for crosshairs aiming
        this.requiresAiming = false;

        this.INITAL_FUEL = 20;
        this.fuel = this.INITAL_FUEL;
    }

    activate(worm: Worm)
    {
        if (this.getIsActive())
        {
            this.setIsActive(false);
        } else
        {
            super.activate(worm);
        }
    }

    draw(ctx : CanvasRenderingContext2D)
    {
        if (this.isActive)
        {
            if (this.forceDir.y != 0)
            {
                var pos = Physics.vectorMetersToPixels((this.worm as Worm).body.GetPosition());
                pos.x -= (this.bottomflame.getImage().width / 2) + (this.worm as Worm).direction * 10;
                pos.y -= 4;
                this.bottomflame.draw(ctx, pos.x, pos.y);
            }

            if (this.forceDir.x != 0)
            {
                var pos = Physics.vectorMetersToPixels((this.worm as Worm).body.GetPosition());
                pos.x -= (this.worm as Worm).direction * 13;
                pos.y -= 15;

                ctx.save()
                ctx.translate(pos.x, pos.y);

                if ((this.worm as Worm).direction == Worm.DIRECTION.right)
                {
                    // Used to flip the sprites       
                    ctx.scale(-1, 1);
                }
                this.sideflame.draw(ctx, 0, 0);
                ctx.restore();

            }

            var pos = Physics.vectorMetersToPixels((this.worm as Worm).body.GetPosition());
            ctx.save()
            ctx.translate(pos.x, pos.y);
            ctx.drawImage(ThrowableWeapon.numberBox, 30, -40);
            ctx.fillStyle = 'rgba(255,0,0,255)';
            ctx.fillText(Math.floor(this.fuel).toString(), 42, -20);
            ctx.restore();

           this.forceDir = new b2Vec2(0, 0);
        }
    }

    up()
    {
        this.forceDir.y = -1;
    }

    left()
    {
          this.forceDir.x = -1.2;
          (this.worm as Worm).direction = -1;
    }

    right()
    {
        this.forceDir.x = 1.2;
        (this.worm as Worm).direction = 1;
    }

    deactivate()
    {
        this.setIsActive(false);
        this.fuel = this.INITAL_FUEL;
        super.deactivate();
    }

    update()
    {
        if (this.fuel <= 0)
        {
            this.deactivate();
            Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.deactivate"));
        }

        if (this.isActive)
        {

            if (keyboard.isKeyDown(Controls.aimUp.keyboard))
            {
                this.up();
                Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.up"));
            }

            if (keyboard.isKeyDown(Controls.walkLeft.keyboard))
            {
                this.left();
                Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.left"));
            }

            if (keyboard.isKeyDown(Controls.walkRight.keyboard))
            {
                this.right();
                Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.right"));
            }

            if (this.forceDir.Length() > 0)
            {
                Utilies.pickRandomSound(["JetPackLoop1", "JetPackLoop2"]).play();
                this.fuel -= 0.09;
                this.forceDir.Multiply(this.thurstScaler);
                (this.worm as Worm).body.ApplyImpulse(this.forceDir, (this.worm as Worm).body.GetWorldCenter());
            }

            (this.worm as Worm).setSpriteDef(Sprites.worms.defualtJetPack);
            (this.worm as Worm).finished = true;

            if (this.forceDir.y != 0)
                this.bottomflame.update();

            if (this.forceDir.x != 0)
                this.sideflame.update();

         
        }
    }

}