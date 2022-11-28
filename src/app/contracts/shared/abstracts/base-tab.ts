import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tab } from '../entities/contracts.interfaces';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
@Component({
    template: '',
})
export abstract class BaseTab implements OnInit {
    abstract tabs: Tab[];
    activeTab: string;
    private unSubscribe$ = new Subject<void>();
    constructor(protected route: ActivatedRoute) {}

    ngOnInit(): void {
        this.activeTab = this.tabs[0].link;
        if (!this.route.children.length) {
            return;
        }
        this.route.children[0].url
            .pipe(
                takeUntil(this.unSubscribe$),
                map((urlSegments) => urlSegments[0].path)
            )
            .subscribe((currentPath) => {
                this.activeTab = currentPath;
            });
    }
}
