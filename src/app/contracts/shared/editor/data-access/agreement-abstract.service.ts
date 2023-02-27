import { Observable } from "rxjs";
import { StringWrappedValueDto } from "src/shared/service-proxies/service-proxies";
import { IDocumentItem, IDocumentVersion } from "../entities";

export abstract class AgreementAbstractService {
    abstract getTemplate(id: number): Observable<Blob>;
	abstract getTemplateByVersion(id: number, version: number): Observable<Blob>;
	abstract saveAsDraftTemplate(id: number, fileContent: StringWrappedValueDto): void;
	abstract completeTemplate(id: number, fileContent: StringWrappedValueDto): void;
	abstract getSimpleList(): Observable<IDocumentItem[]>;
	abstract getTemplateVersions(id: number): Observable<IDocumentVersion[]>;
}