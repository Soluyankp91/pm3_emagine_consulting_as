import { Injector, TrackByFunction } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { Actions } from "src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.interfaces";
import { TenantList } from "src/app/workflow/workflow-sales/workflow-sales.model";
import { ISelectableIdNameDto } from "src/app/workflow/workflow.model";
import { environment } from "src/environments/environment";
import { AppConsts } from "./AppConsts";
import { API_BASE_URL, ContractDocumentInfoDto, CountryDto, EnumEntityTypeDto, IdNameDto } from "./service-proxies/service-proxies";

export enum NotifySeverity {
    Info = 1,
    Warning = 2,
    Success = 3,
    Error = 4
}

export abstract class AppComponentBase {
    apiUrl: string;
    spinnerService: NgxSpinnerService;
    matSnackbar: MatSnackBar;
    momentFormatType = AppConsts.momentFormatType;
    constructor(injector: Injector) {
        this.apiUrl = injector.get(API_BASE_URL);
        this.spinnerService = injector.get(NgxSpinnerService);
        this.matSnackbar = injector.get(MatSnackBar);
    }

    showNotify(severity: number, text: string, buttonText: string) {
        const className = this.mapSeverity(severity);
        this.matSnackbar.open(text, buttonText, { duration: 20000, panelClass: [className, 'general-snackbar'] });
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

    mapListByProperty(list: any[], prop: string) {
        if (list?.length) {
            return list.map(x =>  x[prop]).join(', ');
        } else {
            return '-';
        }
    }

    // form validations
    getValidationMessage(formControl: AbstractControl | null): string | string[] | undefined {
        if (formControl) {
            if (formControl.hasError('required')) {
                return 'This field is required';
            }
            if (formControl.hasError('email')) {
                return 'Email format is not correct';
            }
            if (formControl.hasError('pattern')) {
                return 'Entered format is not correct';
            }
            if (formControl.hasError('minlength')) {
                return `The maximum length is ${formControl.getError('minlength').requiredLength} characters`;
            }
            if (formControl.hasError('maxlength')) {
                return `The maximum length is ${formControl.getError('maxlength').requiredLength} characters`;
            }
            if (formControl.hasError('alphanumeric')) {
                return 'This field can only contain alphanumeric characters';
            }
            if (formControl.hasError('nonnumeric')) {
                return 'Couldn\'t contain numeric characters';
            }
            if (formControl.hasError('min')) {
                return `The minimum value is ${formControl.getError('min').min}`;
            }
            if (formControl.hasError('max')) {
                return `The maximum value is ${formControl.getError('max').max}`;
            }
            if (formControl.hasError('lowerThanStartYear')) {
                return 'This value cannot be lower than starting value';
            }
            if (formControl.hasError('optionNotSelected')) {
                return 'You need to select an option';
            }
        }
    }

    disableOrEnableInput(boolValue: boolean, control: AbstractControl | null | undefined) {
        if (boolValue) {
            // FIXME: do we need to clear input if it will be disabled ?
            control!.setValue(null, {emitEvent: false});
            control!.disable();
        } else {
            control!.enable();
        }
    }

    findItemById(list: EnumEntityTypeDto[] | IdNameDto[] | CountryDto[], id?: number | null) {
        if (id) {
            return list.find((x: any) => x.id === id);
        } else {
            return null;
        }
    }

    findItemByName(list: EnumEntityTypeDto[], name?: string) {
        if (name) {
            return list.find((x: any) => x.name === name);
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

    consultantProfileUrl(fileToken: string): string {
        if (!fileToken) {
            return 'assets/common/images/no-img.svg';
        }
        return `${environment.sharedAssets}/ProfilePicture/${fileToken}.jpg`;
    }

    employeeProfileUrl(fileToken: string): string {
        if (!fileToken) {
            return 'assets/common/images/no-img.svg';
        }
        return environment.sharedAssets + `/EmployeePicture/${fileToken}.jpg`;
    }

    deepLinkToSourcing(consultantId: number) {
        window.open(`${environment.sourcingUrl}/app/overview/consultants/consultant/${consultantId}`, '_blank');
    }
    openSupplierProfile(supplierId: number) {
        window.open(`${environment.sourcingUrl}/app/overview/suppliers/supplier/${supplierId}`, '_blank');
    }
    getTenantCodeFromId(tenantId: number) {
        const tenant = TenantList.find(x => x.id === tenantId);
        return tenant?.code;
    }

    toArray(enumme: { [key: string]: string; }) {
        let result: ISelectableIdNameDto[] = [];
        for (const key of Object.keys(enumme)) {
            result.push({ id: Number(key), name: enumme[key].replace(/[A-Z]/g, ' $&').trim(), selected: false });
        }
        return result;
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
    trackById(index: number, item: any) {
        return item.id;
    }

    documentsTrackBy(index: number, item: ContractDocumentInfoDto) {
        return item.documentStorageGuid;
    }

    displayConsultantNameFn(option: any) {
        return option?.consultant?.name;
    }

    displayNameFn(option: any) {
        return option?.name;
    }

    subtractMonthsFromDate(numOfMonths: number): moment.Moment {
        const date = moment();
        date.subtract(numOfMonths, 'months');
        return date;
    }
}
