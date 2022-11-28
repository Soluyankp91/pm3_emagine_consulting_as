import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { CREATIONS_TABS } from 'src/app/contracts/shared/entities/contracts.constants';

@Component({
    selector: 'app-master-template-creation',
    templateUrl: './template-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterTemplateCreationComponent {
    tabs: Tab[] = CREATIONS_TABS;

    constructor() {}

    ngOnInit(): void {}
}
