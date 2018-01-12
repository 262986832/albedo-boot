import {AfterViewInit, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ComboSearch} from "../base/model/combo.search.model";
import {DictService} from "../sys/dict/dict.service";
import {DictQuery} from "../sys/dict/dict.query.model";
import {ComboData} from "../base/model/combo.data.model";
import {ResponseWrapper} from "../base/model/response-wrapper.model";
import {Http, Response} from "@angular/http";
import {convertResponse, createRequestOption} from "../base/request-util";
import {OnChanges} from "@angular/core/src/metadata/lifecycle_hooks";
import {SERVER_API_URL} from "../../app.constants";

@Component({
    selector: "alb-form",
    templateUrl: "./form.component.html"
})
export class AlbFormComponent implements OnInit, AfterViewInit,OnChanges {

    static BOX_TYPE_SELECT = "select";
    static BOX_TYPE_CHECKBOX = "checkbox";
    static BOX_TYPE_RADIO = "radio";
    @Input()
    public dictQuery?: DictQuery;
    @Input()
    public comboSearch?: ComboSearch;
    @Input()
    comboData?: ComboData[];
    @Input()
    public name?: string;
    @Input()
    public searchItem?: string;
    @Input()
    operate?: string;
    @Input()
    analytiColumn?: string;
    @Input()
    analytiColumnPrefix?: string;
    @Input()
    itemLabel?: string;
    @Input()
    itemValue?: string;
    @Input()
    attrType?: string;
    @Input()
    id?: string;
    @Input()
    value?: string;
    @Input()
    cssClass?: string;
    @Input()
    dataOptions?: string;
    @Input()
    boxType?: string;
    @Input()
    url?: string;
    @Input()
    params?: any
    private afterViewInit = false;

    // tslint:disable-next-line: no-unused-variable
    constructor(protected http: Http, private dictService: DictService) {


    }
    ngOnInit(): void {
        if (!this.comboData) {
            let params = this.dictQuery != null ? this.dictQuery : this.comboSearch;
            params && this.dictService.codes(params).subscribe(
                (data: any) => {
                    this.comboData = data;
                    this.initTags();
                }
            );
            this.url && this.http.get(this.url, createRequestOption(this.params)).map((data: any) =>data).subscribe(
                (data: any) => {
                    this.comboData = data;
                    this.initTags();
                }
            )
        }

    }


    equleValue(valLabel): boolean{
        return this.value && (valLabel == this.value || (","+this.value+",").indexOf(","+valLabel+",") != -1);
    }

    /**/
    ngAfterViewInit(): void {
        this.afterViewInit = true;
        this.initTags();
    }

    toStr(input: string): string {
        return input ? input : "";
    }

    ngOnChanges(changes: SimpleChanges): void {
        // if(changes.value && changes.value.currentValue){
        //     var ngValue = changes.value.currentValue,$selfBox = $("#form-item-" + this.id).parent();
        //     console.log(ngValue)
        //     if(this.boxType == AlbFormComponent.BOX_TYPE_SELECT){
        //         $selfBox.find("select option").removeAttr("selected");
        //         $selfBox.find("select option[value='"+ngValue+"']").attr("selected", "selected");
        //     }else {
        //         $selfBox.find("input[type='"+this.boxType+"']").removeAttr("checked");
        //         var ngValues = ngValue.toString().split(",");
        //         for(var itemValue in ngValues){
        //             itemValue && $selfBox.find("input[type='"+this.boxType+"'][value='"+itemValue+"']").attr("checked", "checked")
        //         }
        //
        //     }
        // }
    }
    private initTags() {

        // if (this.afterViewInit != true || this.comboData == null) return;
        // if(!this.value){
        //     var ngValue = $("#form-item-" + this.id).parent().attr("ng-reflect-value");
        //     if(ngValue) this.value = ngValue;
        // }
        // console.log(this.value)
        // let $formTag;
        // this.operate = this.operate ? this.operate : 'like';
        // if (this.boxType == AlbFormComponent.BOX_TYPE_SELECT) {
        //     $formTag = $("<select " +
        //         "id=\"" + this.toStr(this.id) + "\" " +
        //         "name=\"" + this.toStr(this.name) + "\" " + (this.searchItem ? ("searchItem=\"" + this.toStr(this.searchItem) + "\" attrType=\"" + this.toStr(this.attrType) + "\" " +
        //             "operate=\"" + this.toStr(this.operate) + "\" " +
        //             "analytiColumn=\"" + this.toStr(this.analytiColumn) + "\" " +
        //             "analytiColumnPrefix=\"" + this.toStr(this.analytiColumnPrefix) + "\" " ) : "") +
        //
        //         "class=\"form-control m-bootstrap-select " + this.toStr(this.cssClass) + "\">" +
        //         "</select>");
        //
        //     if (!this.cssClass || this.cssClass.indexOf("required") == -1) {
        //         $formTag.append($("<option value=\"\">请选择...</option>"))
        //     }
        //     this.comboData.forEach(item => {
        //         $formTag.append($("<option value=\"" + this.toStr(item.id) + "\" " + (this.value == item.id ? "selected='selected'" : "") + ">" + item.name + "</option>"))
        //     })
        // } else {
        //     $formTag = $("<div class=\"m-" + this.toStr(this.boxType) + "-inline\"></div>");
        //     let i = 1;
        //     this.comboData.forEach(item => {
        //         let valLabel = item.id, nameLabel = item.name;
        //         $formTag.append($("<label class=\"m-" + this.boxType + "\">" +
        //             "<input type=\"" + (AlbFormComponent.BOX_TYPE_CHECKBOX == this.boxType ? AlbFormComponent.BOX_TYPE_CHECKBOX : AlbFormComponent.BOX_TYPE_RADIO) + "\" " +
        //             "id=\"" + (this.id ? this.name : this.id) + (i) + "\" " +
        //             "name=\"" + this.name + "\" " +(this.searchItem? (
        //                 "searchItem=\"" + this.toStr(this.searchItem) + "\" " +
        //                 "attrType=\"" + this.toStr(this.attrType) + "\"" +
        //                 "operate=\"" + this.toStr(this.operate) + "\" " +
        //                 "analytiColumn=\"" + this.toStr(this.analytiColumn) + "\" " +
        //                 "analytiColumnPrefix=\"" + this.toStr(this.analytiColumnPrefix) + "\" "
        //             ) : "")+"itemLabel=\"" + this.toStr(this.itemLabel) + "\" " +
        //             "itemValue=\"" + this.toStr(this.itemValue) + "\" " +
        //             "value=\"" + valLabel + "\" " +
        //             "class=\"" + this.toStr(this.cssClass) + "\"" +
        //             (this.value && (valLabel == this.value || (","+this.value+",").indexOf(","+valLabel+",") != -1) ? "checked=\"checked\"" : "") +
        //             "data-options=\"" + this.toStr(this.dataOptions) + "\"  />" + nameLabel + "<span></span></label>"));
        //         i++;
        //     });
        // }
        // $("#form-item-" + this.id).parent().append($formTag)
        //     .find('.m-bootstrap-select').selectpicker();
        // this.scriptLoaderService.load(".m-bootstrap-select", "assets/common/formInit.js");

    }

}
