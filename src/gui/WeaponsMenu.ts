/**
 * WeaponsMenu.js
 * This is the menu which slides out from the right side
 * Its shows the player all the infomation from their teams weapon manager.
 * It displays all the weapons + ammo and allows the user to select a weapon.
 *
 *  License: Apache 2.0
 *  author:  Ciar�n McCann
 *  url: http://www.ciaranmccann.me/
 */
import { GameInstance } from "../MainInstance";
import { Events } from "../networking/Events";
import { InstructionChain } from "../networking/InstructionChain";
import {AssetManager} from "../system/AssetManager";
import { Controls } from "../system/Controls";
import { BaseWeapon } from "../weapons/BaseWeapon";
import {Client} from "./../networking/Client";

export class WeaponsMenu
{
    htmlElement : JQuery<HTMLElement>;
    isVisable;
    cssId;
    toggleButtonCssId;

    constructor()
    {
        this.cssId = "weaponsMenu";
        this.toggleButtonCssId = "weaponsMenuBtn";

        $('body').append("<div id=" + this.cssId + "><div id=" + this.toggleButtonCssId + ">Weapons Menu</div><div id=content></div></div>");

        this.htmlElement = $("#" + this.cssId);

        $('#'+this.toggleButtonCssId).click(() =>
        {
            if (Client.isClientsTurn())
            {
                this.toggle();
            }
        });

        window.addEventListener("keypress", (event : KeyboardEvent) => {
            if (Client.isClientsTurn() && Controls.toggleWeaponMenu.keyboard == event.code)
            {
                this.toggle();
            }
        });

        $('body').on({
            mousedown: (event : MouseEvent) =>
            {
                if (Client.isClientsTurn() && Controls.toggleWeaponMenu.mouse == event.button)
                {
                    this.toggle();
                }
            }
        });

        $('body').on('contextmenu', "#" + this.cssId, (e) =>
        {
            return false;
        });

        this.isVisable = false;
    }


    selectWeapon(weaponId : number)
    {
        var weaponMgmt = GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager();

        //Checks if the weapon has ammo to provide the html been hacked and a weaponid passed that doesn't have ammo
        if (weaponMgmt.checkWeaponHasAmmo(weaponId))
        {
            weaponMgmt.setCurrentWeapon(weaponId);
            Client.sendImmediately(Events.client.ACTION, new InstructionChain("state.getCurrentPlayer.getTeam.getWeaponManager.setCurrentWeapon", [weaponId]));
        }
    }


    show()
    {
        this.htmlElement.show();
    }

    refresh()
    {
        var weaponMgmt = GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager();
        this.populateMenu(weaponMgmt.getListOfWeapons());
    }

    toggle()
    {

        // populate
        this.refresh();
        var moveAmountInPx;

        if (this.isVisable)
        {
            moveAmountInPx = "0px";
            this.isVisable = false;
        } else
        {
            moveAmountInPx = "-275px";
            this.isVisable = true;
        }


        this.htmlElement.animate({
            marginLeft: moveAmountInPx,
        }, 400);

    }

    //Fills the menu up with the various weapon items
    populateMenu(listOfWeapons: BaseWeapon[])
    {
        var html = "<ul class = \"thumbnails\" >"

        for (var weapon in listOfWeapons)
        {
            var currentWeapon: BaseWeapon = listOfWeapons[weapon];
            var cssClassType = "ammo";

            if (currentWeapon.ammo <= 0)
            {
                cssClassType = "noAmmo";
                weapon = "-1";
            }

            html += "<li class=span1 id=" + weapon + ">";
            html += "<a  class=\"thumbnail " + cssClassType + "\" id=" + weapon + " value=" + currentWeapon.name + "  title= " + currentWeapon.name +"><span class=ammoCount> " + currentWeapon.ammo + "</span><img title= " + currentWeapon.name +" src=" + currentWeapon.iconImage.src + " alt=" + currentWeapon.name + "></a>";
            html += "</li>";
        }
        html += "</ul>";

        //Should of just used a CSS class and then an ID selector, oh well fuck it, it works!
        $($(this.htmlElement).children().get(1)).empty();
        $($(this.htmlElement).children().get(1)).append(html);

        var _this = this;
        $("#" + this.cssId).find("li").click(function()
        {
            var weaponId = parseInt($(this).attr('id'));

            if (weaponId == -1)
            {
                AssetManager.getSound("cantclickhere").play();
                return;
            }

            AssetManager.getSound("CursorSelect").play();
            _this.selectWeapon(weaponId);
            _this.toggle();
        });

    }


}
