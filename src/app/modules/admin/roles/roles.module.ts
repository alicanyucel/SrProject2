import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { RolesComponent } from './roles.component';

const rolesRoutes: Route[] = [
    {
        path     : '',
        component: RolesComponent
    }
];

@NgModule({
    declarations: [
    ],
    imports: [RouterModule.forChild(rolesRoutes)]
})
export class RolesModule
{
}
