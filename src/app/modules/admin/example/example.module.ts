import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ExamplesComponent } from './example.component';


const exampleRoutes: Route[] = [
    {
        path     : '',
        component: ExamplesComponent
    }
];

@NgModule({
    declarations: [
    
    ],
    imports: [RouterModule.forChild(exampleRoutes)]
})
export class ExampleModule
{
}