import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, Injector, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { WorkflowDocuments } from './workflow-documents.model';

@Component({
    selector: 'app-workflow-documents',
    templateUrl: './workflow-documents.component.html',
    styleUrls: ['./workflow-documents.component.scss']
})
export class WorkflowDocumentsComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('documentsContainer', {static: false}) documentsContainer: ElementRef;
    @Input() topToolbarVisible: boolean;
    @Input() workflowId: string;
    @Input() alwaysVisible: boolean;

    variableHasResponse = true;
    height: string;
    workflowDocuments = WorkflowDocuments;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone

    ) {
        super(injector);
     }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.scrollDispatcher.scrolled()
            .pipe(
                takeUntil(this._unsubscribe)
            )
            .subscribe(() => {
                this.zone.run(() => {
                    if (this.documentsContainer) {
                        this.height = this.documentsContainer.nativeElement.getBoundingClientRect().top;
                    }
                });
            });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    downloadDocument(){}
    removeDocument(){}
}
