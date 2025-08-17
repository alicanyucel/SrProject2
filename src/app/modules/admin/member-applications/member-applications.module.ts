import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MemberApplicationsComponent } from './member-applications.component';

const routes = [
    {
        path: '',
        component: MemberApplicationsComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        MemberApplicationsComponent
    ]
})
export class MemberApplicationsModule { }
