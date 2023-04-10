import { Component } from '@angular/core';
import { ACCEPTED_EXTENSIONS, EXISTED_ICONS } from '../file-uploader/files';
import { ReplaySubject } from 'rxjs';
import { FileParameter } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-default-file-uploader',
	templateUrl: './default-file-uploader.component.html',
	styleUrls: ['./default-file-uploader.component.scss'],
})
export class DefaultFileUploaderComponent {
	file$ = new ReplaySubject<FileParameter & { icon?: string }>(1);
	allowedExtensions = ACCEPTED_EXTENSIONS;

	constructor() {}

	onFileAdded($event: EventTarget) {
		let file = ($event as HTMLInputElement).files[0];
		this.file$.next({ data: file, icon: this._getIconName(file.name), fileName: file.name });
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
