import { Observable } from 'rxjs';
import { AgreementCommentDto, AgreementTemplateCommentDto } from 'src/shared/service-proxies/service-proxies';

export abstract class CommentsAbstractService {
	abstract getByTemplateID(agreementId: number): Observable<Array<AgreementCommentDto | AgreementTemplateCommentDto>>;
	abstract createComment(templateID: number, version: number, message: string, parentID?: number): Observable<number>;
	abstract deleteComment(commentID: number): Observable<any>;
	abstract editComment(commentID: number, value: string): Observable<any>;
}
