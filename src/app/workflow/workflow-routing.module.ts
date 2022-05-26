import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkflowComponent } from './workflow.component';
import { WorkflowDetailsComponent } from './workflow-details/workflow-details.component';

const routes: Routes = [
    {
        path: '',
        component: WorkflowComponent,
        // children: [
            // {
            //     path: '', redirectTo: ':id', pathMatch: 'full'
            // },
    },
            { path: ':id', component: WorkflowDetailsComponent },
        // ]
    // },

    //{ path: 'path/:routeParam', component: MyComponent },
    //{ path: 'staticPath', component: ... },
    //{ path: '**', component: ... },
    //{ path: 'oldPath', redirectTo: '/staticPath' },
    //{ path: ..., component: ..., data: { message: 'Custom' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkflowRoutingModule {}
