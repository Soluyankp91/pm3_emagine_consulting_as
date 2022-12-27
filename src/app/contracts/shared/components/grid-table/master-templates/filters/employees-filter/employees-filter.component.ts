import { ReplaySubject, Observable } from 'rxjs';
import { startWith, switchMap, tap, take, pluck } from 'rxjs/operators';

import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
    EmployeeDto,
    LookupServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { MasterTemplatesService } from 'src/app/contracts/master-templates/listAndPreviews/services/master-templates.service';

@Component({
    selector: 'app-employees-filter',
    templateUrl: './employees-filter.component.html',
})
export class EmployeesFilterComponent {
    @Output() initialLoading = new ReplaySubject<boolean>(1).pipe(
        take(1)
    ) as ReplaySubject<boolean>;

    textEmitter = new EventEmitter();

    filterFormControl: UntypedFormControl;
    employees$: Observable<EmployeeDto[]>;

    private tableFilter = 'lastUpdatedByLowerCaseInitials';

    constructor(
        private lookupServiceProxy: LookupServiceProxy,
        private readonly masterTemplateService: MasterTemplatesService
    ) {
        this._initEmployees();
        this.masterTemplateService
            .getTableFilters$()
            .pipe(take(1), pluck(this.tableFilter))
            .subscribe((salesTypes) => {
                this.filterFormControl = new UntypedFormControl(salesTypes);
            });
    }

    emitText($event: { nameFilter: string; idsToExclude: number[] }) {
        this.textEmitter.emit($event);
    }

    private _initEmployees() {
        this.employees$ = this.textEmitter.pipe(
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
    }
}
