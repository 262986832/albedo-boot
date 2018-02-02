import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Rx'
import { CTX } from "../../../../../app.constants"
import { Role } from "./role.model"
import { convertResponse, DataService, ResponseWrapper } from "../../../../../shared/index"


@Injectable()
export class RoleService extends DataService<Role> {

    constructor(protected http: Http) {
        super(http, CTX + '/sys/role')
    }


    comboData(): Observable<ResponseWrapper> {


        return this.http.get(this.resourceUrl + '/comboData')
            .map((res: Response) => convertResponse(res))
    }


}
