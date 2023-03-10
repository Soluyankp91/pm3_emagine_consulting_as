import { Injectable } from '@angular/core';
import { AgreementTemplateCommentServiceProxy, StringWrappedValueDto } from 'src/shared/service-proxies/service-proxies';
import { CommentsAbstractService } from './comments-abstract.service';

@Injectable()
export class AgreementTemplateCommentsService implements CommentsAbstractService {
	constructor(private _commentProxyService: AgreementTemplateCommentServiceProxy) {}

	getByTemplateID(agreementId: number) {
		return this._commentProxyService.agreementTemplateCommentAll(agreementId);
	}

	createComment(templateID: number, version: number, message: string, parentID?: number) {
		const body = StringWrappedValueDto.fromJS({ value: message });
		return this._commentProxyService.agreementTemplateCommentPUT(templateID, parentID || undefined, body);
	}

	deleteComment(commentID: number) {
		return this._commentProxyService.agreementTemplateCommentDELETE(commentID);
	}

	editComment(commentID: number, value: string) {
		const body = StringWrappedValueDto.fromJS({ value });
		return this._commentProxyService.agreementTemplateCommentPATCH(commentID, body);
	}
}
