import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseTab } from 'src/app/contracts/shared/abstracts/base-tab';
import { CREATIONS_TABS } from 'src/app/contracts/shared/entities/contracts.constants';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';

@Component({
    selector: 'app-client-specific',
    templateUrl: './client-specific.component.html',
    styleUrls: ['./client-specific.component.scss'],
})
export class ClientSpecificComponent extends BaseTab implements OnInit {
    tabs: Tab[] = CREATIONS_TABS;
    constructor(protected route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
}
