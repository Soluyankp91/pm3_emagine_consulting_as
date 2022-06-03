import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { EmployeeDto, IdNameDto, LookupServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ManagerStatus } from './manager-search.model';

@Component({
    selector: 'app-manager-search',
    templateUrl: './manager-search.component.html',
    styleUrls: ['./manager-search.component.scss']
})
export class ManagerSearchComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild(MatMenuTrigger) managerSearchMenu: MatMenuTrigger;
    @Input() formFieldLabel: string;
    @Input() managerSearchType: number;
    @Input() managerStatus: number;
    @Input() readonly: boolean;
    @Input() responsiblePerson: EmployeeDto;
    @Output() managerSelected: EventEmitter<number> = new EventEmitter<number>();

    managerStatuses = ManagerStatus;

    managerFilter = new FormControl('');
    filteredManagers: IdNameDto[] = [];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _lookupService: LookupServiceProxy
    ) {
        super(injector);
        this.managerFilter.valueChanges.pipe(
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

                return this._lookupService.employees(value);
                // return new Observable();
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.filteredManagers = list;
            } else {
                // this.filteredManagers = [{ name: 'No sourcers found', id: undefined }];
                this.filteredManagers = [];
            }
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    selectOption(event: Event, option: EmployeeDto) {
        event.stopPropagation();
        this.managerSelected.emit(option.id);
        this.managerSearchMenu.closeMenu();
    }

    detectManagerStatus(status: number) {
        switch (status) {
            case ManagerStatus.Upcoming:
                return 'upcoming-icon';
            case ManagerStatus.Pending:
                return 'in-progress-icon';
            case ManagerStatus.Completed:
                return 'completed-icon';
            default:
                return '';
        }
    }

    detectStatusTooltip(status: number) {
        switch (status) {
            case ManagerStatus.Upcoming:
                return 'Upcoming';
            case ManagerStatus.Pending:
                return 'Pending';
            case ManagerStatus.Completed:
                return 'Completed';
            default:
                return '';
        }
    }

    displayNameFn(option: any) {
        return option?.name;
    }

}
