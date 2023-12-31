import { Injector, TrackByFunction } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxSpinnerService } from "ngx-spinner";
import { TenantList } from "src/app/workflow/workflow-sales/workflow-sales.model";
import { ISelectableIdNameDto } from "src/app/workflow/workflow.model";
import { environment } from "src/environments/environment";
import { AppConsts } from "./AppConsts";
import { AgreementSimpleListItemDto, API_BASE_URL, ContractDocumentInfoDto, CountryDto, EnumEntityTypeDto, IdNameDto, PurchaseOrderQueryDto } from "./service-proxies/service-proxies";
import { EProfileImageLinkTypes } from "./AppEnums";
import { InternalLookupService } from "src/app/shared/common/internal-lookup.service";
import { MomentFormatPipe } from "./common/pipes/moment-format.pipe";

export enum NotifySeverity {
	Info = 1,
	Warning = 2,
	Success = 3,
	Error = 4,
}

export abstract class AppComponentBase {
    apiUrl: string;
    spinnerService: NgxSpinnerService;
    matSnackbar: MatSnackBar;
    momentFormatType = AppConsts.momentFormatType;
    consultantPhotoUrl = AppConsts.consultantPhotoUrl;
    employeePhotoUrl = AppConsts.employeePhotoUrl;
    imageType = EProfileImageLinkTypes;
    internalLookupService: InternalLookupService;
    constructor(injector: Injector) {
        this.apiUrl = injector.get(API_BASE_URL);
        this.spinnerService = injector.get(NgxSpinnerService);
        this.matSnackbar = injector.get(MatSnackBar);
        this.internalLookupService = injector.get(InternalLookupService);
    }

	showNotify(severity: number, text: string, buttonText: string = '') {
		const className = this.mapSeverity(severity);
		this.matSnackbar.open(text, buttonText, { duration: 3000, panelClass: [className, 'general-snackbar'] });
	}

	mapSeverity(severity: number) {
		switch (severity) {
			case NotifySeverity.Info:
				return 'general-snackbar-info';
			case NotifySeverity.Warning:
				return 'general-snackbar-warning';
			case NotifySeverity.Success:
				return 'general-snackbar-success';
			case NotifySeverity.Error:
				return 'general-snackbar-error';
			default:
				return '';
		}
	}


	disableOrEnableInput(boolValue: boolean, control: AbstractControl | null | undefined) {
		if (boolValue) {
			control!.setValue(null, { emitEvent: false });
			control!.disable();
		} else {
			control!.enable();
		}
	}

    setValueAndToggleDisalbeState(disableControl: boolean, control: AbstractControl | null | undefined, value: any) {
		if (disableControl) {
			control!.disable();
			control!.setValue(value, { emitEvent: false });
		} else {
			control!.enable();
		}
	}

    getCountryCodeByTenantName(name: string) {
		switch (name) {
			case 'Denmark':
				return 'DK';
			case 'Netherlands':
				return 'NL';
			case 'United Kingdom':
				return 'GB';
			case 'France':
				return 'FR';
            case 'Germany':
                return 'DE';
            case 'India':
                return 'IN';
            case 'Norway':
                return 'NO';
            case 'Poland':
                return 'PL';
			case 'Sweden':
				return 'SE';
			default:
				break;
		}
	}

	findItemById(list: EnumEntityTypeDto[] | IdNameDto[] | CountryDto[], id?: number | null) {
		if (id) {
			return list?.find((x: any) => x?.id === id);
		} else {
			return null;
		}
	}

	findItemByName(list: EnumEntityTypeDto[], name?: string) {
		if (name) {
			return list?.find((x: any) => x?.name === name);
		} else {
			return null;
		}
	}

	showMainSpinner(): void {
		this.spinnerService.show();
	}

	hideMainSpinner(): void {
		this.spinnerService.hide();
	}

	deepLinkToSourcing(consultantId: number) {
        window.open(`${environment.sourcingUrl}/overview/consultants?consultant=${consultantId}`, '_blank');
	}

	openSupplierProfile(supplierId: number) {
        window.open(`${environment.sourcingUrl}/suppliers?supplier=${supplierId}`, '_blank');
	}

    openCategoryCheatSheet() {
        window.open(`${environment.sourcingUrl}/entity-editor/wizard-roles`, '_blank');
    }

	getTenantCodeFromId(tenantId: number) {
		const tenant = TenantList.find((x) => x.id === tenantId);
		return tenant?.code;
	}

	toArray(enumme: { [key: string]: string }) {
		let result: ISelectableIdNameDto[] = [];
		for (const key of Object.keys(enumme)) {
			result.push({ id: Number(key), name: enumme[key].replace(/[A-Z]/g, ' $&').trim(), selected: false });
		}
		return result;
	}

    setDefaultImage(target: EventTarget | null) {
        (target as HTMLImageElement).src = '../assets/common/images/no-img.jpg';
    }

	/** Function to create your own custom trackBy
	 *  In cases where basic trackByFn cannot be used and you need specific property in comparator.
	 *
	 * @param key     Key to be used in comparator
	 * @returns       trackBy function
	 */
	createTrackByFn<T>(key: keyof T): TrackByFunction<T> {
		return (index: number, value: T) => value[key];
	}

	// TODO: move all others trackBy methods here
    trackByKey(index: number, item: any) {
		return item.key;
	}

	trackById(index: number, item: any) {
		return item?.id;
	}

    trackByAgreementId(index: number, item: any) {
		return item?.agreementId;
	}

	documentsTrackBy(index: number, item: ContractDocumentInfoDto) {
		return item?.documentStorageGuid;
	}

    trackByItem(index: number, item: any) {
        return item;
    }

	displayConsultantNameFn(option: any) {
		return option?.consultant?.name;
	}

	displayNameFn(option: any) {
		return option?.name;
	}

	displayFullNameFn(option: any) {
		return option ? option?.firstName + ' ' + option?.lastName : '';
	}

	displayClientNameFn(option: any) {
		return option?.clientName?.trim();
	}

	displayRecipientFn(option: any) {
		if (option?.name) {
			return option?.name;
		} else if (option?.clientName) {
			return option?.clientName;
		} else if (option?.supplierName) {
			return option?.supplierName;
		}
	}

    displayAgreementNameFn(option: AgreementSimpleListItemDto) {
        if (option?.agreementId) {
            let momentFormatPipe = new MomentFormatPipe();
            return `${option?.agreementName}, ${option?.countryName} ${option?.countryName ? '•' : ''} ${momentFormatPipe.transform(option?.startDate)} ${option?.startDate !== null && option?.startDate !== undefined ? '-' : ''} ${momentFormatPipe.transform(option?.endDate)}`;
        } else {
            return '';
        }
    }

    displayPOFn(option: PurchaseOrderQueryDto) {
		return option?.number;
	}

	compareWithFn(listOfItems: any, selectedItem: any) {
		return listOfItems && selectedItem && listOfItems.id === selectedItem.id;
	}

    focusToggleMethod(overflowStyle: string) {
		let b = document.getElementsByTagName('mat-drawer-content')[0] as HTMLElement;
		b.style.overflow = overflowStyle;
	}

    onAutocompleteClosed(control: AbstractControl | null | undefined, idValue: string) {
        if (!control.value?.[idValue]) {
            control.setValue('');
        }
        this.focusToggleMethod('auto');
    }

    arrayToEnum(list: EnumEntityTypeDto[]) {
        let result: { [key: number]: string} = {};
        list.forEach(x => {
            result[x.id] = x.name
        });
        return result;
    }

    getStaticEnumValue(key: string): any {
        return this.internalLookupService.getEnumValue(key);
    }

}
