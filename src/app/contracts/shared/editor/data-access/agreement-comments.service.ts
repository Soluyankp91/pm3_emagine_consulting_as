import { Injectable } from '@angular/core';
import {
	AgreementCommentServiceProxy,
	AgreementTemplateCommentDto,
	CommentInputDto,
	UpdateCommentInputDto,
} from 'src/shared/service-proxies/service-proxies';
import { CommentsAbstractService } from './comments-abstract.service';

@Injectable()
export class AgreementCommentsService implements CommentsAbstractService {
	constructor(private _commentProxyService: AgreementCommentServiceProxy) {}

	getByTemplateID(agreementId: number, version: number) {
		return this._commentProxyService.agreementCommentAll(agreementId, version);
	}

	createComment(templateID: number, version: number, text: string, metadata: string, parentID?: number) {
		const body = CommentInputDto.fromJS({ text, metadata });
		return this._commentProxyService.agreementCommentPUT(templateID, version, parentID || undefined, body);
	}

	editComment(commentID: number, text: string, metadata: string) {
		const body = CommentInputDto.fromJS({ text, metadata });
		return this._commentProxyService.agreementCommentPATCH(commentID, body);
	}

	updateMany(updates: Array<Pick<AgreementTemplateCommentDto, 'metadata' | 'id' | 'text'>>) {
		let body = updates.map((update) => UpdateCommentInputDto.fromJS(update));
		return this._commentProxyService.bulkUpdate(body);
	}

	deleteComment(commentID: number) {
		return this._commentProxyService.agreementCommentDELETE(commentID);
	}

	deleteMany(commentIDs: Array<number>) {
		return this._commentProxyService.bulkDelete(commentIDs);
	}
}
