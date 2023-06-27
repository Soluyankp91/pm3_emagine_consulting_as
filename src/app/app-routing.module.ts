import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TitleService } from 'src/shared/common/services/title.service';
import { AppComponent } from './app.component';
import { ContractsProductionGuard } from './guards/production.guard';
import { InitialDataResolver } from './app.resolver';

@NgModule({
	imports: [
		RouterModule.forChild([
			{
				path: '',
				component: AppComponent,
				resolve: {
					appData: InitialDataResolver,
				},
				children: [
					{
						path: '',
						redirectTo: 'overview',
						pathMatch: 'full',
					},
					{
						path: 'overview',
						loadChildren: () => import('../app/overview/overview.module').then((m) => m.OverviewModule),
						data: { preload: true },
					},
					{
						path: 'clients',
						loadChildren: () => import('../app/client/client.module').then((m) => m.ClientModule),
						data: { preload: true },
					},
					{
						path: 'workflow',
						loadChildren: () => import('../app/workflow/workflow.module').then((m) => m.WorkflowModule),
						data: { preload: true },
					},
					{
						path: 'contracts',
						loadChildren: () => import('../app/contracts/contracts.module').then((m) => m.ContractsModule),
						canActivate: [ContractsProductionGuard],
					},
                    {
						path: 'purchase-orders',
						loadChildren: () => import('../app/po-list/po-list.module').then((m) => m.PoListModule),
					},
					{
						path: 'notifications',
						loadChildren: () => import('../app/notification/notifications.module').then((m) => m.NotificationsModule),
						data: { preload: true },
					},
					{
						path: '',
						children: [
							{
								path: '',
								redirectTo: '/app/overview',
								pathMatch: 'full',
							},
						],
					},
					{
						path: '**',
						redirectTo: '',
					},
				],
			},
		]),
	],
	exports: [RouterModule],
	providers: [TitleService],
})
export class AppRoutingModule {}
