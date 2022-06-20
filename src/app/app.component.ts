import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, PopupRequest, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    // selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {

    }

    openSourcingApp() {
        window.open(environment.sourcingUrl, '_blank');
    }

    openHubspot() {
        window.open('https://app.hubspot.com/login', '_blank');
    }

    clickMethod($event: MouseEvent) {
        if ($event.ctrlKey || $event.metaKey) {
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['app', 'clients'])
          );
          window.open(url, '_blank');
        } else {
          return this.router.navigate(['app', 'clients']);
        }
    }

}
