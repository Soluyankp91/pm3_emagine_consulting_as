import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';

// Project Specific
import { EditorService } from './_api/editor.service';
import { RicheditComponent } from './components/richedit/richedit.component';
import { MergeFieldsService } from './_api/merge-fields.service';
import { RicheditService } from './services/richedit.service';
import { IDocumentVersion } from './types';

@Component({
	standalone: true,
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	imports: [
		CommonModule,

		// components
		RicheditComponent,
	],
	providers: [EditorService, MergeFieldsService, RicheditService],
})
export class EditorComponent implements OnInit, OnDestroy {
	_destroy$ = new Subject();
	templateId: number | undefined;
	template$ = new BehaviorSubject<File | Blob | ArrayBuffer | string>(null);
	templateVersions$ = new BehaviorSubject<Array<IDocumentVersion>>([]);
	mergeFields$ = this._mergeFieldsService.getMergeFields(this._route.snapshot.params.id);

	docReady$ = combineLatest([this.template$, this.mergeFields$]).pipe(filter((res) => !!res[0] && !!res[1]));

	isLoading$ = new Subject();
	hasUnsavedChanges$ = this._richeditService.hasUnsavedChanges$;

	@ViewChild(RicheditComponent) richEdit: RicheditComponent;

	constructor(
		private _editorService: EditorService,
		private _richeditService: RicheditService,
		private _mergeFieldsService: MergeFieldsService,
		private _route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.templateId = this._route.snapshot.params.id;
		this._editorService.getFileVersion(this.templateId, 1).subscribe(console.log);
		this._editorService.getSimpleList().subscribe(console.log);

		this._editorService
			.getTemplate(this.templateId)
			.pipe(tap((template) => this.template$.next(template)))
			.subscribe(
				() => {},
				() => {
					this.template$.next(this._editorService.getTemplateMock());
				}
			);

		this._editorService.getTemplateVersions(this.templateId).subscribe((res) => {
			this.templateVersions$.next(res || []);
		});
	}

	saveAsDraft() {
		this.isLoading$.next(true);
		this.richEdit.setTemplateAsBase64();

		this.richEdit.templateAsBase64$
			.pipe(
				filter((res) => !!res),
				take(1)
			)
			.subscribe((base64) => {
				this._editorService
					.saveAsDraftTemplate(this.templateId, { value: base64 })
					.subscribe(() => {
						this.richEdit.setAsSaved();
						this.isLoading$.next(false);
					});
			});
	}

	saveAsComplete() {
		this.isLoading$.next(true);
		this.richEdit.setTemplateAsBase64();

		this.richEdit.templateAsBase64$
			.pipe(
				filter((res) => !!res),
				take(1)
			)
			.subscribe((base64) => {
				this._editorService
					.completeTemplate(this.templateId, { value: base64 })
					.subscribe(() => {
						this.richEdit.setAsSaved();
						this.isLoading$.next(false);
					});
			});
	}

	ngOnDestroy(): void {
		this._destroy$.complete();
	}
}
