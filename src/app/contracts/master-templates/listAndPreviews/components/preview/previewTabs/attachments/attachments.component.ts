import { Component, OnInit, TrackByFunction, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MappedAgreementTemplateDetailsAttachmentDto } from 'src/app/contracts/shared/components/file-uploader/files';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AgreementTemplateAttachmentServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { PreviewService } from '../../../../services/preview.service';

@Component({
	selector: 'app-attachments',
	templateUrl: './attachments.component.html',
	styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent extends AppComponentBase implements OnInit {
	attachments$: Observable<MappedAgreementTemplateDetailsAttachmentDto[]>;
	loading$: Observable<boolean>;

	mappedAttachments: MappedAgreementTemplateDetailsAttachmentDto[];

	trackById: TrackByFunction<string>;

	constructor(
		private readonly _agreementTemplateAttachmentServiceProxy: AgreementTemplateAttachmentServiceProxy,
		private readonly _previewService: PreviewService,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._setAttachmentObservable();
		this._setLoadingObservable();
		this.trackById = this.createTrackByFn('agreementTemplateAttachmentId');
	}

	downloadAttachment(file: MappedAgreementTemplateDetailsAttachmentDto): void {
		this._agreementTemplateAttachmentServiceProxy
			.agreementTemplateAttachment(file.agreementTemplateAttachmentId as number)
			.subscribe((d) => {
				const blob = new Blob([d as any]);
				const a = document.createElement('a');
				const objectUrl = URL.createObjectURL(blob);
				a.href = objectUrl;
				a.download = file.name as string;
				a.click();
				URL.revokeObjectURL(objectUrl);
			});
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
