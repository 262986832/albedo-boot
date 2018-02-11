import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { ScriptLoaderService } from "./base/service/script-loader.service"
import { UserService } from "../auth/_services"
import { HasAnyAuthorityDirective } from "../auth/_services/has-any-authority.directive"
import { AlbedoBootSharedCommonModule } from "./shared-common.module"
import {RoleService} from "../theme/pages/modules/sys/role/role.service";
import {OrgService} from "../theme/pages/modules/sys/org/org.service";
import {ModuleService} from "../theme/pages/modules/sys/module/module.service";
import {DictService} from "../theme/pages/modules/sys/dict/dict.service";


@NgModule({
    imports: [
        AlbedoBootSharedCommonModule
    ],
    declarations: [
        HasAnyAuthorityDirective
    ],
    providers: [
        ScriptLoaderService,
        UserService,
        RoleService,
        OrgService,
        ModuleService,
        DictService
    ],
    entryComponents: [],
    exports: [
        AlbedoBootSharedCommonModule,
        HasAnyAuthorityDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AlbedoBootSharedModule {
}
