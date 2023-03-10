import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DxButtonModule, DxDropDownButtonModule } from 'devextreme-angular';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';

import { CommentService } from '../../services';
import { SidebarViewMode } from '../../entities';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { AgreementCommentDto } from 'src/shared/service-proxies/service-proxies';

type CommentEntityMap = Record<AgreementCommentDto['id'], AgreementCommentDto>;

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
	entityMap$: BehaviorSubject<CommentEntityMap> = new BehaviorSubject({});

	displayedEntities$ = combineLatest([this.entityMap$, this._commentService.state$]).pipe(
		map(([map, { selected }]) => selected.map((id) => map[id] || null).filter((i) => !!i))
	);

	@Input() set entities(list: AgreementCommentDto[] | null) {
		this.loading = false;
		this.entityMap$.next(this._mapEntityList(list));
	}

	@Output() created: EventEmitter<{ body: string; interval: IntervalApi }> = new EventEmitter();
	@Output() deleted: EventEmitter<number> = new EventEmitter();
	@Output() edited: EventEmitter<{ body: string; entityID: number }> = new EventEmitter();

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
		this.commentForm.setValue({ entity_id: entity.id, message: entity.text });
		this._commentService.setViewMode(SidebarViewMode.Edit);
	}

	applyComment() {
		if (this.commentForm.valid) {
			let { entity_id, message } = this.commentForm.value;
			if (this.selectedViewMode === SidebarViewMode.Create) {
				this.loading = true;
				this.created.emit({ body: message, interval: this._selectedInterval });
			}

			if (this.selectedViewMode === SidebarViewMode.Edit) {
				this.loading = true;
				this.edited.emit({ body: message, entityID: entity_id });
			}
		}
	}

	cancelComment() {
		this.loading = false;
		this._commentService.cancelCreatHighlight();
	}

	private _mapEntityList(list: AgreementCommentDto[]): CommentEntityMap {
		return (list || []).reduce((acc, item) => {
			return { ...acc, [item.id]: item };
		}, {});
	}

	ngOnDestroy(): void {
		this._destroyed.next();
		this._destroyed.complete();
	}
}
