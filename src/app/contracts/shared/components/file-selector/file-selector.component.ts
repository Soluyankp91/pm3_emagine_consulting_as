import {
    Component,
    OnInit,
    forwardRef,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AgreementTemplateServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { FileUpload, FileUploadItem } from '../file-uploader/files';

@Component({
    selector: 'emg-file-selector',
    templateUrl: './file-selector.component.html',
    styleUrls: ['./file-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FileSelectorComponent),
            multi: true,
        },
    ],
})
export class FileSelectorComponent
    implements OnInit, OnChanges, ControlValueAccessor
{
    @Input() inheritedFiles: FileUpload[] = [];

    inheritedFilesModified: FileUploadItem[] = [];
    selectedInheritedFiles: FileUpload[] = [];

    private onChange = (val: any) => {};
    private onTouched = () => {};

    constructor(
        private readonly apiServiceProxy: AgreementTemplateServiceProxy
    ) {}

    ngOnInit(): void {}

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

    downloadAttachment(file: FileUploadItem): void {
        this.apiServiceProxy
            .agreementTemplateGET(file.agreementTemplateAttachmentId as number)
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

    toggleCheckBox(file: FileUploadItem) {
        file.selected = !file.selected;
        if (file.selected) {
            const originalFile = this._getOriginalFileById(
                file.agreementTemplateAttachmentId as number
            );
            this.selectedInheritedFiles.push(originalFile);
        } else {
            this.selectedInheritedFiles.splice(
                this.selectedInheritedFiles.findIndex(
                    (selectedItem) =>
                        selectedItem.agreementTemplateAttachmentId ===
                        file.agreementTemplateAttachmentId
                ),
                1
            );
        }

        this.onChange([...this.selectedInheritedFiles]);
    }

    writeValue(value: any): void {
        if (value === null) {
            this.inheritedFilesModified = [];
            this.selectedInheritedFiles = [];
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
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

    private _getOriginalFileById(agreementTemplateAttachmentId: number) {
        return this.inheritedFiles.find(
            (inheritedFile) =>
                inheritedFile.agreementTemplateAttachmentId ===
                agreementTemplateAttachmentId
        ) as FileUpload;
    }

    private _getIconName(fileName: string): string {
        let splittetFileName = fileName.split('.');
        return splittetFileName[splittetFileName.length - 1];
    }
}
