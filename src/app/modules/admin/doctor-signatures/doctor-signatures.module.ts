import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DoctorSignaturesComponent } from './doctor-signatures.component';

const doctorSignaturesRoutes: Route[] = [
    {
        path     : '',
        component: DoctorSignaturesComponent
    }
];

@NgModule({
    declarations: [
    ],
    imports: [RouterModule.forChild(doctorSignaturesRoutes)]
})
export class DoctorSignaturesModule
{
}
