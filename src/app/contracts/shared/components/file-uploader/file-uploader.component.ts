import { Component, OnInit, forwardRef } from '@angular/core';
import { FileServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileUploadItem } from './files';

@Component({
    selector: 'emg-file-uploader',
    templateUrl: './file-uploader.component.html',
    styleUrls: ['./file-uploader.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileUploaderComponent),
            multi: true,
        },
    ],
})
export class FileUploaderComponent implements OnInit, ControlValueAccessor {
    uploadedFiles$: Observable<FileUploadItem[]>;
    private _uploadedFiles$ = new Subject<FileUploadItem[]>();
    private files: FileUploadItem[] = [];

    private onChange = (val: any) => {};
    private onTouched = () => {};

    constructor(private readonly fileServiceProxy: FileServiceProxy) {}

    ngOnInit(): void {
        this.initializeFileObs();
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
        this.fileServiceProxy
            .temporaryDELETE(fileToDelete.temporaryFileId)
            .subscribe(() => {
                this.files = this.files.filter(
                    (file) =>
                        file.temporaryFileId !== fileToDelete.temporaryFileId
                );
                this._uploadedFiles$.next([]);
            });
    }

    writeValue(value: any): void {
        if (value === null) {
            this.files = [];
            this._uploadedFiles$.next([]);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private initializeFileObs() {
        this.uploadedFiles$ = this._uploadedFiles$.pipe(
            switchMap((files) => {
                let filesObservablesArr = files.map((file) =>
                    this.fileServiceProxy
                        .temporaryPOST({ data: file, fileName: file.name })
                        .pipe(
                            map(({ value }) => ({
                                ...file,
                                name: file.name,
                                temporaryFileId: value,
                                icon: this._getIconName(file.name),
                            }))
                        )
                );
                if (filesObservablesArr.length) {
                    return forkJoin(filesObservablesArr);
                }
                return of([]);
            }),
            map((files) => {
                this.files = [...this.files, ...files];
                return this.files;
            }),
            tap((files) => {
                if (files && files.length) {
                    this.onChange(files);
                    return;
                }
                this.onChange(null);
            })
        );
    }

    private _getIconName(fileName: string): string {
        let splittetFileName = fileName.split('.');
        return splittetFileName[splittetFileName.length - 1];
    }
}
