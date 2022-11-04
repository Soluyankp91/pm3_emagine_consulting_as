import { Component, OnInit, Injector, Input, Output, EventEmitter, ViewChild, OnDestroy, NgZone, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AppComponentBase } from 'src/shared/app-component-base';
import { finalize, takeUntil } from 'rxjs/operators';
import { EmployeeRole, EmployeeServiceProxy, WorkflowServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-workflow-notes',
    templateUrl: './workflow-notes.component.html',
    styleUrls: ['./workflow-notes.component.scss']
})
export class WorkflowNotesComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Input() topToolbarVisible: boolean;
    @Input() workflowId: string;
    @Input() alwaysVisible: boolean;
    @Output() noteHidden = new EventEmitter<any>();
    @ViewChild('notesContainer', {static: false}) notesContainer: ElementRef;
    notesEditable = false;
    isNoteVisible = false;
    isAllowedToEdit = false;

    height: string;

    workflowNote = new FormControl('', Validators.maxLength(4000));
    workflowNoteOldValue: string;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _workflowServiceProxy: WorkflowServiceProxy,
        private localHttpService: LocalHttpService,
        private httpClient: HttpClient,
        private _employeeService: EmployeeServiceProxy,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getNotes();
        this.getCurrentRole();
    }

    ngAfterViewInit(): void {
        this.scrollDispatcher.scrolled()
            .pipe(
                takeUntil(this._unsubscribe)
            )
            .subscribe((cdk: CdkScrollable | any) => {
                this.zone.run(() => {
                    const scrollPosition = cdk.getElementRef().nativeElement.scrollTop;
                    if (this.notesContainer) {
                        // if (scrollPosition < 115) { // 115 - header height
                            this.height = this.notesContainer.nativeElement.getBoundingClientRect().top;
                        // }
                    }
                });
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
