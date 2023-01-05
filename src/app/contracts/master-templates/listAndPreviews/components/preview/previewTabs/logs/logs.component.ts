import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import * as moment from 'moment';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AgreementTemplateMetadataLogListItemDto, LogOperationType } from 'src/shared/service-proxies/service-proxies';

export type MappedLog = AgreementTemplateMetadataLogListItemDto & { profilePictureUrl: string; date: string; dayTime: string };
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
	@Input() set logs(logs: AgreementTemplateMetadataLogListItemDto[]) {
		this.mappedLogs = logs.map((log) => {
			return <MappedLog>{
				...log,
				date: moment(log.dateTime).format('DD.MM.YYYY'),
				dayTime: moment(log.dateTime).format('h:mm'),
				profilePictureUrl: this.employeeProfileUrl(log.employee?.externalId as string),
			};
		});
	}
	@Output() filterEmitter = new EventEmitter<boolean>();

	currentFilter = false;

	mappedLogs: MappedLog[];

	operationsTypeMap = OperationsTypeMap;

	constructor(private readonly _injector: Injector) {
		super(_injector);
	}

	emitFilter() {
		this.currentFilter = !this.currentFilter;
		this.filterEmitter.emit(this.currentFilter);
	}

	ngOnInit(): void {}
}
