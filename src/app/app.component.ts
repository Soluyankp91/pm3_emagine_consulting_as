import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { environment } from 'src/environments/environment';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EmployeeServiceProxy, CurrentEmployeeDto, ConfigurationServiceProxy } from 'src/shared/service-proxies/service-proxies';
@Component({
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AppComponentBase implements OnInit {
	accountInfo: any;
	currentEmployee: CurrentEmployeeDto | undefined;
	contractsEnabled: boolean = false;

	constructor(
		injector: Injector,
		private router: Router,
		private authService: MsalService,
		private _employeeService: EmployeeServiceProxy,
		private _configurationService: ConfigurationServiceProxy
	) {
		super(injector);
	}

	ngOnInit(): void {
		this.accountInfo = this.authService.instance.getActiveAccount();
		this.getCurrentEmployee();
		this.getConfigurations();
	}

	openSourcingApp() {
		window.open(environment.sourcingUrl, '_blank');
	}

	openHubspot() {
		window.open('https://app.hubspot.com/login', '_blank');
	}

	clickMethod($event: MouseEvent) {
		if ($event.ctrlKey || $event.metaKey) {
			const url = this.router.serializeUrl(this.router.createUrlTree(['app', 'clients']));
			window.open(url, '_blank');
		} else {
			return this.router.navigate(['app', 'clients']);
		}
	}

	getCurrentEmployee() {
		this._employeeService.current().subscribe((result) => {
			this.currentEmployee = result;
		});
	}

	getConfigurations() {
		this._configurationService.contractsEnabled().subscribe((enabled) => {
			this.contractsEnabled = enabled;
		});
	}

	logout() {
		this.authService.logoutPopup({
			mainWindowRedirectUri: '/',
		});
	}
}
