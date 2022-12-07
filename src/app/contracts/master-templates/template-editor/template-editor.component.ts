import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
} from '@angular/core';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { getAllRouteParams } from '../../shared/utils/allRouteParams';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-master-template-creation',
    templateUrl: './template-editor.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterTemplateCreationComponent implements OnInit, OnDestroy {
    tabs: Tab[];

    private _unSubscribe$ = new Subject<void>();

    constructor(private readonly router: Router) {}

    ngOnInit(): void {
        this._setTabs();
        this._subscribeOnRouteChanges();
    }

    ngOnDestroy(): void {
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

    private _subscribeOnRouteChanges() {
        this.router.events
            .pipe(
                takeUntil(this._unSubscribe$),
                filter((event) => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                this._setTabs();
            });
    }

    private _setTabs() {
        let routeParamsArr = getAllRouteParams(
            this.router.routerState.snapshot.root
        );
        if (routeParamsArr[7] && routeParamsArr[7].id) {
            let templateId = routeParamsArr[7].id;
            this.tabs = [
                {
                    link: `${templateId}/settings`,
                    label: 'Settings',
                },
                {
                    link: `${templateId}/editor`,
                    label: 'Editor',
                },
            ];
            return;
        }
        this.tabs = [
            {
                link: 'create',
                label: 'Settings',
            },
            {
                link: '',
                label: 'Editor',
                disabled: true,
            },
        ];
    }
}
