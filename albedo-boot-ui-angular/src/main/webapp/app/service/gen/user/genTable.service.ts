import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { CTX } from "../../../app.constants";
import { GenTable } from "./genTable.model";
import {ComboData, DataService} from "../../../shared";


@Injectable()
export class GenTableService extends DataService<GenTable> {

    constructor(protected http: Http) {
        super(http, CTX + '/gen/genTable');
    }


    tableList(): Observable<ComboData[]> {
        return this.http.get(this.resourceUrl + '/tableList')
            .map((data: any) => data);
    }


}
