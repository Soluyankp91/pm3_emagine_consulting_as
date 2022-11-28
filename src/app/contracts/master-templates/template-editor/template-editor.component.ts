import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { BaseTab } from 'src/app/contracts/shared/abstracts/base-tab';
import { CREATIONS_TABS } from 'src/app/contracts/shared/entities/contracts.constants';

@Component({
    selector: 'app-master-template-creation',
    templateUrl: './template-editor.component.html',
    styleUrls: ['./template-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterTemplateCreationComponent extends BaseTab {
    tabs: Tab[] = CREATIONS_TABS;
    public activeTab: string;

    constructor(protected route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
}
