import { Component, OnInit, TrackByFunction, Injector, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { MappedAgreementTemplateDetailsAttachmentDto } from 'src/app/contracts/shared/components/file-uploader/files';
import { PREVIEW_SERVICE_PROVIDER, PREVIEW_SERVICE_TOKEN } from 'src/app/contracts/shared/services/preview-factory';
import { DownloadFile } from 'src/app/contracts/shared/utils/download-file';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AgreementDetailsAttachmentDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-attachments',
	templateUrl: './attachments.component.html',
	styleUrls: ['./attachments.component.scss'],
	providers: [PREVIEW_SERVICE_PROVIDER],
})
export class AttachmentsComponent extends AppComponentBase implements OnInit {
	attachments$: Observable<MappedAgreementTemplateDetailsAttachmentDto[]>;
	loading$: Observable<boolean>;

	mappedAttachments: MappedAgreementTemplateDetailsAttachmentDto[];

	trackById: TrackByFunction<string>;

	constructor(
		@Inject(PREVIEW_SERVICE_TOKEN) private readonly _previewService: BasePreview,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._setAttachmentObservable();
		this._setLoadingObservable();
		this.trackById = this.createTrackByFn('agreementTemplateAttachmentId');
	}

	downloadAttachment(file: AgreementDetailsAttachmentDto | MappedAgreementTemplateDetailsAttachmentDto): void {
		let attachmentId: number;
		if ('agreementTemplateAttachmentId' in file) {
			attachmentId = file.agreementTemplateAttachmentId;
		}
		if ('agreementAttachmentId' in file) {
			attachmentId = file.agreementAttachmentId;
		}
		this._previewService.downloadAttachment(attachmentId).subscribe((d) => DownloadFile(d as any, file.name));
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}

	private _setAttachmentObservable() {
		this.attachments$ = this._previewService.attachments$.pipe(
			map((attachments) => {
				return attachments?.map(
					(attachment) =>
						<MappedAgreementTemplateDetailsAttachmentDto>{
							...attachment,
							icon: this._getIconName(attachment.name as string),
						}
				) as MappedAgreementTemplateDetailsAttachmentDto[];
			})
		);
	}

	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}
}
