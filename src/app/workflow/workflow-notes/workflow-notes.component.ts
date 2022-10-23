import { Component, OnInit, Injector, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { AppComponentBase } from 'src/shared/app-component-base';
import { finalize } from 'rxjs/operators';
import { EmployeeRole, EmployeeServiceProxy, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';

@Component({
    selector: 'app-workflow-notes',
    templateUrl: './workflow-notes.component.html',
    styleUrls: ['./workflow-notes.component.scss']
})
export class WorkflowNotesComponent extends AppComponentBase implements OnInit {
    @Input() topToolbarVisible: boolean;
    @Input() workflowId: string;
    @Input() alwaysVisible: boolean;
    @Output() noteHidden = new EventEmitter<any>();
    notesEditable = false;
    isNoteVisible = false;
    isAllowedToEdit = false;

    workflowNote = new UntypedFormControl('', Validators.maxLength(4000));
    workflowNoteOldValue: string;
    constructor(
        injector: Injector,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private localHttpService: LocalHttpService,
        private httpClient: HttpClient,
        private _employeeService: EmployeeServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getNotes();
        this.getCurrentRole();
    }

    getCurrentRole() {
        this._employeeService.current()
            .subscribe(result => {
                this.isAllowedToEdit = result.employeeRole === EmployeeRole.ContractManager;
            });
    }

    saveNotes() {
        this.showMainSpinner();
        this._workflowServiceProxy.notesPut(this.workflowId, this.workflowNote.value)
            .pipe(finalize(() => this.hideMainSpinner() ))
            .subscribe(() => {
                this.workflowNoteOldValue = this.workflowNote.value;
                this.notesEditable = false;
            });
    }

    cancelNoteEdit() {
        this.notesEditable = false;
        this.workflowNote.setValue(this.workflowNoteOldValue);
    }

    getNotes() {
        this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this.httpClient.get(`${this.apiUrl}/api/Workflow/${this.workflowId}/notes`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${response.accessToken}`
                    }),
                    responseType: 'text'
                })
                .pipe(finalize(() => {}))
                .subscribe((result: any) => {
                    this.workflowNoteOldValue = result;
                    this.workflowNote.setValue(result);
                })
        });
    }

    showOrHideNotes() {
        this.isNoteVisible = !this.isNoteVisible;
        this.noteHidden.emit();
    }

}
