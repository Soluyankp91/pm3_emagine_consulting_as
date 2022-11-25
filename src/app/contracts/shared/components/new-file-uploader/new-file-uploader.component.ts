import {
    Component,
    EventEmitter,
    Output,
    Input,
    forwardRef,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forkJoin, Subject, of } from 'rxjs';
import { map, switchMap, startWith, scan, tap } from 'rxjs/operators';
import {
    ApiServiceProxy,
    FileServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { FileUpload, FileUploadItem } from './new-file-uploader.interface';
@Component({
    selector: 'app-new-file-uploader',
    templateUrl: './new-file-uploader.component.html',
    styleUrls: ['./new-file-uploader.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NewFileUploaderComponent),
            multi: true,
        },
    ],
})
export class NewFileUploaderComponent
    implements ControlValueAccessor, OnChanges
{
    constructor(
        private fileServiceProxy: FileServiceProxy,
        private apiServiceProxy: ApiServiceProxy
    ) {}

    @Input() inheritedFiles: FileUpload[] = [];

    files: FileUploadItem[] = [];
    _uploadedFiles$ = new Subject<FileUpload[]>();
    uploadedFiles$ = this._uploadedFiles$.pipe(
        switchMap((files) => {
            if (!files.length) {
                return of([]);
            }
            let filesObservablesArr = files.map((file) => {
                return this.fileServiceProxy
                    .temporaryPost({ data: file, fileName: file.name })
                    .pipe(
                        map((temporaryFileId) => ({
                            ...file,
                            name: file.name,
                            temporaryFileId: temporaryFileId,
                        }))
                    );
            });
            return forkJoin(filesObservablesArr);
        }),
        startWith([]),
        scan((acc, current) => [...acc, ...current]),
        map((files) =>
            files
                .filter((file) => {
                    const isDeleted: boolean = !!this.deletedFiles.find(
                        (deletedFile) => deletedFile === file.temporaryFileId
                    );

                    return !isDeleted;
                })
                .map((file) => this._modifyFileUpload(file, true))
        ),
        tap((files) => {
            this.files = files;
            this.isFilesLoading = false;
            files.length ? this.onTouched() : null;
            this.onChange({
                selectedInheritedFiles: this._mapInheritedFile(
                    this.selectedInheritedFiles
                ),
                uploadedFiles: [...this.files],
            });
        })
    );

    isFilesLoading = false;
    selectedInheritedFiles: FileUpload[] = [];
    deletedFiles: string[] = [];

    inheritedFilesModified: FileUploadItem[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['inheritedFiles'] &&
            !changes['inheritedFiles'].firstChange
        ) {
            const inheritedFiles = changes['inheritedFiles']
                .currentValue as FileUpload[];
            this.inheritedFilesModified = inheritedFiles.map((file) => {
                return this._modifyFileUpload(file, false);
            });
        }
    }

    toggleCheckBox(file: FileUploadItem) {
        file.selected = !file.selected;
        if (file.selected) {
            const originalFile = this._getOriginalFileById(
                file.agreementTemplateAttachmentId as number
            );
            this.selectedInheritedFiles.push(originalFile);
            this.onChange({
                selectedInheritedFiles: [
                    ...this._mapInheritedFile(this.selectedInheritedFiles),
                ],
                uploadedFiles: [...this.files],
            });
        } else {
            this.selectedInheritedFiles.splice(
                this.selectedInheritedFiles.findIndex(
                    (selectedItem) =>
                        selectedItem.agreementTemplateAttachmentId ===
                        file.agreementTemplateAttachmentId
                ),
                1
            );
            this.onChange({
                selectedInheritedFiles: [
                    ...this._mapInheritedFile(this.selectedInheritedFiles),
                ],
                uploadedFiles: [...this.files],
            });
        }
    }

    onFileAdded($event: EventTarget | null) {
        if ($event) {
            this.isFilesLoading = true;
            let files = ($event as HTMLInputElement).files as FileList;
            const fileArray = [] as File[];
            for (let i = 0; i < files.length; i++) {
                fileArray.push(files.item(i) as File);
            }
            this._uploadedFiles$.next(fileArray);
        }
    }

    onFileDelete(file: FileUploadItem) {
        this.fileServiceProxy
            .temporaryDelete(file.temporaryFileId as string)
            .subscribe(() => {
                this.deletedFiles.push(file.temporaryFileId as string);
                this.files.splice(
                    this.files.findIndex(
                        (iteratedItem) =>
                            iteratedItem.temporaryFileId ===
                            file.temporaryFileId
                    ),
                    1
                );
                this._uploadedFiles$.next([]);
            });
    }

    downloadAttachment(file: FileUploadItem): void {
        this.apiServiceProxy
            .agreementTemplateAttachment(
                file.agreementTemplateAttachmentId as number
            )
            .subscribe((d) => {
                const blob = new Blob([d as any]);
                const a = document.createElement('a');
                const objectUrl = URL.createObjectURL(blob);
                a.href = objectUrl;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(objectUrl);
            });
    }

    private _modifyFileUpload(file: FileUpload, selected: boolean) {
        return Object.assign(
            {},
            {
                ...file,
                name: file.name,
                icon: this._getIconName(file.name),
                selected: selected,
            }
        ) as FileUploadItem;
    }

    private _getIconName(fileName: string): string {
        let splittetFileName = fileName.split('.');
        return splittetFileName[splittetFileName.length - 1];
    }

    private _getOriginalFileById(agreementTemplateAttachmentId: number) {
        return this.inheritedFiles.find(
            (inheritedFile) =>
                inheritedFile.agreementTemplateAttachmentId ===
                agreementTemplateAttachmentId
        ) as FileUpload;
    }

    private _mapInheritedFile(files: FileUpload[]) {
        return files.map((file) =>
            Object.assign(
                {},
                {
                    agreementTemplateAttachmentId:
                        file.agreementTemplateAttachmentId,
                    name: file.name,
                }
            )
        );
    }

    writeValue(files: { selectedInheritedFiles: []; uploadedFiles: [] }): void {
        this.selectedInheritedFiles = [];
        this.inheritedFiles = [];
        this.inheritedFilesModified = [];
        this.deletedFiles = [
            ...this.deletedFiles,
            ...this.files.map((file) => {
                return file.temporaryFileId;
            }),
        ] as string[];
        this.files = [];
        this._uploadedFiles$.next([]);
        this.inheritedFilesModified.forEach((file) => {
            file.selected = false;
        });
    }

    private onChange = (val: any) => {};
    private onTouched = () => {};
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
