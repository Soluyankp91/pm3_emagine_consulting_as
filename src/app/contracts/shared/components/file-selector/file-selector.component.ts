import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AgreementTemplateAttachmentServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { DownloadFile } from '../../utils/download-file';
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
export class FileSelectorComponent implements OnChanges, ControlValueAccessor {
	@Input() inheritedFiles: FileUpload[] = [];
	@Input() idProp = 'agreementTemplateAttachmentId';

	inheritedFilesModified: FileUploadItem[] = [];
	selectedInheritedFiles: FileUpload[] = [];

	private _onChange = (val: any) => {};
	private onTouched = () => {};

	constructor(private readonly _agreementTemplateAttachmentServiceProxy: AgreementTemplateAttachmentServiceProxy) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['inheritedFiles'] && !changes['inheritedFiles'].firstChange) {
			const inheritedFiles = changes['inheritedFiles'].currentValue as FileUpload[];
			this.inheritedFilesModified = inheritedFiles.map((file) => {
				return this._modifyFileUpload(file, false);
			});
		}
	}

	downloadAttachment(file: FileUploadItem): void {
		this._agreementTemplateAttachmentServiceProxy
			.agreementTemplateAttachment(file[this.idProp] as number)
			.subscribe((d) => DownloadFile(d as any, file.name));
	}

	toggleCheckBox(file: FileUploadItem) {
		file.selected = !file.selected;
		if (file.selected) {
			const originalFile = this._getOriginalFileById(file[this.idProp] as number);
			this.selectedInheritedFiles.push(originalFile);
		} else {
			this.selectedInheritedFiles.splice(
				this.selectedInheritedFiles.findIndex((selectedItem) => selectedItem[this.idProp] === file[this.idProp]),
				1
			);
		}

		this._onChange([...this.selectedInheritedFiles]);
	}

	writeValue(preSelectedFiles: FileUpload[]): void {
		this.selectedInheritedFiles = [];
		if (preSelectedFiles === null || !preSelectedFiles.length) {
			return;
		}
		preSelectedFiles.forEach((preselectedFile: FileUpload) => {
			let founded = this.inheritedFilesModified.find((f) => {
				return f[this.idProp] === preselectedFile[this.idProp];
			});
			if (founded) {
				founded.selected = true;
				const originalFile = this._getOriginalFileById(founded[this.idProp] as number);
				this.selectedInheritedFiles.push(originalFile);
			}
		});
		this._onChange([...this.selectedInheritedFiles]);
	}

	registerOnChange(fn: any): void {
		this._onChange = fn;
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
			(inheritedFile) => inheritedFile[this.idProp] === agreementTemplateAttachmentId
		) as FileUpload;
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}
}
