import { Component, OnDestroy, OnInit, Self, TrackByFunction, Injector, ChangeDetectionStrategy } from '@angular/core';
import { FileServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Subject, Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap, takeUntil } from 'rxjs/operators';
import { NgControl } from '@angular/forms';
import { FileUploadItem } from './files';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
	selector: 'emg-file-uploader',
	templateUrl: './file-uploader.component.html',
	styleUrls: ['./file-uploader.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent extends AppComponentBase implements OnInit, OnDestroy {
	uploadedFiles$: Observable<FileUploadItem[]>;
	filesLoading$ = new BehaviorSubject<boolean>(false);

	trackById: TrackByFunction<string>;

	private _uploadedFiles$ = new Subject<FileUploadItem[]>();
	private _unSubscribe$ = new Subject<void>();
	private _files: FileUploadItem[] = [];

	private onChange = (val: any) => {};
	private onTouched = () => {};

	constructor(
		private readonly _fileServiceProxy: FileServiceProxy,
		@Self() private readonly _ngControl: NgControl,
		private readonly _injector: Injector
	) {
		super(_injector);
		_ngControl.valueAccessor = this;
		this.trackById = this.createTrackByFn('temporaryFileId');
	}

	ngOnInit(): void {
		this.initializeFileObs();
		this._subscribeOnLoading();
	}
	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onFileAdded($event: EventTarget | null) {
		if ($event) {
			let files = ($event as HTMLInputElement).files as FileList;
			const fileArray = [] as File[];
			for (let i = 0; i < files.length; i++) {
				fileArray.push(files.item(i) as File);
			}
			this._uploadedFiles$.next(fileArray);
		}
	}

	onFileDelete(fileToDelete: FileUploadItem) {
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
					this.onChange(files);
					return;
				}
				this.onChange([]);
			})
		);
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}

	private _clearAllFiles() {
		let observableArr: Observable<void>[] = [];
		this._files.forEach((file: FileUploadItem) => {
			observableArr.push(this._fileServiceProxy.temporaryDELETE(file.temporaryFileId));
		});
		this._files = [];
		this._uploadedFiles$.next([]);
		forkJoin(observableArr)
			.subscribe(() => {
				this._files = [];
				this._uploadedFiles$.next([]);
			});
	}
}
