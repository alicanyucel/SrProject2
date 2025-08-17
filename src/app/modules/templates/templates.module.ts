import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TemplatesComponent } from './templates.component';
import { TemplatesRoutingModule } from './templates-routing.module';
import { QuillModule } from 'ngx-quill';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [TemplatesComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TemplatesRoutingModule, QuillModule.forRoot(), MatPaginatorModule],
  exports: [TemplatesComponent]
})
export class TemplatesModule {}
