import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ClientPeriodServiceProxy, ConsultantPeriodFinanceDataDto, WorkflowProcessType } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { FinancesClientForm, FinancesConsultantsForm } from './workflow-finances.model';

@Component({
    selector: 'app-workflow-finances',
    templateUrl: './workflow-finances.component.html',
    styleUrls: ['./workflow-finances.component.scss']
})
export class WorkflowFinancesComponent extends AppComopnentBase implements OnInit {
    @Input() workflowId: string;
    @Input() clientPeriodId: string | undefined;

    // Changed all above to enum
    @Input() activeSideSection: number;
    @Input() isCompleted: boolean;

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
    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _workflowDataService: WorkflowDataService,
        private _clientPeriodSerivce: ClientPeriodServiceProxy
    ) {
        super(injector);
        this.financesClientForm = new FinancesClientForm();
        this.financesConsultantsForm = new FinancesConsultantsForm();
    }

    ngOnInit(): void {
        // this.consultantList.forEach(consultant => {
        //     this.addConsultantToForm(consultant);
        // });
        this.getFinancesStep();
    }

    get readOnlyMode() {
        return this.isCompleted;
    }

    getFinancesStep() {
        this.showMainSpinner();
        this._clientPeriodSerivce.financeGet(this.clientPeriodId!)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this.financesClientForm.clientCreatedInNavision?.setValue(result.debtorCreatedInNavision, {emitEvent: false});
                this.financesClientForm.differentDebtorNumberForInvoicing?.setValue(result.differentDebtorNumberForInvoicing, {emitEvent: false});
                this.financesClientForm.customDebtorNumber?.setValue(result.customDebtorNumber, {emitEvent: false});
                result?.consultantFinanceData?.forEach(consultant => this.addConsultantToForm(consultant));
            });
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
