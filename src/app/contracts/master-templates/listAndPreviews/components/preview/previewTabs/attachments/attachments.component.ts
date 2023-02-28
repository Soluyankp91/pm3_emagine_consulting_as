import { Component, OnInit, TrackByFunction, Injector, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import {
	AttachmentPreview,
	MappedAgreementTemplateDetailsAttachmentDto,
} from 'src/app/contracts/shared/components/file-uploader/files';
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
	attachments$: Observable<AttachmentPreview>;
	loading$: Observable<boolean>;

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

	downloadParentAttachment(file: MappedAgreementTemplateDetailsAttachmentDto): void {
		this._previewService
			.downloadTemplateAttachment(file.agreementTemplateAttachmentId)
			.subscribe((d) => DownloadFile(d as any, file.name));
	}

	downloadAttachment(file: AgreementDetailsAttachmentDto | MappedAgreementTemplateDetailsAttachmentDto): void {
		if ('agreementTemplateAttachmentId' in file) {
			this._previewService
				.downloadTemplateAttachment(file.agreementTemplateAttachmentId)
				.subscribe((d) => DownloadFile(d as any, file.name));
		}
		if ('agreementAttachmentId' in file) {
			this._previewService
				.downloadAgreementAttachment(file.agreementAttachmentId)
				.subscribe((d) => DownloadFile(d as any, file.name));
		}
	}

	private _getIconName(fileName: string): string {
		let splittetFileName = fileName.split('.');
		return splittetFileName[splittetFileName.length - 1];
	}

	private _setAttachmentObservable() {
		this.attachments$ = this._previewService.attachments$.pipe(
			map(({ attachments, attachmentsFromParent }) => {
				return {
					attachments: this._mapAttachments(attachments),
					attachmentsFromParent: this._mapAttachments(attachmentsFromParent),
				};
			})
		);
	}

	private _mapAttachments(attachments: any[]) {
		return attachments?.map(
			(attachment) =>
				<MappedAgreementTemplateDetailsAttachmentDto>{
					...attachment,
					icon: this._getIconName(attachment.name as string),
				}
		);
	}
	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}
}
