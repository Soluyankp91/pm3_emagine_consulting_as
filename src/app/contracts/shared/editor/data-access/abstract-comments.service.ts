import { Observable } from "rxjs";

export abstract class CommentsAbstractService {
    abstract getComments(templateId: number, docVersion: number): Observable<any[]>;
    abstract updateComment(templateId: number, docVersion: number): Observable<{}>;
    abstract deleteComment(commentId: number): Observable<any>
}