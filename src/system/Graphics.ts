import { Settings } from "../Settings";

/**
 * Graphics.js
 * Graphics namespace provides helper functions for creating a canvas
 * it also setup the request animation frame shim and the stats.js fps counter
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
declare var Stats : any;

class PreRenderer
{

    private createPreRenderCanvas(width : number, height : number) : CanvasRenderingContext2D
    {
        var bufferCanvas = <HTMLCanvasElement>document.createElement('canvas');
        bufferCanvas.width = width;
        bufferCanvas.height = height;
        return bufferCanvas.getContext("2d") as CanvasRenderingContext2D;
    }

    render(drawFunc : CallableFunction, width : number, height : number, canvas : HTMLCanvasElement | null = null)
    {
        width += 2;
        height += 2;
        var ctx : CanvasRenderingContext2D;

        // If we have a canvas thats we want to reRender onto
        if (canvas)
        {
            ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        } else
        {
            ctx = this.createPreRenderCanvas(width, height);
            ctx.translate(1, 1);
        }


        drawFunc(ctx);
        return ctx.canvas;
    }

    renderAnimation(drawFuncsCollection : (()=>void)[], width : number, height : number)
    {
        var ctx = this.createPreRenderCanvas(width, height);
        for (var i in drawFuncsCollection)
        {
            drawFuncsCollection[i].call(ctx);
            ctx.translate(0, height);
        }

        return ctx.canvas;
    }

}

export module Graphics
{

    export var stats : any;

    export var preRenderer = new PreRenderer();

    export function init()
    {
        if (Settings.DEVELOPMENT_MODE)
        {
            stats = new Stats();

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.body.appendChild(stats.domElement);
        }

        // requestAnim shim layer by Paul Irish
        window.requestAnimationFrame = (function ()
        {
            return window.requestAnimationFrame ||
                (<any>window).webkitRequestAnimationFrame ||
                (<any>window).mozRequestAnimationFrame ||
                (<any>window).oRequestAnimationFrame ||
                window.requestAnimationFrame ||
            function ( /* function */ callback : CallableFunction, /* DOMElement */ element : Element)
            {
                window.setTimeout(callback, 1000 / 60);
                return true;
            };

        })();

    }

    // may be useful in the furture for drawing rounded conor boxes for over the players head
    export function roundRect(ctx : CanvasRenderingContext2D, x : number, y : number, w : number, h : number, r : number)
    {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        return ctx;
    }

    export function createCanvas(name: string)
    {

        var canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.id = name;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        window.document.body.appendChild(canvas);

        //Disable context menu so I can use right click for game controls
        $('body').on('contextmenu', "#" + name, function (e)
        {
            return false;
        });


        return canvas;

    }

}