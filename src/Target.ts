/**
 * Target.js
 *
 * The target or cross hairs the player rotates to aim
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { PhysicsSprite } from "./animation/PhysicsSprite";
import { Sprites } from "./animation/SpriteDefinitions";
import { b2Vec2, Physics } from "./system/Physics";
import { Utilies } from "./system/Utilies";
import { Worm } from "./Worm";

export class Target extends PhysicsSprite
{
    // Aiming
    private targetDirection;
    rotationRate;
    worm: Worm;
    direction;

    //When the player walks and the aims again
    //allows me to reset the sprites current frame to what it was at previously
    previousSpriteFrame : number = 0;

    constructor(worm: Worm)
    {
        super(new b2Vec2(0, 0), Physics.vectorMetersToPixels(worm.body.GetPosition()), Sprites.weapons.redTarget);
        //The direction in which the worm is aiming
        this.targetDirection = new b2Vec2(1, 0.0);
        this.rotationRate = 4;
        this.worm = worm;
        this.direction = this.worm.direction;
    }

    draw(ctx : CanvasRenderingContext2D)
    {
        if (this.worm.isActiveWorm() && this.worm.getWeapon().requiresAiming)
        {

            var radius = this.worm.fixture.GetShape().GetRadius() * Physics.worldScale;
            var wormPos = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
            var targetDir = this.targetDirection.Copy();

            targetDir.Multiply(95);
            targetDir.Add(wormPos);

            //ctx.beginPath(); // Start the path
            //ctx.moveTo(wormPos.x, wormPos.y); // Set the path origin
            //ctx.lineTo(targetDir.x, targetDir.y); // Set the path destination
            //ctx.closePath(); // Close the path
            //ctx.stroke();

            super.draw(ctx, targetDir.x - radius, targetDir.y - (radius * 2));
        }
    }

    getTargetDirection()
    {
        return this.targetDirection;
    }

    setTargetDirection(vector : any)
    {
        this.targetDirection = vector;
    }

    changeDirection(dir : any)
    {
        var td = this.targetDirection.Copy();
        var currentAngle = Utilies.toDegrees(Utilies.vectorToAngle(td));

        if (dir == Worm.DIRECTION.left && this.direction != dir)
        {
            this.direction = dir;
            var currentAngle = Utilies.toDegrees(Utilies.toRadians(180) - Utilies.vectorToAngle(td));
            this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));

        } else if (dir == Worm.DIRECTION.right && this.direction != dir)
            {

            this.direction = dir;
            var currentAngle = Utilies.toDegrees(Utilies.toRadians(-180) - Utilies.vectorToAngle(td));
            this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
        }
    }

    // Allows the player to increase the aiming angle or decress
    aim(upOrDown: number)
    {
        upOrDown *= this.worm.direction;
        var td = this.targetDirection.Copy();
        var currentAngle = Utilies.toDegrees( Utilies.toRadians(this.rotationRate * upOrDown) + Utilies.vectorToAngle(td) );

        //Magic number 0.6 - it works anyway, not enough time. Though if upOrDown changes from 0.8 might need to change it.
         this.worm.setCurrentFrame(this.worm.getCurrentFrame() + (Utilies.sign(upOrDown * -this.worm.direction) * 0.6))
        
        //Hack: All the aiming sprite sheets are 32 or greater. 
        //This makes sure if we move the target while jumping that we don't lose 
        //correct previousSpriteFrame 
        if (this.worm.getTotalFrames() >= 32)
        {
            this.previousSpriteFrame = this.worm.getCurrentFrame();
        }

        if (this.direction == Worm.DIRECTION.right)
        {

            if (currentAngle > -90 && currentAngle < 90)
            {
                this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
           
            }
        } else
        {

            if ( (currentAngle > 90) || (currentAngle < -90) )
            {
                this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));

            }
        }

    }

}