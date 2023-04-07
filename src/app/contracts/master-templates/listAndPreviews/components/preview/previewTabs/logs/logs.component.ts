import { Component, OnInit, Injector, Inject } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';
import { MappedLog, OperationsTypeMap } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { PREVIEW_SERVICE_PROVIDER, PREVIEW_SERVICE_TOKEN } from 'src/app/contracts/shared/services/preview-factory';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AgreementLogQueryResultDto, AgreementTemplateMetadataLogListItemDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-logs',
	templateUrl: './logs.component.html',
	styleUrls: ['./logs.component.scss'],
	providers: [PREVIEW_SERVICE_PROVIDER],
})
export class LogsComponent extends AppComponentBase implements OnInit {
	logs$: Observable<MappedLog[]>;
	loading$: Observable<boolean>;

	newestFirst = false;

	operationsTypeMap = OperationsTypeMap;

	constructor(
		private readonly _injector: Injector,
		@Inject(PREVIEW_SERVICE_TOKEN) private readonly _previewService: BasePreview
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initLogObservable();
		this._setLoadingObservable();
	}

	emitNewestFirst() {
		this.newestFirst = !this.newestFirst;
		this._previewService.updateNewestFirst(this.newestFirst);
	}

	private _initLogObservable() {
		this.logs$ = this._previewService.logs$.pipe(
			map((logs: AgreementTemplateMetadataLogListItemDto[] | AgreementLogQueryResultDto) => {
				return (logs instanceof AgreementLogQueryResultDto ? logs.metadataLogs : logs).map(
					(log) =>
						<MappedLog>{
							...log,
							date: log.dateTime,
							dayTime: moment(log.dateTime).format('h:mm'),
							profilePictureUrl: log.employee?.externalId as string
						}
				);
			})
		);
	}
	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}
}
