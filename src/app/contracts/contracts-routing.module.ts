import { ContractComponent } from './contract.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AgreementsComponent } from './agreements/agreements.component';
import { ClientSpecificTemplatesComponent } from './client-specific-templates/listAndPreviews/client-specific-templates.component';
import { ClientSpecificComponent } from './client-specific-templates/edit-template/client-specific.component';
import { MasterTemplatesComponent } from './master-templates/listAndPreviews/master-templates.component';
import { MasterTemplateCreationComponent } from './master-templates/template-editor/template-editor.component';
import { CreateMasterTemplateComponent } from './master-templates/template-editor/settings/settings.component';
import { EditorComponent } from './master-templates/template-editor/editor/editor.component';
import { CreationComponent } from './client-specific-templates/edit-template/settings/settings.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'agreements',
    },
    {
        path: '',
        component: ContractComponent,
        children: [
            {
                path: 'agreements',
                component: AgreementsComponent,
            },
            {
                path: 'client-specific-templates',
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ClientSpecificTemplatesComponent,
                    },
                    {
                        path: '',
                        component: ClientSpecificComponent,
                        children: [
                            {
                                path: 'settings',
                                component: CreationComponent,
                                data: {
                                    reuse: true,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                path: 'master-templates',
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: MasterTemplatesComponent,
                    },
                    {
                        path: '',
                        component: MasterTemplateCreationComponent,
                        children: [
                            {
                                path: 'settings',
                                component: CreateMasterTemplateComponent,
                                data: {
                                    reuse: true,
                                },
                            },
                            {
                                path: 'editor',
                                component: EditorComponent,
                                data: {
                                    reuse: true,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'agreements',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ContractsRoutingModule {}
