import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Helpers } from '../../../helpers';
import { Module } from "../../../shared/sys/module/module.model";
import { ModuleService } from "../../../shared/sys/module/module.service";
import { JhiAlertService, JhiEventManager, JhiParseLinks } from "ng-jhipster";
import { Principal } from "../../../auth/_services/principal.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ResponseWrapper } from "../../../shared/sys/model/response-wrapper.model";

declare let mLayout: any;
@Component({
    selector: "app-aside-nav",
    templateUrl: "./aside-nav.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class AsideNavComponent implements OnInit, AfterViewInit {


    menus: Module[];

    constructor(
        private moduleService: ModuleService,
        private parseLinks: JhiParseLinks,
        private alertService: JhiAlertService,
        private principal: Principal,
        private eventManager: JhiEventManager,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {

    }
    ngOnInit() {
        this.moduleService.menus().subscribe(
            (res: ResponseWrapper) => this.onSuccess(res.json),
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }


    ngAfterViewInit() {
        /**/
    }

    getChildMenus(id) : Module[] {
        return this.menus.filter( (item:Module) => {
            return item.parentId==id;
        });
    }
    private onSuccess(res) {
        this.menus = res.data;
        this.initMenuNav();
        this.selectMenuNav();
    }

    private selectMenuNav(){
        mLayout.initAside();
        let menu = mLayout.getAsideMenu();
        let item = $(menu).find('a[href="' + window.location.pathname + '"]').parent('.m-menu__item');
        (<any>$(menu).data('menu')).setActiveItem(item);
    }

    private initMenuNav(){
        let $menuUl=$("<ul class=\"m-menu__nav  m-menu__nav--dropdown-submenu-arrow\" />");
        this.menus.forEach(item=>{
            if(item.menuTop){
                if(item.url!=''){
                    item.show && $menuUl.append("<li class=\"m-menu__item\" routerLinkActive=\"m-menu__item--active\" routerLinkActiveOptions=\"{ exact: true }\"  aria-haspopup=\"true\" >" +
                        "<a href=\""+item.url+"\" routerLink=\"/"+item.url+"\" class=\"m-menu__link\">" +
                        "<i class=\"m-menu__link-icon "+item.iconCls+"\"></i>" +
                        "<span class=\"m-menu__link-text\">" +
                        item.name +
                        "</span></a></li>")
                }else{
                    item.show && $menuUl.append("<li class=\"m-menu__section\">" +
                        "<h4 class=\"m-menu__section-text\">" +
                        item.name +
                        "</h4>" +
                        "<i class=\"m-menu__section-icon flaticon-more-v3\"></i>" +
                        "</li>")
                }

                this.getChildMenus(item.id).forEach(itemChild => {
                    if(!itemChild.menuLeaf){
                        itemChild.show && $menuUl.append("<li class=\"m-menu__item  m-menu__item--submenu\" routerLinkActive=\"m-menu__item--active\" routerLinkActiveOptions=\"{ exact: true }\"  aria-haspopup=\"true\"  data-menu-submenu-toggle=\"hover\">" +
                            "<a  href=\"#\" class=\"m-menu__link m-menu__toggle\">" +
                            "<i class=\"m-menu__link-icon "+itemChild.iconCls+"\"></i>" +
                            "<span class=\"m-menu__link-text\">" +
                            itemChild.name  +
                            "</span>" +
                            "<i class=\"m-menu__ver-arrow la la-angle-right\"></i>" +
                            "</a>" +
                            "<div class=\"m-menu__submenu\">" +
                            "                    <span class=\"m-menu__arrow\"></span>" +
                            "                    <ul class=\"m-menu__subnav\">" +
                            "                        </ul></div></li>");

                        this.getChildMenus(itemChild.id).forEach(itemMinChild =>{
                            itemMinChild.show && $menuUl.find(".m-menu__item--submenu:contains('"+itemChild.name+"') ul.m-menu__subnav")
                                .append("<li class=\"m-menu__item\" routerLinkActive=\"m-menu__item--active\" routerLinkActiveOptions=\"{ exact: true }\"  aria-haspopup=\"true\" >" +
                                "<a href=\""+itemMinChild.url+"\" routerLink=\""+itemMinChild.url+"\" class=\"m-menu__link\">" +
                                "<i class=\"m-menu__link-bullet m-menu__link-bullet--dot\">" +
                                "<span></span>" +
                                "</i>" +
                                "<span class=\"m-menu__link-text\">" +
                                itemMinChild.name +
                                "</span>" +
                                "</a>" +
                                "</li>")
                        })

                    }else{
                        $menuUl.append("<li class=\"m-menu__item\" routerLinkActive=\"m-menu__item--active\" routerLinkActiveOptions=\"{ exact: true }\"  aria-haspopup=\"true\" >" +
                            "<a href=\""+itemChild.url+"\" routerLink=\"/"+itemChild.url+"\" class=\"m-menu__link\">" +
                            "<i class=\"m-menu__link-icon "+itemChild.iconCls+"\"></i>" +
                            "<span class=\"m-menu__link-text\">" +
                            itemChild.name +
                            "</span></a></li>")
                    }
                })

            }

        })

        // noinspection TypeScriptUnresolvedFunction
        $("#m_ver_menu").append($menuUl);
    }


    private onError(error) {
        this.alertService.error(error.error, error.message, null);
    }

}
