import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from 'src/app/workflow/workflow-data.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientPeriodServiceProxy, ConsultantPeriodServiceProxy, EmployeeDto, IdNameDto, LookupServiceProxy, WorkflowProcessType, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
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
    @Input() periodType: number;
    @Input() periodId: string;
    @Input() consultantPeriodId: string;
    @Input() stepType: number;
    @Input() workflowId: string;
    @Input() isFakeActiveStep: boolean;
    @Input() width: number;
    @Input() height: number;

    @Output() managerSelected: EventEmitter<number> = new EventEmitter<number>();

    managerStatuses = ManagerStatus;

    managerFilter = new UntypedFormControl('');
    filteredManagers: any[] = [];
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _lookupService: LookupServiceProxy,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _consultantPeriodService: ConsultantPeriodServiceProxy,
        private _workflowService: WorkflowServiceProxy,
        private _workflowDataService: WorkflowDataService
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
                return this._lookupService.employees(toSend.name);
            }),
        ).subscribe((list: any) => {
            if (list.length) {
                this.filteredManagers = list;
            } else {
                this.filteredManagers = [{ name: 'No managers found', id: 'no-data' }];
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
        if (this.isFakeActiveStep !== null && this.isFakeActiveStep !== undefined) {
            this.updateSalesAccountManager(option);
        } else {
            switch (this.periodType) {
                case WorkflowProcessType.StartClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                case WorkflowProcessType.ChangeClientPeriod:
                    this.changeResponsibleForClientPeriodStep(option);
                    break;
                case WorkflowProcessType.TerminateWorkflow:
                    this.changeResponsibleWorkflowTerminationStep(option);
                    break;
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    this.changeResponsibleForConsultantPeriodStep(option);
                    break;
                case WorkflowProcessType.TerminateConsultant:
                    this.changeResponsibleConsultantTerminationStep(option);
                    break;
            }
        }
        this.managerSearchMenu.closeMenu();
    }

    changeResponsibleForClientPeriodStep(responsiblePerson: EmployeeDto) {
        this.showMainSpinner();
        this._clientPeriodService.stepResponsible(this.periodId, this.stepType, responsiblePerson.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.responsiblePerson = responsiblePerson;
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            });
    }

    changeResponsibleForConsultantPeriodStep(responsiblePerson: EmployeeDto) {
        this.showMainSpinner();
        this._consultantPeriodService.stepResponsible2(this.consultantPeriodId, this.stepType,  responsiblePerson.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.responsiblePerson = responsiblePerson;
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            });
    }

    changeResponsibleWorkflowTerminationStep(responsiblePerson: EmployeeDto) {
        this.showMainSpinner();
        this._workflowService.terminationStepResponsible(this.workflowId, this.stepType,  responsiblePerson.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.responsiblePerson = responsiblePerson;
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            });
    }

    changeResponsibleConsultantTerminationStep(responsiblePerson: EmployeeDto) {
        this.showMainSpinner();
        this._workflowService.terminationConsultantStepResponsible(this.stepType, this.workflowId, this.consultantPeriodId,  responsiblePerson.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.responsiblePerson = responsiblePerson;
                this._workflowDataService.workflowSideSectionUpdated.emit({isStatusUpdate: true});
            });
    }

    updateSalesAccountManager(responsiblePerson: EmployeeDto) {
        this.showMainSpinner();
        this._clientPeriodService.salesAccountManager(this.periodId,  responsiblePerson.id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.responsiblePerson = responsiblePerson;
                this._workflowDataService.workflowOverviewUpdated.emit(true);
            });
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
