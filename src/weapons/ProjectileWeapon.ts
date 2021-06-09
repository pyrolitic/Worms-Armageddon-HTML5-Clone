/**
 * ProjectileWeapon
 * Projectiles explode when they collide with the terrain.
 * thats the main different between them and throwable weapons
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { Effects } from "../animation/Effects";
import { ParticleEffect } from "../animation/ParticleEffect";
import { Sprite } from "../animation/Sprite";
import { SpriteDefinition, Sprites } from "../animation/SpriteDefinitions";
import { GameInstance } from "../MainInstance";
import { Physics, b2FixtureDef, b2CircleShape, b2BodyDef, b2Body } from "../system/Physics";
import { Utilies, Logger } from "../system/Utilies";
import { Worm } from "../Worm";
import { BaseWeapon } from "./BaseWeapon";

export class ProjectileWeapon extends BaseWeapon
{

    body : any;
    fixture : any;
    image : HTMLImageElement | null = null;
    listener : any;
    terrainRef : any;
    effectedRadius : number;
    explosiveForce : number;
    explosionRadius : number;
    isLive : boolean = false;
    maxDamage: number;

    projectileSprite: Sprite;

    constructor (name : string, ammo : number, iconSpriteDef: SpriteDefinition, weaponSpriteDef: SpriteDefinition, takeOutAnimation: SpriteDefinition, takeAimAnimation: SpriteDefinition)
    {
        super(
            name,
            ammo,
          iconSpriteDef,
          takeOutAnimation,
          takeAimAnimation
        );


        this.projectileSprite = new Sprite(weaponSpriteDef);

        // Force/worm damge radius
        this.effectedRadius = Physics.pixelToMeters(60);

        // The area in pxiels that get cut out of the terrain
        this.explosionRadius = 70;

        // force scaler
        this.explosiveForce = 60

        this.maxDamage = 50;

        //Max force this weapon can be thrown with
        this.forceIndicator.setMaxForce(120);


    }

    //Gets the direction of aim from the target and inital velocity
    // The creates the box2d physics body at that pos with that inital v
    setupDirectionAndForce(worm: Worm)
    {
        var initalVelocity = worm.target.getTargetDirection().Copy();
        initalVelocity.Multiply(1.5);

        var initalPosition = worm.body.GetPosition();
        initalPosition.Add(initalVelocity);

        initalVelocity = worm.target.getTargetDirection().Copy();
        initalVelocity.Multiply(this.forceIndicator.getForce());

        this.setupPhysicsBodies(initalPosition, initalVelocity);

    }

     setupPhysicsBodies(initalPosition : any, initalVelocity : any)
     {

        // Setup of physical body
        var image = this.projectileSprite.getImage();

        var fixDef = new b2FixtureDef;
        fixDef.density = 50.0;
        fixDef.friction = 3.5;
        fixDef.restitution = 0.6
        fixDef.shape = new b2CircleShape((image.width / 4) / Physics.worldScale);

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position = initalPosition;
        bodyDef.angle = Utilies.vectorToAngle(initalVelocity);

        this.fixture = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef);
        this.body = this.fixture.GetBody();
        this.body.ApplyImpulse(initalVelocity,this.body.GetPosition());

        if (initalVelocity.x >= 0)
        {
            //TODO make this even better, by setting the rotation off
            // the inital velocity of the projectile.
            // Looks ok for the mo, other more important things to do atm.
            this.body.SetAngularVelocity(0.7);
        } else
        {
            this.body.SetAngularVelocity(-0.7);
        }

        this.body.SetUserData(this);

        Physics.addToFastAcessList(this.body);
    }

    beginContact(contact : any)
    {
        if (this.isActive && this.isLive)
        {
            GameInstance.state.tiggerNextTurn();
            var animation : ParticleEffect = Effects.explosion(
                this.body.GetPosition(),
                this.explosionRadius,
                this.effectedRadius,
                this.explosiveForce,
                this.maxDamage,
                this.worm
           );
             
            this.deactivate();
        }

    }

    deactivate()
    {
        super.deactivate();
        Logger.debug(this.name + " was deactivated ");
       // Set this object to dead so it can be cleaned up       
       this.isLive = false;
    }

    activate(worm: Worm)
    {
        //FIXME: Hack some how activate gets called on the opisite team if they used a bazzoka before hand.
        // doesnt happen for any other weapon, very strange. This is a temp fix. Investage later
        if (GameInstance.state.getCurrentPlayer().getTeam().getCurrentWorm() == worm && this.ammo > 0 && this.getIsActive() == false)
        {
            this.isLive = true;
            super.activate(worm);
            this.setupDirectionAndForce(worm);
        }
    }


    update()
    {
        if (!this.isLive &&  this.isActive)
        {
            //The bomb has exploded so remove it from the world         
            Physics.removeToFastAcessList(this.body);
            Physics.world.DestroyBody(this.body);
            this.isActive = false;   
        } 
    }

    draw(ctx : CanvasRenderingContext2D)
    {
        if (this.isActive && this.isLive)
        {
            ctx.save()

            ctx.translate(
            this.body.GetPosition().x * Physics.worldScale,
            this.body.GetPosition().y * Physics.worldScale
            )

            ctx.rotate(this.body.GetAngle())

            var radius = this.fixture.GetShape().GetRadius() * 2 * Physics.worldScale;

            this.projectileSprite.draw(ctx,
            -this.projectileSprite.getFrameWidth() / 2,
            -this.projectileSprite.getFrameHeight() / 1.5
            );

            ctx.restore()
        }
    }

}


export class Bazzoka extends ProjectileWeapon
{

    constructor(ammo : number)
    {
        super(
            "Bazooka",
            ammo, 
            Sprites.weaponIcons.bazooka,
            Sprites.weapons.missle,
            Sprites.worms.takeOutBazooka,
            Sprites.worms.aimBazooka
            );
    }

}