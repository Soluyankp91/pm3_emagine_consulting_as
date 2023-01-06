import { Component } from '@angular/core';
import { CREATIONS_TABS } from 'src/app/contracts/shared/entities/contracts.constants';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';

@Component({
    selector: 'app-client-specific',
    templateUrl: './client-specific.component.html',
})
export class ClientSpecificComponent {
    tabs: Tab[] = CREATIONS_TABS;
    constructor() {}
}
