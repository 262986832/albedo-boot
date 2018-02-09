import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'

import { UserModule } from "./modules/sys/user/user.module"
import { RoleModule } from "./modules/sys/role/role.module"
import { OrgModule } from "./modules/sys/org/org.module"
import { ModuleModule } from "./modules/sys/module/module.module"
import { DictModule } from "./modules/sys/dict/dict.module"
import { GenTableModule } from "./modules/gen/genTable/genTable.module"
import { GenSchemeModule } from "./modules/gen/genScheme/genScheme.module"
import {TaskScheduleJobModule} from "./modules/sys/taskScheduleJob/taskScheduleJob.module";
import {AreaModule} from "./modules/sys/area/area.module";
import {MetricsModule} from "./modules/admin/metrics/metrics.module";
import {LogsModule} from "./modules/admin/logs/logs.module";
import {HealthModule} from "./modules/admin/health/health.module";
import {ConfigurationModule} from "./modules/admin/configuration/configuration.module";
import {AuditsModule} from "./modules/admin/audits/audits.module";


@NgModule({
    imports: [
        UserModule,
        RoleModule,
        OrgModule,
        ModuleModule,
        DictModule,
        GenTableModule,
        GenSchemeModule,
        TaskScheduleJobModule,
        AreaModule,
        MetricsModule,
        LogsModule,
        HealthModule,
        ConfigurationModule,
        AuditsModule,
        /* albedo-boot-needle-add-entity-module */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AlbedoBootEntityModule {
}
