import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportTypeListComponent } from './report-type-list.component';
import { ReportTemplateListComponent } from './report-template-list.component';

const routes: Routes = [
  { path: '', component: ReportTypeListComponent },
  { path: ':id', component: ReportTemplateListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportTypesRoutingModule {}
