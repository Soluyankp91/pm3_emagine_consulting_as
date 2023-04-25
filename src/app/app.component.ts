import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { environment } from 'src/environments/environment';
import { AppComponentBase } from 'src/shared/app-component-base';
import { Store } from '@ngrx/store';

import { EmployeeServiceProxy, CurrentEmployeeDto, ConfigurationServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { loadEmployees, loadResponsiblePersons } from './store/actions/core.actions';
@Component({
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AppComponentBase implements OnInit {
    production = environment.production;
    accountInfo: any;
    currentEmployee: CurrentEmployeeDto | undefined;
	contractsEnabled: boolean = false;
	constructor(
		injector: Injector,
		private router: Router,
		private authService: MsalService,
		private _employeeService: EmployeeServiceProxy,
		private _configurationService: ConfigurationServiceProxy,
        private _store: Store
	) {
		super(injector);
	}

    ngOnInit(): void {
        this.accountInfo = this.authService.instance.getActiveAccount();
        this.getCurrentEmployee();
        this.getConfigurations();
        this._store.dispatch(loadEmployees());
        this._store.dispatch(loadResponsiblePersons());
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
