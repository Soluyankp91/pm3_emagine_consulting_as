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
        id: 1327
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
