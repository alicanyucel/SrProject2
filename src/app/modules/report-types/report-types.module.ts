import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { QuillModule } from 'ngx-quill';
import { ReportTypeListComponent } from './report-type-list.component';
import { ReportTypeFormComponent } from './report-type-form.component';
import { ReportTemplateFormComponent } from './report-template-form.component';
import { ReportTemplateListComponent } from './report-template-list.component';
import { ReportTypesRoutingModule } from './report-types-routing.module';

@NgModule({
  declarations: [
    ReportTypeListComponent,
    ReportTypeFormComponent,
    ReportTemplateFormComponent,
    ReportTemplateListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatExpansionModule,
    QuillModule.forRoot(),
    ReportTypesRoutingModule,
    MatPaginatorModule
  ],
  exports: [ReportTypeListComponent]
})
export class ReportTypesModule {}
