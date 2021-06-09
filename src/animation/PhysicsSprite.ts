/**
 * PhysicsSprite.js
 * This is handies sprite that also need to animate interm of movement and physics
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { b2Vec2 } from "../system/Physics";
import { Sprite } from "./Sprite";
import { SpriteDefinition } from "./SpriteDefinitions";

export class PhysicsSprite extends Sprite
{
    velocity;
    position;
    acc : any;

    constructor (initalPos : any, initalVelocity : any, spriteDef: SpriteDefinition)
    {
        super(spriteDef);
        this.position = initalPos;
        this.velocity = initalVelocity;
       
    }

    draw(ctx: CanvasRenderingContext2D,x = this.position.x, y  = this.position.y)
    {
        super.draw(ctx, x,y);
    }

    physics()
    {
        var t = 0.016;
        var g = new b2Vec2(0, 9.81);

        var at = g.Copy();
        this.velocity.Add(at);

        var vt = this.velocity.Copy();
        vt.Multiply(t);
        this.position.Add(vt);

    }

    update()
    {
        this.physics();
        super.update();
    }



}