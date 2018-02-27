import { LocalStorageService } from "ngx-webstorage"

declare let mLayout: any
export const setActiveItemMenu = (localStorage: LocalStorageService, url?: String) => {
    let menu = mLayout.getAsideMenu()
    url = (url ? url : window.location.hash)
    let item = $(menu).find('a[href="' + url + '"]').parent('.m-menu__item')
    if (item.length > 0) {
        localStorage.store("activeItemMenu", url)
    } else {
        item = $(menu).find('a[href="' + localStorage.retrieve("activeItemMenu") + '"]').parent('.m-menu__item')
    }
    let menuObj = (<any>$(menu).data('menu'))
    menuObj && menuObj.setActiveItem(item)
}



