import { Injectable } from '@angular/core';
import {
	AgreementTemplateCommentDto,
	AgreementTemplateCommentServiceProxy,
	CommentInputDto,
	UpdateCommentInputDto,
} from 'src/shared/service-proxies/service-proxies';
import { CommentsAbstractService } from './comments-abstract.service';

@Injectable()
export class AgreementTemplateCommentsService implements CommentsAbstractService {
	constructor(private _commentProxyService: AgreementTemplateCommentServiceProxy) {}

	getByTemplateID(agreementId: number, version: number) {
		return this._commentProxyService.agreementTemplateCommentAll(agreementId, version);
	}

	createComment(templateID: number, version: number, text: string, metadata: string, parentID?: number) {
		const body = CommentInputDto.fromJS({ text, metadata });
		return this._commentProxyService.agreementTemplateCommentPUT(templateID, version, parentID || undefined, body);
	}

	editComment(commentID: number, text: string, metadata: string) {
		const body = CommentInputDto.fromJS({ text, metadata });
		return this._commentProxyService.agreementTemplateCommentPATCH(commentID, body);
	}

	deleteComment(commentID: number) {
		return this._commentProxyService.agreementTemplateCommentDELETE(commentID);
	}

	updateMany(updates: Array<Pick<AgreementTemplateCommentDto, 'metadata' | 'id' | 'text'>>) {
		let body = updates.map((update) => UpdateCommentInputDto.fromJS(update));
		return this._commentProxyService.bulkUpdate2(body);
	}

	deleteMany(commentIDs: Array<number>) {
		return this._commentProxyService.bulkDelete2(commentIDs);
	}
}
