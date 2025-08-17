import { NgModule } from '@angular/core';
import { ReportTypesModule } from 'app/modules/report-types/report-types.module';
import { ReportTypesRoutingModule } from 'app/modules/report-types/report-types-routing.module';

@NgModule({
  imports: [ReportTypesModule, ReportTypesRoutingModule]
})
export class AdminReportTypesModule {}
