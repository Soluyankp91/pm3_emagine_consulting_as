import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PoListComponent } from './po-list.component';

const routes: Routes = [
    {
        path: '',
        component: PoListComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PurchaseOrdersRoutingModule {}
