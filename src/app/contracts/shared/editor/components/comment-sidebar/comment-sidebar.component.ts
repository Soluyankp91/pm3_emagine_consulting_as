import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { DxButtonModule, DxDropDownButtonModule } from 'devextreme-angular';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';

import { CommentService } from '../../services';
import { SidebarViewMode } from '../../entities';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { AgreementCommentDto } from 'src/shared/service-proxies/service-proxies';

enum CommentEvents {
    Edit = 'Edit',
    Delete = 'Delete',
}

@Component({
    standalone: true,
    selector: 'app-comment-sidebar',
    templateUrl: './comment-sidebar.component.html',
    styleUrls: ['./comment-sidebar.component.scss'],
    imports: [
        NgIf,
        NgForOf,
        NgTemplateOutlet,
        ReactiveFormsModule,
        AsyncPipe,
        AppCommonModule,
        DxButtonModule,
        DxDropDownButtonModule,
        MatProgressSpinnerModule,
    ],
})
export class CommentSidebarComponent implements OnInit, OnDestroy {
    loading: boolean = false;

    displayedEntities$ = this._commentService.state$.pipe(
        map(({ comments, selected }) => {
            this.loading = false;
            let predicate = (cm: AgreementCommentDto) => selected.includes(cm.id);
            return selected.length ? comments.filter(predicate) : comments;
        })
    );

    @Output() created: EventEmitter<{ text: string; metadata: string }> = new EventEmitter();
    @Output() deleted: EventEmitter<number> = new EventEmitter();
    @Output() edited: EventEmitter<{ entityID: number; text: string; metadata: string }> = new EventEmitter();

    private _destroyed: Subject<void> = new Subject();
    private _selectedInterval: IntervalApi | null = null;

    viewMode = SidebarViewMode;
    commentEvents = CommentEvents;
    selectedViewMode: SidebarViewMode = SidebarViewMode.View;

    commentForm = new FormGroup({
        entity_id: new FormControl(null),
        message: new FormControl('', [Validators.required]),
    });

    constructor(private _commentService: CommentService) {}

    ngOnInit(): void {
        this._commentService.state$.pipe(takeUntil(this._destroyed)).subscribe((state) => {
            this.selectedViewMode = state.viewMode;
            this._selectedInterval = state.interval;
            this.loading = false;
        });
    }

    handleCommentClick(event, entity: AgreementCommentDto) {
        switch (event.itemData as CommentEvents) {
            case CommentEvents.Edit: {
                this.switchEditMode(entity);
                break;
            }
            case CommentEvents.Delete: {
                this.loading = true;
                this.deleted.emit(entity.id);
                break;
            }
        }
    }

    switchEditMode(entity: AgreementCommentDto) {
        this._commentService.state$.pipe(take(1)).subscribe(({ highlights }) => {
            let selected = highlights.find((hl) => hl.id === entity.id);
            this.commentForm.setValue({ entity_id: entity.id, message: entity.text });
            this._commentService.setInterval(selected ? selected.interval : null);
            this._commentService.setViewMode(SidebarViewMode.Edit);
        });
    }

    applyComment() {
        if (this.commentForm.valid) {
            let metadata = JSON.stringify(this._selectedInterval);
            let { entity_id, message } = this.commentForm.value;
            if (this.selectedViewMode === SidebarViewMode.Create) {
                this.loading = true;
                this.created.emit({ text: message, metadata });
            }

            if (this.selectedViewMode === SidebarViewMode.Edit) {
                this.loading = true;
                this.edited.emit({ text: message, metadata, entityID: entity_id });
            }
            this.commentForm.reset();
        }
    }

    cancelComment() {
        this.loading = false;
        this._commentService.cancelHighlightCreation();
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }
}
