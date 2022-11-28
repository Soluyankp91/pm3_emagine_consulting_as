import { Tab } from './shared/entities/contracts.interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
const tabs: Tab[] = [
    {
        link: 'agreements',
        label: 'Agreements',
    },
    {
        link: 'client-specific-templates',
        label: 'Client specific templates',
    },
    {
        link: 'master-templates',
        label: 'Master templates',
    },
];
@Component({
    selector: 'app-contract',
    templateUrl: './contract.component.html',
    styleUrls: ['./contract.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractComponent implements OnInit {
    public tabs: Tab[] = tabs;
    public activeTab: string = this.tabs[0].link;

    constructor(private readonly route: ActivatedRoute) {}

    public ngOnInit(): void {
        if (!this.route.children.length) {
            return;
        }
        this.route.children[0].url
            .pipe(map((urlSegments) => urlSegments[0].path))
            .subscribe((currentPath) => {
                this.activeTab = currentPath;
            });
    }
}
