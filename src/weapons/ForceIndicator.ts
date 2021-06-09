/**
 * ForceIndicator.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Sprite } from "../animation/Sprite";
import { Sprites } from "../animation/SpriteDefinitions";
import { AssetManager } from "../system/AssetManager";
import { Graphics } from "../system/Graphics";
import { Physics } from "../system/Physics";
import { Utilies } from "../system/Utilies";
import { Worm } from "../Worm";

export class ForceIndicator
{
    private forcePercentage: number;
    //private forceRateIncrease : number;
    private forceMax : number;
    private  sprite: Sprite;
    private  needReRender: boolean;
    private  renderCanvas : HTMLCanvasElement | null;

    constructor(maxForceForWeapon : number)
    {
        this.forceMax = maxForceForWeapon; // Max force at which worms can throw
        this.forcePercentage = 1;
        this.sprite = new Sprite(Sprites.particleEffects.blob);
        this.needReRender = true;
        this.renderCanvas = null;
    }

    // Some weapons don't require a force build up meter
    isRequired()
    {
        return this.forceMax != 0;
    }


    draw(ctx : CanvasRenderingContext2D, worm: Worm)
    {
        if (this.isCharging() && this.isRequired())
        {

            if (this.needReRender)
            {
                this.renderCanvas = Graphics.preRenderer.render((context : CanvasRenderingContext2D) =>
                {
                    // if(this.renderCanvas == null)
                     //context.fillRect(0, 0, 400, 400);

                    this.sprite.draw(context, 0, (this.forcePercentage / 100) * 100);
                    this.needReRender = false;

                }, this.sprite.getFrameWidth(), 200, this.renderCanvas);
            }


            var radius = worm.fixture.GetShape().GetRadius() * Physics.worldScale;
            var wormPos = Physics.vectorMetersToPixels(worm.body.GetPosition().Copy());
            var targetDir = worm.target.getTargetDirection().Copy();
            targetDir.Multiply(16);
            targetDir.Add(wormPos);

            ctx.save();

            ctx.translate(
                targetDir.x,
                targetDir.y
            )


            //TODO - Why do I put -90 in here? Is it that my target is wrong? Is it somthing to do with canvas corrdianate system. Hmm ask Ken.
            //TODO No is cause of the canvas corrdinate system, oh yea.
            ctx.rotate(Utilies.vectorToAngle(worm.target.getTargetDirection().Copy()) + Utilies.toRadians(-90));

            var canvas = this.renderCanvas as HTMLCanvasElement;
            ctx.drawImage(canvas, -radius,  -radius, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    charge(rate : number)
    {
        if (this.isRequired())
        {
            AssetManager.getSound("THROWPOWERUP").play();
            this.forcePercentage += rate;
            this.sprite.setCurrentFrame(this.sprite.getCurrentFrame() + 0.4);
            this.needReRender = true;

            if (this.forcePercentage > 100)
            {
                this.forcePercentage = 100;
                return true;
            }
        }
    }

    isCharging()
    {
        return this.forcePercentage > 1;
    }

    setMaxForce(forceScalerMax : number)
    {
        this.forceMax = forceScalerMax;
    }

    reset()
    {
        if (this.isRequired() && this.forcePercentage > 1)
        {
            this.forcePercentage = 1;
            AssetManager.getSound("THROWPOWERUP").pause();
            AssetManager.getSound("THROWRELEASE").play();
            var canvas = this.renderCanvas;
            if(canvas != null) { //TODO
                var ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            //Used to reset the sprite
            this.sprite.currentFrameY = 0;
        }
    }

    getForce()
    {
        return (this.forcePercentage / 100) * this.forceMax;
    }

}