import {
	Component,
	OnDestroy,
	OnInit,
	Self,
	TrackByFunction,
	Injector,
	ChangeDetectionStrategy,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { FileServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Subject, Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap, takeUntil } from 'rxjs/operators';
import { NgControl } from '@angular/forms';
import { ACCEPTED_EXTENSIONS, ALLOWED_MIME_TYPES, EXISTED_ICONS, FileUpload, FileUploadItem } from './files';
import { AppComponentBase } from 'src/shared/app-component-base';
import { DownloadFile } from '../../utils/download-file';
import { DownloadFilesService } from '../../services/download-files.service';

@Component({
	selector: 'emg-file-uploader',
	templateUrl: './file-uploader.component.html',
	styleUrls: ['./file-uploader.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent extends AppComponentBase implements OnInit, OnChanges, OnDestroy {
	@Input() preselectedFiles: FileUpload[];
	@Input() label: string = 'Current master template';
	@Input() idProp = 'agreementTemplateAttachmentId';

	allowedExtensions = ACCEPTED_EXTENSIONS;
	preselectedFilesModified: FileUploadItem[];
	uploadedFiles$: Observable<FileUploadItem[]>;
	filesLoading$ = new BehaviorSubject<boolean>(false);

	trackByTemporaryFileId: TrackByFunction<string>;
	trackByAgreementTemplateAttachmentId: TrackByFunction<string>;

	private _uploadedFiles$ = new Subject<FileUploadItem[]>();
	private _unSubscribe$ = new Subject<void>();
	private _files: FileUploadItem[] = [];

	private onChange = (val: any) => {};
	private onTouched = () => {};

	get uploadedFilesLength() {
		return this._files.length;
	}

	constructor(
		private readonly _fileServiceProxy: FileServiceProxy,
		private readonly _downloadFilesService: DownloadFilesService,
		@Self() private readonly _ngControl: NgControl,
		private readonly _injector: Injector
	) {
		super(_injector);
		_ngControl.valueAccessor = this;
		this.trackByTemporaryFileId = this.createTrackByFn('temporaryFileId');
		this.trackByAgreementTemplateAttachmentId = this.createTrackByFn('trackByAgreementTemplateAttachmentId');
	}

	ngOnInit(): void {
		this.initializeFileObs();
		this._subscribeOnLoading();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['preselectedFiles'].currentValue) {
			this._setPreselectedFilesModified();
		}
	}
	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	downloadAttachment(file: FileUploadItem): void {
		if (this.idProp === 'agreementTemplateAttachmentId') {
			this._downloadFilesService
				.agreementTemplateAttachment(file.agreementTemplateAttachmentId)
				.subscribe((d) => DownloadFile(d as any, file.name));
		}
		if (this.idProp === 'agreementAttachmentId') {
			this._downloadFilesService
				.agreementAttachment(file.agreementAttachmentId)
				.subscribe((d) => DownloadFile(d as any, file.name));
		}
	}

	onFileAdded($event: EventTarget | null) {
		if ($event) {
			let files = ($event as HTMLInputElement).files as FileList;
			const fileArray = [] as File[];
			for (let i = 0; i < files.length; i++) {
				if (!ALLOWED_MIME_TYPES.some((mimeType) => mimeType.toLowerCase() === files[i].type.toLowerCase())) {
					continue;
				}
				fileArray.push(files.item(i) as File);
			}
			this._uploadedFiles$.next(fileArray);
		}
	}

	onPreselectedFileDelete(preselectedFile: FileUploadItem) {
		this.preselectedFiles.splice(
			this.preselectedFiles.findIndex((file) => file[this.idProp] === preselectedFile[this.idProp]),
			1
		);
		this._setPreselectedFilesModified();
	}

	onUploadedFileDelete(fileToDelete: FileUploadItem) {
		this._fileServiceProxy.temporaryDELETE(fileToDelete.temporaryFileId).subscribe(() => {
			this._files = this._files.filter((file) => file.temporaryFileId !== fileToDelete.temporaryFileId);
			this._uploadedFiles$.next([]);
		});
	}

	writeValue(value: any): void {
		if (!value || !value.length) {
			this._clearAllFiles();
		}
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	private _setPreselectedFilesModified() {
		this.preselectedFilesModified = this.preselectedFiles.map((file) => ({
			...file,
			name: file.name,
			icon: this._getIconName(file.name),
		}));
		this.onChange([...this.preselectedFiles, ...this._files]);
	}

	private _subscribeOnLoading() {
		this.filesLoading$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this._ngControl.control.setErrors({ loading: true });
			} else {
				this._ngControl.control.setErrors(null);
			}
		});
	}

	private initializeFileObs() {
		this.uploadedFiles$ = this._uploadedFiles$.pipe(
			switchMap((files) => {
				if (!files.length) {
					return of([]);
				}
				let filesObservablesArr = files.map((file) =>
					this._fileServiceProxy.temporaryPOST({ data: file, fileName: file.name }).pipe(
						map(({ value }) => ({
							...file,
							name: file.name,
							temporaryFileId: value,
							icon: this._getIconName(file.name),
						}))
					)
				);
				this.filesLoading$.next(true);
				return forkJoin(filesObservablesArr);
			}),
			tap(() => {
				this.filesLoading$.next(false);
			}),
			map((files) => {
				this._files = [...this._files, ...files];
				return this._files;
			}),
			tap((files) => {
				if (files.length) {
					this.onChange([...this.preselectedFiles, ...files]);
					return;
				}
				this.onChange([...this.preselectedFiles]);
			})
		);
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		if (EXISTED_ICONS.find((icon) => icon === splittetFileName[splittetFileName.length - 1].toLowerCase())) {
			return splittetFileName[splittetFileName.length - 1].toLowerCase();
		} else {
			return 'no-extension';
		}
	}

	private _clearAllFiles() {
		let observableArr: Observable<void>[] = [];
		this._files.forEach((file: FileUploadItem) => {
			observableArr.push(this._fileServiceProxy.temporaryDELETE(file.temporaryFileId));
		});
		this._files = [];
		this._uploadedFiles$.next([]);

		forkJoin(observableArr).subscribe();
	}
}
