import { Injector } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from "src/environments/environment";
import { API_BASE_URL, CountryDto, EnumEntityTypeDto, IdNameDto } from "./service-proxies/service-proxies";

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

}
