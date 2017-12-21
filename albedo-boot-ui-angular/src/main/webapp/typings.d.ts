/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
    id: string;
}
interface JQuery {
    mMenu(options: any): JQuery;
    animateClass(options: any): JQuery;
    setActiveItem(item: any): JQuery;
    getPageTitle(item: any): JQuery;
    getBreadcrumbs(item: any): JQuery;
    validate(options: any): JQuery;
    mDatatable(options: any): JQuery;
    loadFilterGird(): JQuery;
    selectpicker(): JQuery;
    valid(): JQuery;
    resetForm(): JQuery;
    markdown(): JQuery;
}
