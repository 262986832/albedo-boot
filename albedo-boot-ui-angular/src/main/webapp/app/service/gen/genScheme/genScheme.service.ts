import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { CTX } from "../../../app.constants";
import { GenTable } from "./genTable.model";
import {ComboData, DataService} from "../../../shared";
import {createRequestOption} from "../../../shared/base/request.util";


@Injectable()
export class GenTableService extends DataService<GenTable> {

    constructor(protected http: Http) {
        super(http, CTX + '/gen/genTable');
    }


    formData(params): Observable<any> {
        const options = createRequestOption(params);
        return this.http.get(this.resourceUrl + '/formData', options)
            .map((data: any) => data);
    }


}
