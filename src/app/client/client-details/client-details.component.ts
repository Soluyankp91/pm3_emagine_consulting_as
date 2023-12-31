import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { TitleService } from 'src/shared/common/services/title.service';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ClientAddressDto, ClientDetailsDto, ClientsServiceProxy, SyncClientFromCrmResultDto } from 'src/shared/service-proxies/service-proxies';
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
    clientAddress: ClientAddressDto;
    clientAddressDisplay = '';

    clientFilterInput = new UntypedFormControl();
    clientId: number;

    private _unsubscribe = new Subject();
    private isDialogOpened = false;

    constructor(
        injector: Injector,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _clientService: ClientsServiceProxy,
        private httpClient: HttpClient,
        private localHttpService: LocalHttpService,
        private dialog: MatDialog,
        private _titleService: TitleService,
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
        this.dialog.closeAll();
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getClientDetails() {
        this._clientService.clients(this.clientId)
            .pipe(finalize(() => {}))
            .subscribe(result => {
                this.client = result;
                this.clientAddress = result.clientAddresses?.find(x => x.isMainAddress);
                if (this.clientAddress !== null && this.clientAddress !== undefined) {
                    this.clientAddressDisplay = [this.clientAddress.address, this.clientAddress.address2, this.clientAddress.postCode, this.clientAddress.city, this.clientAddress.countryCode].filter(Boolean).join(', ');
                }
                this._titleService.setTitle(ERouteTitleType.ClientDetails, result.name);
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
        if (!this.isDialogOpened) {
            this.isDialogOpened = true;
            this.showMainSpinner();
            this._clientService.crmSync(this.clientId)
                .pipe(finalize(() => this.hideMainSpinner() ))
                .subscribe(result => {
                    this.openHubspotSyncDialog(result);
                })
        }
    }

    openHubspotSyncDialog(syncMessage: SyncClientFromCrmResultDto) {
        const dialogRef = this.dialog.open(HubspotSyncModalComponent, {
                width: '500px',
                height: 'calc(100vh - 201px)',
                panelClass: 'hubspot-sync-modal',
                autoFocus: false,
                hasBackdrop: false,
                data: {
                    message: syncMessage.message?.split('.\n').filter(item => item)
                }
            });

            dialogRef.afterClosed().subscribe(() => {
                this.isDialogOpened = false;
            });
    }
}
