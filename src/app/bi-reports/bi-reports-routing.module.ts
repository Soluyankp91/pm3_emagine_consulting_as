import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BiReportsComponent } from './bi-reports.component';

const routes: Routes = [
    {
        path: '',
        component: BiReportsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BiReportsRoutingModule {}
