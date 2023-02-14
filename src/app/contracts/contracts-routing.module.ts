import { ContractComponent } from './contract.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AgreementsComponent } from './agreements/listAndPreviews/agreements.component';
import { ClientSpecificTemplatesComponent } from './client-specific-templates/listAndPreviews/client-specific-templates.component';

import { MasterTemplatesComponent } from './master-templates/listAndPreviews/master-templates.component';
import { SettingsTabComponent } from './shared/components/settings-tab/settings-tab.component';
import { CreateMasterTemplateComponent } from './master-templates/template-editor/settings/settings.component';
import { CreationComponent } from './client-specific-templates/edit-template/settings/settings.component';
import { SettingsComponent } from './agreements/template-editor/settings/settings.component';
import { AgreementDevExpress } from './agreements/template-editor/editor/agreement-editor/agreement-editor.component';
import { EditorComponent } from './master-templates/template-editor/editor/editor.component';

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
				children: [
					{
						path: '',
						pathMatch: 'full',
						component: AgreementsComponent,
					},
					{
						path: 'create',
						component: SettingsTabComponent,
						data: {
							isEdit: false,
							defaultName: 'New Agreement',
						},

						children: [
							{
								path: '',
								pathMatch: 'full',
								component: SettingsComponent,
							},
						],
					},
					{
						path: '',
						component: SettingsTabComponent,
						data: {
							isEdit: true,
						},
						children: [
							{
								path: ':id/settings',
								component: SettingsComponent,
							},
							{
								path: ':id/editor',
								component: AgreementDevExpress,
							},
						],
					},
				],
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
						path: 'create',
						component: SettingsTabComponent,
						data: { isEdit: false, defaultName: 'New Client Specific Template' },
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: CreationComponent,
							},
						],
					},
					{
						path: '',
						component: SettingsTabComponent,
						data: { isEdit: true },
						children: [
							{
								path: ':id/settings',
								component: CreationComponent,
							},
							{
								path: ':id/editor',
								component: AgreementDevExpress,
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
						path: 'create',
						component: SettingsTabComponent,
						data: { isEdit: false, defaultName: 'New Master Template' },
						children: [
							{
								path: '',
								pathMatch: 'full',
								component: CreateMasterTemplateComponent,
							},
						],
					},
					{
						path: '',
						component: SettingsTabComponent,
						data: { isEdit: true },
						children: [
							{
								path: ':id/settings',
								component: CreateMasterTemplateComponent,
							},
							{
								path: ':id/editor',
								component: EditorComponent,
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
