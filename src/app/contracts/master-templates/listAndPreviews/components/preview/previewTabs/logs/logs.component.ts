import { Component, OnInit, Injector } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AgreementTemplateMetadataLogListItemDto, LogOperationType } from 'src/shared/service-proxies/service-proxies';
import { PreviewService } from '../../../../services/preview.service';

export type MappedLog = AgreementTemplateMetadataLogListItemDto & {
	profilePictureUrl: string;
	date: string;
	dayTime: string;
};
export const OperationsTypeMap = {
	[LogOperationType.Create]: 'added',
	[LogOperationType.Update]: 'changed',
	[LogOperationType.Delete]: 'deleted',
};
@Component({
	selector: 'app-logs',
	templateUrl: './logs.component.html',
	styleUrls: ['./logs.component.scss'],
})
export class LogsComponent extends AppComponentBase implements OnInit {
	logs$: Observable<MappedLog[]>;
	loading$: Observable<boolean>;

	newestFirst = false;

	operationsTypeMap = OperationsTypeMap;

	constructor(private readonly _injector: Injector, private readonly _previewService: PreviewService) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initLogObservable();
		this._setLoadingObservable();
	}

	emitFilter() {
		this.newestFirst = !this.newestFirst;
		this._previewService.updateNewestFirst(this.newestFirst);
	}

	private _initLogObservable() {
		this.logs$ = this._previewService.logs$.pipe(
			map((logs) => {
				return logs.map(
					(log) =>
						<MappedLog>{
							...log,
							date: moment(log.dateTime).format('DD.MM.YYYY'),
							dayTime: moment(log.dateTime).format('h:mm'),
							profilePictureUrl: this.employeeProfileUrl(log.employee?.externalId as string),
						}
				);
			})
		);
	}
	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}
}
