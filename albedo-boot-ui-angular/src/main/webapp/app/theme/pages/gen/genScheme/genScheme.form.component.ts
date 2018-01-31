import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {CTX} from "../../../../app.constants";
import {ActivatedRoute} from "@angular/router";
import {GenTable} from "../../../../service/gen/genTable/genTable.model";
import {GenTableService} from "../../../../service/gen/genTable/genTable.service";

@Component({
    selector: ".sys-genTable-form.page-form",
    templateUrl: "./genTable.form.component.html"
})
export class GenTableFormComponent implements AfterViewInit {

    genTable: GenTable;
    routeData: any;
    ctx: any;
    id: any;
    javaTypeList;
    queryTypeList;
    showTypeList;
    tableList;
    columnList;

    private afterViewInit = false;
    private afterLoad = false;
    constructor(
        private activatedRoute: ActivatedRoute,
        private genTableService: GenTableService) {
        this.ctx = CTX;
        this.genTable = new GenTable();
        this.activatedRoute.queryParams.subscribe((params) => {
            params['name']&&this.initData(params)
        });
        this.activatedRoute.params.subscribe((params) => {
            params['id']&&this.initData(params)
        });
    }

    initData(params){
        params && this.genTableService.formData(params).subscribe((data) => {
            if(data.genTableVo)this.genTable = data.genTableVo;
            this.javaTypeList=data.javaTypeList;
            this.queryTypeList=data.queryTypeList;
            this.showTypeList=data.showTypeList;
            this.tableList=data.tableList;
            this.columnList=data.columnList;
            albedoForm.initFormData("#genTable-save-form", this.genTable);
            this.afterLoad = true;
            this.initForm();
        });
    }

    ngAfterViewInit() {
        // this._script.load('.sys-genTable-list',
        //     'assets/demo/default/custom/components/datatables/base/data-ajax.js');
        this.afterViewInit = true;
        this.initForm();
    }

    initForm() {
        if (!this.afterViewInit || !this.afterLoad) return;

        var genTableId = this.genTable.id;
        albedoForm.initValidate($("#genTable-save-form"), {
            // define validation rules
            rules: {
                loginId: { remote: CTX + '/gen/genTable/checkByProperty?_statusFalse&id=' + encodeURIComponent(genTableId) },
                status: { required: true },
                roleIdList: { required: true },
            },
            messages: {
                loginId: { message: '登录Id已存在' },
            },
        });
        albedoForm.init();
        albedoForm.initSave();


    }



}
