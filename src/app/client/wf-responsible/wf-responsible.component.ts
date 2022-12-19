import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppComponentBase } from 'src/shared/app-component-base';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap } from 'rxjs/operators';
import { EmployeeDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { merge } from 'lodash';


@Component({
    selector: 'app-wf-responsible',
    templateUrl: './wf-responsible.component.html'
})
export class WfResponsibleComponent extends AppComponentBase {
    contractStepResponsible = new FormControl(null, CustomValidators.autocompleteValidator(['id']));
    financeStepResponsible = new FormControl(null, CustomValidators.autocompleteValidator(['id']));
    filteredAccountManagers: EmployeeDto[] = [];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _lookupService: LookupServiceProxy
    ) {
        super(injector);
        merge(
            this.financeStepResponsible.valueChanges,
            this.contractStepResponsible.valueChanges
            )
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.employees(toSend.name);
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredAccountManagers = list;
                } else {
                    this.filteredAccountManagers = [new EmployeeDto({ name: 'No managers found', externalId: '', id: undefined })];
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    // TODO: add call to BE to cahnge responsible person once BE is deployed
}
