import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';

const usersRoutes: Route[] = [
    {
        path     : '',
        component: UsersComponent
    }
];

@NgModule({
    declarations: [
    ],
    imports: [RouterModule.forChild(usersRoutes)]
})
export class UsersModule
{
}
