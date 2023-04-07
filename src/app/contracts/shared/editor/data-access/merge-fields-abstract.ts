import { Observable } from "rxjs";
import { IMergeField } from "../entities";

export abstract class MergeFieldsAbstractService {
    abstract getMergeFields(templateId: number): Observable<IMergeField>
}