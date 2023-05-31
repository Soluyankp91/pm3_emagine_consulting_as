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
import { EditorComponent } from './shared/editor/editor.component';
import { AgreementTemplateService, MergeFieldsService } from './shared/editor/data-access';
import { AgreementService } from './shared/editor/data-access/agreement.service';
import { AgreementAbstractService } from './shared/editor/data-access/agreement-abstract.service';
import { MergeFieldsAbstractService } from './shared/editor/data-access/merge-fields-abstract';
import { AgreementMergeFieldsService } from './shared/editor/data-access/agreement-merge-fields';
import { UnsavedChangesGuard } from './shared/editor/services/unsaved-changes.guard';
import { CommentsAbstractService } from './shared/editor/data-access/comments-abstract.service';
import { AgreementCommentsService } from './shared/editor/data-access/agreement-comments.service';
import { AgreementCommentServiceProxy, AgreementTemplateCommentServiceProxy } from '../../shared/service-proxies/service-proxies';
import { AgreementTemplateCommentsService } from './shared/editor/data-access/agreement-template-comments.service';
import { ArchiveComponent } from './agreements/archive/archive.component';

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
								component: EditorComponent,
								data: {
									isAgreement: true,
								},
								canDeactivate: [UnsavedChangesGuard],
								providers: [
									AgreementCommentServiceProxy,
									{
										provide: AgreementAbstractService,
										useClass: AgreementService,
									},
									{
										provide: MergeFieldsAbstractService,
										useClass: AgreementMergeFieldsService,
									},
									{
										provide: CommentsAbstractService,
										useClass: AgreementCommentsService,
									},
								],
							},
							{
								path: ':id/archive',
								component: ArchiveComponent,
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
								component: EditorComponent,
								canDeactivate: [UnsavedChangesGuard],
								data: {
									isClientSpecific: true,
								},
								providers: [
									AgreementTemplateCommentServiceProxy,
									{
										provide: AgreementAbstractService,
										useClass: AgreementTemplateService,
									},
									{
										provide: MergeFieldsAbstractService,
										useClass: MergeFieldsService,
									},
									{
										provide: CommentsAbstractService,
										useClass: AgreementTemplateCommentsService,
									},
								],
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
								canDeactivate: [UnsavedChangesGuard],
								providers: [
									AgreementTemplateCommentServiceProxy,
									{
										provide: AgreementAbstractService,
										useClass: AgreementTemplateService,
									},
									{
										provide: MergeFieldsAbstractService,
										useClass: MergeFieldsService,
									},
									{
										provide: CommentsAbstractService,
										useClass: AgreementTemplateCommentsService,
									},
								],
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
