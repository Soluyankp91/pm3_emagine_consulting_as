import { Component, Injector } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AppComponentBase } from 'src/shared/app-component-base';
import { merge, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, finalize} from 'rxjs/operators';
import { ClientsServiceProxy, EmployeeDto, LookupServiceProxy, UpdateClientWFResponsibleCommand } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-wf-responsible',
    styleUrls: ['./wf-responsible.component.scss'],
    templateUrl: './wf-responsible.component.html'
})
export class WfResponsibleComponent extends AppComponentBase implements OnInit, OnDestroy {
    clientId: number;
    contractStepResponsible = new FormControl(null, CustomValidators.autocompleteValidator(['id']));
    financeStepResponsible = new FormControl(null, CustomValidators.autocompleteValidator(['id']));
    filteredAccountManagers: EmployeeDto[] = [];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private _lookupService: LookupServiceProxy,
        private _clientService: ClientsServiceProxy
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

    ngOnInit(): void {
        this.activatedRoute.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
            this.getResponsiblePersons();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getResponsiblePersons() {
        this.showMainSpinner();
        this._clientService.getWFResponsible(this.clientId)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.financeStepResponsible.setValue(result.financeStepResponsibleEmployee, {emitEvent: false});
                this.contractStepResponsible.setValue(result.contractStepResponsibleEmployee, {emitEvent: false});
            });
    }

    setResponsiblePerson() {
        let input = new UpdateClientWFResponsibleCommand();
        input.clientId = this.clientId;
        input.contractStepResponsibleEmployeeId = this.contractStepResponsible.value?.id;
        input.financeStepResponsibleEmployeeId = this.financeStepResponsible.value?.id;
        this._clientService.postWFResponsible(this.clientId, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe();
    }
}
