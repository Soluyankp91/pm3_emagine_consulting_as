import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainOverviewComponent } from './main-overview.component';
import { AppGanttAdvancedExampleComponent } from './gantt-advanced/gantt-advanced.component';

const routes: Routes = [
    {
        path: '',
        component: AppGanttAdvancedExampleComponent
    },

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
export class OverviewRoutingModule {}
