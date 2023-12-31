import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	AgreementAuxiliaryAttachmentDto,
	AgreementAuxiliaryDetailsAttachmentDto,
	AgreementServiceProxy,
	SaveAgreementAuxiliaryDto,
} from 'src/shared/service-proxies/service-proxies';
import { CreationTitleService } from '../../shared/services/creation-title.service';

@Component({
	selector: 'app-archive',
	templateUrl: './archive.component.html',
	styleUrls: ['./archive.component.scss'],
})
export class ArchiveComponent extends AppComponentBase implements OnInit {
	currentAgreement: number;

	attachmentsLabel: string = 'Related documents';

	auxiliaryAttachments$: Observable<AgreementAuxiliaryDetailsAttachmentDto[]>;

	loadAttachments$ = new ReplaySubject();

	auxiliaryAttachmentsControl = new FormControl();

	get auxiliaryAttachmentsList() {
		return this.auxiliaryAttachmentsControl.value as AgreementAuxiliaryAttachmentDto[];
	}

	constructor(
		private readonly _agreementServiceProxy: AgreementServiceProxy,
		private readonly _route: ActivatedRoute,
		private readonly _location: Location,
		private readonly _agreementService: AgreementServiceProxy,
		private readonly _creationTitleService: CreationTitleService,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this.currentAgreement = parseInt(this._route.snapshot.params.id);

		this.auxiliaryAttachments$ = this.loadAttachments$.pipe(
			switchMap(() => this._agreementServiceProxy.auxiliaryGET(this.currentAgreement)),
			map((agreementAuxiliaryDetailsDto) => agreementAuxiliaryDetailsDto.auxiliaryAttachments),
			tap(() => {
				this.auxiliaryAttachmentsControl.reset();
				this.hideMainSpinner();
			})
		);
		this.loadAttachments$.next();

		this._agreementService
			.preview(this.currentAgreement)
			.pipe(
				map((agreement) => agreement.name),
				tap((name) => this._creationTitleService.updateTemplateName(name))
			)
			.subscribe();
	}

	saveAuxiliaryAttachment() {
		const toSend = this.auxiliaryAttachmentsList.map(
			(auxiliaryAttachment) => new AgreementAuxiliaryAttachmentDto(auxiliaryAttachment)
		);
		this.showMainSpinner();
		this._agreementServiceProxy
			.auxiliaryPATCH(this.currentAgreement, new SaveAgreementAuxiliaryDto({ auxiliaryAttachments: toSend }))
			.pipe(tap(() => this.loadAttachments$.next()))
			.subscribe();
	}

	navigateBack() {
		this._location.back();
	}
}
