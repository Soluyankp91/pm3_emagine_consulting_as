import { Injectable } from '@angular/core';
import { AgreementCommentServiceProxy, StringWrappedValueDto } from 'src/shared/service-proxies/service-proxies';
import { CommentsAbstractService } from './comments-abstract.service';

@Injectable()
export class AgreementCommentsService implements CommentsAbstractService {
	constructor(private _commentProxyService: AgreementCommentServiceProxy) {}

	getByTemplateID(agreementId: number) {
		return this._commentProxyService.agreementCommentAll(agreementId);
	}

	createComment(templateID: number, version: number, message: string, parentID?: number) {
		const body = StringWrappedValueDto.fromJS({ value: message });
		return this._commentProxyService.agreementCommentPUT(templateID, parentID || undefined, body);
	}

	deleteComment(commentID: number) {
		return this._commentProxyService.agreementCommentDELETE(commentID);
	}

	editComment(commentID: number, value: string) {
		const body = StringWrappedValueDto.fromJS({ value });
		return this._commentProxyService.agreementCommentPATCH(commentID, body);
	}
}
