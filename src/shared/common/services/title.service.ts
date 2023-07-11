import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppConsts } from 'src/shared/AppConsts';
import { ERouteTitleType } from 'src/shared/AppEnums';

@Injectable()
export class TitleService {
	constructor(private _titleService: Title) {}
	setTitle(routeType: ERouteTitleType, clientName?: string, workflowId?: string) {
		let title = AppConsts.PM3_TITLE;
		switch (routeType) {
			case ERouteTitleType.Overview:
				title = `${AppConsts.PM3_TITLE} • Overview`;
				break;
			case ERouteTitleType.WfList:
				title = `${AppConsts.PM3_TITLE} • Workflows`;
				break;
			case ERouteTitleType.WfDetails:
				title = `${AppConsts.PM3_TITLE} • WF #${workflowId} ${clientName?.length ? ' • ' + clientName : ''}`;
				break;
			case ERouteTitleType.ClientList:
				title = `${AppConsts.PM3_TITLE} • Client list`;
				break;
			case ERouteTitleType.ClientDetails:
				title = `${AppConsts.PM3_TITLE} • ${clientName}`;
				break;
			case ERouteTitleType.Contract:
				title = `${AppConsts.PM3_TITLE} • Contracts`;
				break;
			case ERouteTitleType.ContractAgreement:
				title = `${AppConsts.PM3_TITLE} • Contracts • Agreements`;
				break;
			case ERouteTitleType.ContractClientTemplates:
				title = `${AppConsts.PM3_TITLE} • Contracts • Client templates`;
				break;
			case ERouteTitleType.ContractMasterTemplates:
				title = `${AppConsts.PM3_TITLE} • Contracts • Master templates`;
				break;
			case ERouteTitleType.Notifications:
				title = `${AppConsts.PM3_TITLE} • Notifications`;
				break;
			case ERouteTitleType.POList:
				title = `${AppConsts.PM3_TITLE} • Purchase Orders`;
				break;
		}
		this._titleService.setTitle(title);
	}
}
