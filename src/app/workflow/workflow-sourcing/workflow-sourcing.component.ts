import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ConsultantTerminationSourcingDataCommandDto, ConsultantTerminationSourcingDataQueryDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowTerminationSourcingDataCommandDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSourcingConsultantsDataForm } from './workflow-sourcing.model';

@Component({
    selector: 'app-workflow-sourcing',
    templateUrl: './workflow-sourcing.component.html',
    styleUrls: ['./workflow-sourcing.component.scss']
})
export class WorkflowSourcingComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() activeSideSection: number;
    @Input() workflowId: string;
    @Input() isCompleted: boolean;

    consultantId = 1;
    workflowSideSections = WorkflowProcessType;

    sourcingConsultantsDataForm: WorkflowSourcingConsultantsDataForm;
    consultantList = [
        {
            name: 'Robertsen Oscar'
        },
        {
            name: 'Van Trier Mia'
        }];

    private _unsubscribe = new Subject();

    constructor(
        injector: Injector,
        private _fb: FormBuilder,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _workflowDataService: WorkflowDataService
    ) {
        super(injector);
        this.sourcingConsultantsDataForm = new WorkflowSourcingConsultantsDataForm();
    }

    ngOnInit(): void {
        switch (this.activeSideSection) {
            case this.workflowSideSections.TerminateWorkflow:
                this.getWorkflowSourcingStepTermination();
                break;
            case this.workflowSideSections.TerminateConsultant:
                this.getWorkflowSourcingStepConsultantTermination();
                break;
        }

        this._workflowDataService.workflowConsultantTerminationSourcingSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveTerminationConsultantSourcingStep(value);
            });

        this._workflowDataService.workflowTerminationSourcingSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                this.saveWorkflowTerminationSourcingStep(value);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    // Termination

    addConsultantDataToTerminationForm(consultant: ConsultantTerminationSourcingDataQueryDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant?.consultant?.id),
            consultantData: new FormControl(consultant?.consultant),
            cvUpdated: new FormControl(consultant.cvUpdated)
        });
        this.sourcingConsultantsDataForm.consultantTerminationSourcingData.push(form);
    }

    get consultantTerminationSourcingData(): FormArray {
        return this.sourcingConsultantsDataForm.get('consultantTerminationSourcingData') as FormArray;
    }

    getWorkflowSourcingStepConsultantTermination() {
        this._workflowServiceProxy.terminationConsultantSourcingGet(this.workflowId!, this.consultantId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.addConsultantDataToTerminationForm(result);
            });
    }

    saveTerminationConsultantSourcingStep(isDraft: boolean) {
        let input = new ConsultantTerminationSourcingDataCommandDto();
        input.consultantId = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.consultantId;
        input.cvUpdated = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.cvUpdated;

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationConsultantSourcingPut(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
    
                })
        } else {
            this._workflowServiceProxy.terminationConsultantSourcingComplete(this.workflowId!, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit(true);
            })
        }
    }

    getWorkflowSourcingStepTermination() {
        this._workflowServiceProxy.terminationSourcingGet(this.workflowId!)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                result.consultantTerminationSourcingData?.forEach(data => {
                    this.addConsultantDataToTerminationForm(data);
                })
            });
    }

    saveWorkflowTerminationSourcingStep(isDraft: boolean) {
        let input = new WorkflowTerminationSourcingDataCommandDto();

        input.consultantTerminationSourcingData = new Array<ConsultantTerminationSourcingDataCommandDto>();
        if (this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.value?.length) {
            this.sourcingConsultantsDataForm.consultantTerminationSourcingData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationSourcingDataCommandDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.cvUpdated = consultant.cvUpdated;

                input.consultantTerminationSourcingData!.push(consultantInput);
            });
        }

        this.showMainSpinner();
        if (isDraft) {
            this._workflowServiceProxy.terminationSourcingPut(this.workflowId!, input)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe(result => {
    
                })
        } else {
            this._workflowServiceProxy.terminationSourcingComplete(this.workflowId!, input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(result => {
                this._workflowDataService.workflowSideSectionUpdated.emit(true);
            })
        }
    }

}
