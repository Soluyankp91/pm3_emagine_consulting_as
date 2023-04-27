import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Observable, ReplaySubject} from 'rxjs';
import { take, switchMap, publishReplay, refCount} from 'rxjs/operators';
import { AgreementServiceProxy, AgreementStatusHistoryDto, EnvelopeStatus } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-agreement-logs',
	templateUrl: './agreement-logs.component.html',
	styleUrls: ['./agreement-logs.component.scss'],
})
export class AgreementLogsComponent implements OnChanges {
  @Input() agreementStatus: EnvelopeStatus;
  @Input() agreementId: number;

	statuses: Observable<AgreementStatusHistoryDto[]>;

	constructor(private readonly _agreementServiceProxy: AgreementServiceProxy) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['agreementId'] && changes['agreementId'].currentValue) {
			this.statuses =  this._agreementServiceProxy.statusHistory(this.agreementId).pipe(publishReplay(1), refCount());
		}
	}
}
