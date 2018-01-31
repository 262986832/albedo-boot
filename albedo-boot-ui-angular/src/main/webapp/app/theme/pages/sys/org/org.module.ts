import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from "../../../layouts/layout.module";
import { OrgComponent } from "./org.component";
import { AlbedoBootSharedModule } from "../../../../shared/shared.module";
import { OrgFormComponent } from "./org.form.component";
import { RouterModule } from "@angular/router";
import { OrgService } from "../../../../service/sys/org/org.service";
import {ModuleFormComponent} from "../module/module.form.component";
import {RoleComponent} from "../role/role.component";
import {ModuleComponent} from "../module/module.component";
import {DictComponent} from "../dict/dict.component";
import {UserComponent} from "../user/user.component";
import {DictFormComponent} from "../dict/dict.form.component";
import {UserFormComponent} from "../user/user.form.component";
import {RoleFormComponent} from "../role/role.form.component";
import {routeChilds} from "../../../api.routing.module";

const routesSysOrg = [
    {
        path: "sys/org/list",
        component: OrgComponent
    },
    {
        path: "sys/org/form",
        component: OrgFormComponent
    },
    {
        path: "sys/org/form/:id",
        component: OrgFormComponent
    },
];
routeChilds.push(...routesSysOrg)
@NgModule({
    imports: [
        AlbedoBootSharedModule,
        CommonModule,
        RouterModule,
        // RouterModule.forChild(routes),
        LayoutModule
    ], exports: [
        OrgComponent,
        // RouterModule
    ], entryComponents: [
        OrgComponent,
    ], declarations: [
        OrgComponent,
        OrgFormComponent,
    ], providers: [
        OrgService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgModule {



}
