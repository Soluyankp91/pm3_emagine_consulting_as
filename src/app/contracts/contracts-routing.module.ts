import { ContractComponent } from './contract.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ClientSpecificTemplatesComponent } from './components/client-specific-templates/client-specific-templates.component';
import { AgreementsComponent } from './components/agreements/agreements.component';
import { MasterTemplatesComponent } from './components/master-templates/master-templates.component';
import { MasterTemplateCreationComponent } from './components/master-templates/components/master-template-creation/master-template-creation.component';
import { CreateMasterTemplateComponent } from './components/master-templates/components/master-template-creation/components/settings/settings.component';
import { EditorComponent } from './components/master-templates/components/master-template-creation/components/editor/editor.component';
import { ClientSpecificComponent } from './components/client-specific-templates/components/client-specific/client-specific.component';
import { CreationComponent } from './components/client-specific-templates/components/client-specific/creation/creation.component';

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
