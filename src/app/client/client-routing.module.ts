import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ClientComponent } from './client.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { ClientRequestTrackComponent } from './client-request-track/client-request-track.component';
import { ClientWorkflowTrackComponent } from './client-workflow-track/client-workflow-track.component';
import { ClientRatesAndFeesComponent } from './client-rates-and-fees/client-rates-and-fees.component';
import { ClientDocumentsComponent } from './client-documents/client-documents.component';
import { ClientContactsComponent } from './client-contacts/client-contacts.component';
import { WfResponsibleComponent } from './wf-responsible/wf-responsible.component';
import { ClientAddressComponent } from './client-address/client-address.component';
import { ClientInvoicingComponent } from './client-invoicing/client-invoicing.component';

const routes: Routes = [
    {
        path: '',
        component: ClientComponent,
    },
    {
        path: ':id',
        component: ClientDetailsComponent,
        children: [
            {
                path: '',
                redirectTo: 'request-track',
                pathMatch: 'full'
            },
            {
                path: 'request-track',
                component: ClientRequestTrackComponent
            },
            {
                path: 'workflow-track',
                component: ClientWorkflowTrackComponent
            },
            {
                path: 'rates-and-fees',
                component: ClientRatesAndFeesComponent
            },
            {
                path: 'documents',
                component: ClientDocumentsComponent
            },
            {
                path: 'contacts',
                component: ClientContactsComponent
            },
            {
                path: 'wf-responsible',
                component: WfResponsibleComponent
            },
            {
                path: 'address',
                component: ClientAddressComponent
            },
            {
                path: 'invoicing',
                component: ClientInvoicingComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClientRoutingModule {}
