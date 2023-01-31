import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkflowComponent, WorkflowCreateResolver } from './workflow.component';
import { WorkflowDetailsComponent } from './workflow-details/workflow-details.component';
import { WorkflowPeriodComponent, WorkflowPeriodResolver } from './workflow-period/workflow-period.component';
import { WorkflowOverviewComponent } from './workflow-overview/workflow-overview.component';

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
        component: WorkflowDetailsComponent,
        children: [
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                component: WorkflowOverviewComponent
            },
            {
                path: ':periodId',
                component: WorkflowPeriodComponent,
                resolve: {data: WorkflowPeriodResolver}
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkflowRoutingModule {}
