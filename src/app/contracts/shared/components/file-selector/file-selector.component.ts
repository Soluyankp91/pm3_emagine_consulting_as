import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DownloadFilesService } from '../../services/download-files.service';
import { DownloadFile } from '../../utils/download-file';
import { EXISTED_ICONS, FileUpload, FileUploadItem } from '../file-uploader/files';

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
	@Input() label = 'From master template';
	@Input() idProp = 'agreementTemplateAttachmentId';
	@Input() preselectAll: boolean = false;

	inheritedFilesModified: FileUploadItem[] = [];
	selectedInheritedFiles: FileUpload[] = [];

	private _hasPendingChanges = false;
	private _onChange = (val: any) => {};
	private onTouched = () => {};

	constructor(private readonly _downloadFilesService: DownloadFilesService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['inheritedFiles'] && changes['inheritedFiles'].currentValue !== null) {
			this.selectedInheritedFiles = [];
			const inheritedFiles = changes['inheritedFiles'].currentValue as FileUpload[];

			this.inheritedFilesModified = inheritedFiles.map((file) => {
				return this._modifyFileUpload(file);
			});

			this.inheritedFilesModified.forEach((file) => {
				if (file.selected) {
					const originalFile = this._getOriginalFileById(file[this.idProp] as number);
					this.selectedInheritedFiles.push(originalFile);
				}
			});

			if (this.preselectAll) {
				this.inheritedFilesModified.forEach((file) => {
					file.selected = true;
					const originalFile = this._getOriginalFileById(file[this.idProp] as number);
					this.selectedInheritedFiles.push(originalFile);
				});

				// dirty update control value.
				setTimeout(() => {
					this._onChange([...this.selectedInheritedFiles]);
				});
			}
		}
	}

	downloadAttachment(file: FileUploadItem): void {
		this._downloadFilesService
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
		if (this.preselectAll) return;

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
	}

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	private _modifyFileUpload(file: FileUpload) {
		return Object.assign(
			{},
			{
				...file,
				name: file.name,
				icon: this._getIconName(file.name),
				selected: !this.preselectAll ? file.isSelected : false,
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
		if (EXISTED_ICONS.find((icon) => icon === splittetFileName[splittetFileName.length - 1].toLowerCase())) {
			return splittetFileName[splittetFileName.length - 1].toLowerCase();
		} else {
			return 'no-extension';
		}
	}
}
