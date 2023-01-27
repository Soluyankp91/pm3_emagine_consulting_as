import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IDropdownItem } from 'src/app/contracts/shared/components/emagine-menu-multi-select/emagine-menu-multi-select.interfaces';
import { AgreementSimpleListItemDto, SimpleAgreementTemplatesListItemDto } from 'src/shared/service-proxies/service-proxies';

export type SignerOptions = {
	options$: Observable<[{ label: string; labelKey: string; outputProperty: string }, IDropdownItem[]]> | null;
	optionsChanged$: Subject<string>;
};
export type InputParentTemplate = {
	agreementTemplateId: string;
	currentVersion: string;
};
export type OutputParentTemplate = {
	parentAgreementTemplateId: string;
	parentAgreementTemplateVersion: string;
};
export type DuplicateOrParentOptions = {
	label: string;
	formControlName: string;
	labelKey: string;
	outputProperty: string;
	options$: Observable<AgreementSimpleListItemDto[] | SimpleAgreementTemplatesListItemDto[] | undefined>;
	optionsChanged$: BehaviorSubject<string>;
	unwrapFunction?: (arg: InputParentTemplate) => OutputParentTemplate;
};
