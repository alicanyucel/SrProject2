import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { FuseAlertModule } from '@fuse/components/alert';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        FuseAlertModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FuseAlertModule
    ]
})
export class SharedModule
{
}
