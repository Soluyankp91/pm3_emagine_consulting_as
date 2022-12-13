import { Component, Input, OnInit } from '@angular/core';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'emg-tenants',
    templateUrl: './tenants.component.html',
    styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit {
    @Input() tenants: (LegalEntityDto & { code: string })[];
    constructor() {}

    countryLimit = 3;
    ngOnInit(): void {}
}
