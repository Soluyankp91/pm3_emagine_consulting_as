import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkflowComponent, WorkflowCreateResolver } from './workflow.component';
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
    {
        path: 'create',
        component: WorkflowComponent,
        resolve: {data: WorkflowCreateResolver}
    },
    {
        path: ':id',
        component: WorkflowDetailsComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkflowRoutingModule {}
