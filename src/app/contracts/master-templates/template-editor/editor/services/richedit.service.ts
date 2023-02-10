import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RicheditService {
	hasUnsavedChanges$ = new BehaviorSubject<boolean>(false);
	templateAsBase64$ = new BehaviorSubject<string>('');
	compareTemplateBlob$ = new BehaviorSubject<Blob>(null);
}
