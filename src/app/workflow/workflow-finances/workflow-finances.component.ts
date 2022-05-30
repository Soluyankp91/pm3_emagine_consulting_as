import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientFinanceServiceProxy, ClientPeriodFinanceDataDto, ClientPeriodServiceProxy, ConsultantFinanceServiceProxy, ConsultantPeriodFinanceDataDto, ConsultantPeriodServiceProxy, WorkflowProcessType } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { FinancesClientForm, FinancesConsultantsForm } from './workflow-finances.model';

@Component({
    selector: 'app-workflow-finances',
    templateUrl: './workflow-finances.component.html',
    styleUrls: ['./workflow-finances.component.scss']
})
export class WorkflowFinancesComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() workflowId: string;
    @Input() periodId: string | undefined;
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;
    @Input() permissionsForCurrentUser: { [key: string]: boolean; } | undefined;

    workflowSideSections = WorkflowProcessType;

    financesClientForm: FinancesClientForm;
    financesConsultantsForm: FinancesConsultantsForm;

    consultantList = [
        {
            consultantName: 'Robertsen Oscar'
        },
        {
            consultantName: 'Van Trier Mia'
        }
    ]

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _workflowDataService: WorkflowDataService,
        private _clientPeriodSerivce: ClientPeriodServiceProxy,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private _financeService: ClientFinanceServiceProxy,
        private _consutlantFinanceService: ConsultantFinanceServiceProxy
    ) {
        super(injector);
        this.financesClientForm = new FinancesClientForm();
        this.financesConsultantsForm = new FinancesConsultantsForm();
    }

    ngOnInit(): void {
        switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
            case WorkflowProcessType.StartClientPeriod:
            case WorkflowProcessType.ChangeClientPeriod:
            case WorkflowProcessType.ExtendClientPeriod:
                this.getStartChangeOrExtendClientPeriodFinances();
                break;
            case WorkflowProcessType.StartConsultantPeriod:
                this.getStartConsultantPeriodFinance()
                break;
        }

        this._workflowDataService.startClientPeriodFinanceSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendClientPeriodFinance(value);
            });

        this._workflowDataService.consultantStartChangeOrExtendFinanceSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveStartChangeOrExtendConsultantPeriodFinance(value);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    getStartChangeOrExtendClientPeriodFinances() {
        this.showMainSpinner();
        this._clientPeriodSerivce.clientFinanceGet(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.financesClientForm.clientCreatedInNavision?.setValue(result.debtorCreatedInNavision, {emitEvent: false});
                this.financesClientForm.differentDebtorNumberForInvoicing?.setValue(result.differentDebtorNumberForInvoicing, {emitEvent: false});
                this.financesClientForm.customDebtorNumber?.setValue(result.customDebtorNumber, {emitEvent: false});
                result?.consultantFinanceData?.forEach((consultant: ConsultantPeriodFinanceDataDto) => this.addConsultantToForm(consultant));
            });
    }

    saveStartChangeOrExtendClientPeriodFinance(isDraft: boolean) {
        let input = new ClientPeriodFinanceDataDto();
        input.differentDebtorNumberForInvoicing = this.financesClientForm.differentDebtorNumberForInvoicing?.value;
        input.customDebtorNumber = this.financesClientForm.customDebtorNumber?.value;
        input.debtorCreatedInNavision = this.financesClientForm.clientCreatedInNavision?.value;
        input.consultantFinanceData = new Array<ConsultantPeriodFinanceDataDto>();
        this.financesConsultantsForm.consultants.value.forEach((consultant: any) => {
            let consultantInput = new ConsultantPeriodFinanceDataDto();
            consultantInput.consultantId = consultant.id;
            consultantInput.checkInvoicingSettingsOnConsultant = consultant.checkInvoicingSettingsOnConsultant;
            consultantInput.creditorCreatedInNavision = consultant.creditorCreatedInNavision;
            consultantInput.consultant = consultant.consultant;
            input.consultantFinanceData?.push(consultantInput);
        });
        this.showMainSpinner();
        if (isDraft) {
            this._clientPeriodSerivce.clientFinancePut(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
    
                });
        } else {
            this._financeService.editFinish(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit(true);
                });
        }
    }

    getStartConsultantPeriodFinance() {
        this.showMainSpinner();
        this._consultantPeriodSerivce.consultantFinanceGet(this.periodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.addConsultantToForm(result);
            });
    }

    saveStartChangeOrExtendConsultantPeriodFinance(isDraft: boolean) {
        let input = new ConsultantPeriodFinanceDataDto();
        input.checkInvoicingSettingsOnConsultant = this.consultants.at(0).value.get('checkInvoicingSettingsOnConsultant').value;
        input.consultantId = this.consultants.at(0).value.get('id').value;
        input.creditorCreatedInNavision = this.consultants.at(0).value.get('creditorCreatedInNavision').value;
        input.consultant = this.consultants.at(0).value.get('consultant').value;
        this.showMainSpinner();
        if (isDraft) {
            this._consultantPeriodSerivce.consultantFinancePut(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {

                });
        } else {
            this._consutlantFinanceService.editFinish(this.periodId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
                    this._workflowDataService.workflowSideSectionUpdated.emit(true);
                });
        }
    }
    
    addConsultantToForm(consultant: ConsultantPeriodFinanceDataDto) {
        const form = this._fb.group({
            id: new FormControl(consultant.consultantId),
            checkInvoicingSettingsOnConsultant: new FormControl(consultant.checkInvoicingSettingsOnConsultant),
            creditorCreatedInNavision: new FormControl(consultant.creditorCreatedInNavision),
            consultant: new FormControl(consultant?.consultant)
        });
        this.financesConsultantsForm.consultants.push(form);
    }

    get consultants(): FormArray {
        return this.financesConsultantsForm.get('consultants') as FormArray;
    }

    removeConsultant(index: number) {
        this.consultants.removeAt(index);
    }

}
