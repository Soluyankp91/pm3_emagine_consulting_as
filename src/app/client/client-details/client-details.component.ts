import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ApiServiceProxy, ClientDetailsDto, ClientsServiceProxy, SyncClientFromCrmResultDto } from 'src/shared/service-proxies/service-proxies';
import { ClientDocumentsComponent } from '../client-documents/client-documents.component';
import { HubspotSyncModalComponent } from './hubspot-sync-modal/hubspot-sync-modal.component';

@Component({
    selector: 'app-client-details',
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent extends AppComponentBase implements OnInit {
    @ViewChild('documentsTab', {static: true}) documentsTab: ClientDocumentsComponent;

    client = new ClientDetailsDto();

    clientFilterInput = new FormControl();
    clientId: number;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _apiService: ApiServiceProxy,
        private _clientService: ClientsServiceProxy,
        private httpClient: HttpClient,
        private localHttpService: LocalHttpService,
        private dialog: MatDialog
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this.getClientDetails();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getClientDetails() {
        this._apiService.clients(this.clientId)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.client = result;
            });
    }

    impersonateHubspot() {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Clients/${this.client.clientId!}/HubspotClientUrlAsync`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                }).subscribe((result: any) => {
                    window.open(result, '_blank');
            })
        });
    }

    impersonateCAM() {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Clients/${this.client.clientId!}/CamImpersonationUrl`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                }).subscribe((result: any) => {
                    window.open(result, '_blank');
            })
        });
    }

    navigateBack() {
        this.router.navigate(['/app/clients']);
    }

    syncFromHubspot() {
        this._clientService.crmSync(this.clientId).subscribe(result => {
            this.openHubspotSyncDialog(result);
        })
    }

    openHubspotSyncDialog(syncMessage: SyncClientFromCrmResultDto) {
        this.showMainSpinner();
        const dialogRef = this.dialog.open(HubspotSyncModalComponent, {
            width: '450px',
            minHeight: '180px',
            height: 'calc(100vh - 120px)',
            autoFocus: false,
            panelClass: 'hubspot-sync-modal',
            hasBackdrop: false,
            data: {
                message: syncMessage.message?.split('\n').filter(item => item)
            }
        });
        dialogRef.afterOpened().subscribe(() => {
            this.hideMainSpinner();
        })
    }
}
