import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IDropdownItem } from 'src/app/contracts/shared/components/emagine-menu-multi-select/emagine-menu-multi-select.interfaces';
import { AgreementSimpleListItemDto, SimpleAgreementTemplatesListItemDto } from 'src/shared/service-proxies/service-proxies';

export type SignerOptions = {
	options$: Observable<[{ label: string; labelKey: string; outputProperty: string, isClient?: boolean}, IDropdownItem[]]> | null;
	optionsChanged$: Subject<string>;
};
export type ParentTemplateDto = {
	agreementTemplateId: string;
	currentVersion: string;
};
export type DuplicateOrParentOptions = {
	label: string;
    labelKey: string;
	formControlName: string;
	isDuplicate: boolean;
	outputProperty: string;
	options$: Observable<AgreementSimpleListItemDto[] | SimpleAgreementTemplatesListItemDto[] | undefined>;
	optionsChanged$: BehaviorSubject<string>;
	unwrapFunction?: (arg: ParentTemplateDto) => ParentTemplateDto;
};
