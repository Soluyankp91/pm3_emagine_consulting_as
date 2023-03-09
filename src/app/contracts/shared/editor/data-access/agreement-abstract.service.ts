import { Observable } from "rxjs";
import { CompleteTemplateDocumentFileDraftDto, StringWrappedValueDto } from "src/shared/service-proxies/service-proxies";
import { IDocumentItem, IDocumentVersion } from "../entities";

export abstract class AgreementAbstractService {
    abstract getTemplate(id: number, isComplete?: boolean): Observable<Blob>;
	abstract getTemplateByVersion(id: number, version: number): Observable<Blob>;
	abstract saveCurrentAsDraftTemplate(id: number, force: boolean, fileContent: StringWrappedValueDto): Observable<any>;
	abstract saveCurrentAsCompleteTemplate(id: number, fileContent: CompleteTemplateDocumentFileDraftDto): Observable<any>;
	abstract saveDraftAsDraftTemplate(id: number, force: boolean, fileContent: StringWrappedValueDto): Observable<any>;
	abstract saveDraftAsCompleteTemplate(id: number, fileContent: CompleteTemplateDocumentFileDraftDto): Observable<any>;
	abstract saveDraftAndCompleteTemplate(id: number, fileContent: StringWrappedValueDto, selectedDocument: IDocumentItem, versions: IDocumentVersion[]): Observable<any>;
	abstract getSimpleList(): Observable<IDocumentItem[]>;
	abstract getTemplateVersions(id: number): Observable<IDocumentVersion[]>;
	abstract getTemplatePDF(id: number): Observable<Blob>;
}