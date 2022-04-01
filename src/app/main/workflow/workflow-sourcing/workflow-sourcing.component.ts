import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ConsultantTerminationSourcingDataDto, WorkflowProcessType, WorkflowServiceProxy, WorkflowTerminationSourcingDataDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowSourcingConsultantsDataForm } from './workflow-sourcing.model';

@Component({
    selector: 'app-workflow-sourcing',
    templateUrl: './workflow-sourcing.component.html',
    styleUrls: ['./workflow-sourcing.component.scss']
})
export class WorkflowSourcingComponent implements OnInit, OnDestroy {
    @Input() activeSideSection: number;
    @Input() workflowId: string;

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
        private _fb: FormBuilder,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private _workflowDataService: WorkflowDataService
    ) {
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
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.updateTerminationConsultantSourcingStep();
            });

        this._workflowDataService.workflowConsultantTerminationSourcingCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.completeTerminationConsultantSourcingStep();
            });

        this._workflowDataService.workflowTerminationSourcingSaved
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.updateTerminationSourcingStep();
            });

        this._workflowDataService.workflowTerminationSourcingCompleted
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((value: boolean) => {
                // NB: boolean SAVE DRAFT or COMPLETE in future
                this.completeTerminationSourcingStep();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    // Termination

    addConsultantDataToTerminationForm(consultant: ConsultantTerminationSourcingDataDto) {
        const form = this._fb.group({
            consultantId: new FormControl(consultant.consultantId),
            // consultantName: new FormControl(consultant.name),
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

    updateTerminationConsultantSourcingStep() {
        let input = new ConsultantTerminationSourcingDataDto();
        input.consultantId = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.consultantId;
        input.cvUpdated = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.cvUpdated;

        this._workflowServiceProxy.terminationConsultantSourcingPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationConsultantSourcingStep() {
        let input = new ConsultantTerminationSourcingDataDto();
        input.consultantId = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.consultantId;
        input.cvUpdated = this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.at(0).value.cvUpdated;

        this._workflowServiceProxy.terminationConsultantSourcingComplete(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
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

    updateTerminationSourcingStep() {
        let input = new WorkflowTerminationSourcingDataDto();

        input.consultantTerminationSourcingData = new Array<ConsultantTerminationSourcingDataDto>();
        if (this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.value?.length) {
            this.sourcingConsultantsDataForm.consultantTerminationSourcingData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationSourcingDataDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.cvUpdated = consultant.cvUpdated;

                input.consultantTerminationSourcingData!.push(consultantInput);
            });
        }

        this._workflowServiceProxy.terminationSourcingPut(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

    completeTerminationSourcingStep() {
        let input = new WorkflowTerminationSourcingDataDto();

        input.consultantTerminationSourcingData = new Array<ConsultantTerminationSourcingDataDto>();
        if (this.sourcingConsultantsDataForm.consultantTerminationSourcingData?.value?.length) {
            this.sourcingConsultantsDataForm.consultantTerminationSourcingData.value.forEach((consultant: any) => {
                let consultantInput = new ConsultantTerminationSourcingDataDto();
                consultantInput.consultantId = consultant.consultantId;
                consultantInput.cvUpdated = consultant.cvUpdated;

                input.consultantTerminationSourcingData!.push(consultantInput);
            });
        }


        this._workflowServiceProxy.terminationSourcingComplete(this.workflowId!, input)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {

            })
    }

}
