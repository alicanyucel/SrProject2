import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { CompaniesComponent } from './companies.component';
import { PartitionEditDialogComponent } from './partition-edit-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

const companiesRoutes: Route[] = [
    {
        path     : '',
        component: CompaniesComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(companiesRoutes),
        CompaniesComponent,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    declarations: [
        PartitionEditDialogComponent
    ]
})
export class CompaniesModule {}
