import { Observable } from 'rxjs';
import { AgreementCommentDto, AgreementTemplateCommentDto } from 'src/shared/service-proxies/service-proxies';

export abstract class CommentsAbstractService {
	abstract getByTemplateID(
		agreementId: number,
		version: number
	): Observable<Array<AgreementCommentDto | AgreementTemplateCommentDto>>;
	abstract createComment(
		templateID: number,
		version: number,
		text: string,
		metadata: string,
		parentID?: number
	): Observable<number>;
	abstract deleteComment(commentID: number): Observable<any>;
	abstract editComment(commentID: number, text: string, metadata: string): Observable<any>;
	abstract updateMany(updates: Array<Pick<AgreementCommentDto, 'metadata' | 'id' | 'text'>>);
	abstract deleteMany(commentIDs: Array<number>);
}
