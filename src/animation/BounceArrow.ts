/**
 * BounceArrow.js
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Sprite } from "./Sprite";
import { Sprites } from "./SpriteDefinitions";

export class BounceArrow extends Sprite
{
    initalPos;

    constructor (initalPos : any)
    {
        super(Sprites.weapons.arrow);

        initalPos.x -= 15;
        initalPos.y -= 120;
        this.initalPos = initalPos;
    }

    draw(ctx : CanvasRenderingContext2D)
    {
        if (this.finished == false)
        {
            super.draw(ctx, this.initalPos.x, this.initalPos.y);
        }
    }

    physics()
    {
      //override the base class
    }
}