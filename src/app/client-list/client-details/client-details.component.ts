import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-client-details',
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {
    selectedClient = {
        name: 'test',
        id: 1327,
        address: 'Some address 1',
        address2: 'Some address 2',
        postcode: '28912',
        country: 'Denmark',
        phone: '+54 456 788 45 12',
        website: 'somewebsite.com',
        type: 'Type',
        accountManager: 'Some owner'
    };

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
    }

    navigateBack() {
        this.router.navigate(['clients']);
    }

}
