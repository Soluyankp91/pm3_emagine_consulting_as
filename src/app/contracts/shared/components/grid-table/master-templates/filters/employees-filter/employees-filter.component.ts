import { ReplaySubject } from 'rxjs';
import { startWith, switchMap, tap, take, pluck } from 'rxjs/operators';

import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { MasterTemplatesService } from 'src/app/contracts/components/master-templates/master-templates.service';

@Component({
    selector: 'app-employees-filter',
    templateUrl: './employees-filter.component.html',
    styleUrls: ['./employees-filter.component.scss'],
})
export class EmployeesFilterComponent {
    @Output() initialLoading = new ReplaySubject<boolean>(1).pipe(
        take(1)
    ) as ReplaySubject<boolean>;

    constructor(
        private lookupServiceProxy: LookupServiceProxy,
        private readonly masterTemplateService: MasterTemplatesService
    ) {
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe(salesTypes => {
                this.fc = new FormControl(salesTypes);
            });
    }

    textEmitter = new EventEmitter();
    employees$ = this.textEmitter.pipe(
        startWith({ nameFilter: '', idsToExclude: [] }),
        switchMap(({ nameFilter, idsToExclude }) => {
            return this.lookupServiceProxy.employees(
                nameFilter,
                false,
                idsToExclude
            );
        }),
        tap(() => this.initialLoading.next(true))
    );
    fc: FormControl;
    private tableFilter = 'employees';
    emitText($event: { nameFilter: string; idsToExclude: number[] }) {
        this.textEmitter.emit($event);
    }
}
