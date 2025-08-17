import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HospitalsComponent } from './hospitals.component';

const hospitalsRoutes: Route[] = [
    {
        path     : '',
        component: HospitalsComponent
    }
];

@NgModule({
    declarations: [
    ],
    imports: [RouterModule.forChild(hospitalsRoutes)]
})
export class HospitalsModule
{
}
