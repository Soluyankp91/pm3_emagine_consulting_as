import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ApiServiceProxy, ClientDetailsDto, ClientsServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ClientDocumentsComponent } from '../client-documents/client-documents.component';
@Component({
    selector: 'app-client-details',
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent extends AppComopnentBase implements OnInit {
    @ViewChild('documentsTab', {static: true}) documentsTab: ClientDocumentsComponent;
    selectedClient = {
        name: 'Volkswagen Financial Services',
        id: 1327,
        address: 'Some address 1',
        address2: 'Some address 2',
        postcode: '28912',
        country: 'Denmark',
        countryCode: 'DK',
        phone: '+54 456 788 45 12',
        website: 'somewebsite.com',
        type: 'Type',
        accountManager: 'Some owner'
    };

    client: ClientDetailsDto;

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
        private _authService: MsalService,
        private localHttpService: LocalHttpService
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
        this.showMainSpinner();
        this._apiService.clients(this.clientId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.client = result;
            });
    }

    impersonateHubspot() {
        // this._clientService.hubspotClientUrl(this.client.clientId!)
        // .pipe(finalize(() => {}))
        // .subscribe(result => {
        //     console.log(result);
        //     window.open(result, '_blank');
        // });
        this.localHttpService.getToken().then((response: AuthenticationResult) => {
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
        // const params = {
        //     scopes: ['openid', 'profile', 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user'],
        //     redirectUri: '',
        //     extraQueryParameters: undefined,
        //     authority: 'https://login.microsoftonline.com/0749517d-d788-4fc5-b761-0cb1a1112694/',
        //     account: this._authService.instance.getActiveAccount()!,
        //     correlationId: '',
        //     forceRefresh: false
        // }
        // let bearerToken: string;
        // this._authService.instance.acquireTokenSilent(params)
        //     .then((result: AuthenticationResult) => {
        //         console.log(result);
        //         bearerToken = result.accessToken;
        //         this.httpClient.get(`${this.apiUrl}/api/Clients/${this.client.clientId!}/CamImpersonationUrl`,
        //             {
        //                 headers: new HttpHeaders({
        //                     'Authorization': `Bearer ${bearerToken}`
        //                 }),
        //                 responseType: 'text'
        //             }
        //             ).subscribe((result: any) => {
        //             window.open(result, '_blank');
        //         })
        //     });
        
        this.localHttpService.getToken().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Clients/${this.client.clientId!}/CamImpersonationUrl`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                }).subscribe((result: any) => {
                    window.open(result, '_blank');
            })
        });


        // this._clientService.camImpersonationUrl(this.client.clientId!)
        //     .pipe(finalize(() => {}))
        //     .subscribe(result => {
        //         console.log(result);
        //         window.open(result, '_blank');
        //     });
    }

    navigateBack() {
        this.router.navigate(['/app/clients']);
    }
}
