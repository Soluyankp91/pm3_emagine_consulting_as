import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tab } from '../entities/contracts.interfaces';
import { map } from 'rxjs/operators';
@Component({
    template: '',
})
export abstract class BaseTab implements OnInit {
    abstract tabs: Tab[];
    activeTab: string;
    constructor(protected route: ActivatedRoute) {}
    ngOnInit(): void {
        this.activeTab = this.tabs[0].link;
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
