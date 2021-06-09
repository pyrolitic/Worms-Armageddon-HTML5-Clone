/**
 *
 * This class manages animation of sprites
 * Its normally a base class for most objects in game like the Worm.
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { AssetManager } from "../system/AssetManager";
import { SpriteDefinition } from "./SpriteDefinitions";

export class Sprite
{

    spriteDef : SpriteDefinition;
    currentFrameY: number = 0;

    finished: boolean;
    noLoop: boolean;
    lastUpdateTime;
    accumulateDelta;
    isSpriteLocked;
    onFinishFunc : CallableFunction | null = null;
    frameHeight : number = 0;
    image : HTMLImageElement;

    frameIncremeter;


    constructor (spriteDef: SpriteDefinition, noLoop = false)
    {
        //Defualts to moving forward though the sprite
        //though can be used to move back though the sprite
        this.frameIncremeter = 1;

        this.lastUpdateTime = 0;
        this.accumulateDelta = 0;
        this.isSpriteLocked = false;
        this.spriteDef = spriteDef; //just to appease typescript
        this.image = AssetManager.getImage(spriteDef.imageName); //more appeasement
        this._setSpriteDef(spriteDef);
        this.noLoop = noLoop;

        this.finished = false;
    }

    update()
    {
        if (this.finished == false)
        {
            var delta = Date.now() - this.lastUpdateTime;

            if (this.accumulateDelta > this.spriteDef.msPerFrame)
            {
                this.accumulateDelta = 0;
                this.currentFrameY += this.frameIncremeter;

                if (this.currentFrameY >= this.spriteDef.frameCount)
                {
                    // If aniamtion is not meant to loop
                    if (this.noLoop)
                    {
                        this.finished = true;

                        if (this.onFinishFunc != null)
                        {
                            this.onFinishFunc();
                            this.onFinishFunc = null;
                            return
                        }
                    }

                    this.currentFrameY = this.spriteDef.frameY; //reset to start
                }

            } else
            {
                this.accumulateDelta += delta;
            }

            this.lastUpdateTime = Date.now();

        }
    }

    //Draws this sprite at the center of another
    drawOnCenter(ctx : CanvasRenderingContext2D, x : number, y : number, spriteToCenterOn: Sprite)
    {
        if (this.finished == false)
        {
            ctx.save();
            ctx.translate(
                ((spriteToCenterOn.getImage().width as number) - (this.getImage().width as number)) / 2,
                (spriteToCenterOn.getFrameHeight() - this.getFrameHeight()) / 2
            )
            this.draw(ctx, x, y);
            ctx.restore();
        }
    }

    draw(ctx : CanvasRenderingContext2D, x : number, y : number)
    {
        var tmpCurrentFrameY = Math.floor(this.currentFrameY);
        if(tmpCurrentFrameY >= 0)
        {
            ctx.drawImage(
                   this.image,
                   0, tmpCurrentFrameY * this.frameHeight, (this.image.width as number), this.frameHeight,
                   Math.floor(x),
                   Math.floor(y),
                  this.image.width as number,
                  this.frameHeight
            );
        }
    }

    getImage()
    {
        return this.image;
    }

    getCurrentFrame()
    {
        return this.currentFrameY;
    }

    setCurrentFrame(frame : number)
    {
        if (frame >= 0 && frame < this.spriteDef.frameCount)
        {
             this.currentFrameY = frame;
        }

    }

    setNoLoop(val: boolean)
    {
        this.noLoop = val;
    }

    getFrameHeight()
    {
        return this.frameHeight;
    }

    getFrameWidth()
    {
       return this.image.width as number;
    }

    getTotalFrames()
    {
        return this.spriteDef.frameCount;
    }


    // Allows for func to be called once this sprite animation has finished
    onAnimationFinish(func : CallableFunction)
    {
        if(this.isSpriteLocked == false)
        this.onFinishFunc = func;
    }

    _setSpriteDef(spriteDef: SpriteDefinition, lockSprite = false, noLoop = false)
    {
        if (this.isSpriteLocked == false)
        {
            this.noLoop = noLoop;
            this.finished = false;
            this.spriteDef = spriteDef;
            this.currentFrameY = spriteDef.frameY;
            this.isSpriteLocked = lockSprite;

            this.image = AssetManager.getImage(spriteDef.imageName);
            this.frameHeight = (this.image.height as number) / spriteDef.frameCount;
        }
    }

    setSpriteDef(spriteDef: SpriteDefinition, lockSprite = false, noLoop = false)
    {

        if (spriteDef != this.spriteDef)
        {
            this._setSpriteDef(spriteDef, lockSprite, noLoop);
        }


        //This allows a call to this method to lock the current spriteDef
        // Which stops other calls to this method from unlocking changing the spriteDef
        // unless they pass in the same spritedef that was used when it was inital set.
        // This is useful to stop the game loop and other states from unsetting each others spritedefs
        // Mainly used in the weapon classes.
        if (this.spriteDef == spriteDef)
        {
            this.isSpriteLocked = lockSprite;
        }

    }

    //Changes sprite sheet but stops the currentframe from resetting
    swapSpriteSheet(spriteSheet: SpriteDefinition)
    {
        var currentFrame = this.getCurrentFrame();
        this.setSpriteDef(spriteSheet);
        this.setCurrentFrame(currentFrame);
        this.finished = true; //So the sprite doesn't animate
    }

}