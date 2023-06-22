import { Component, Injector, Input } from '@angular/core';
import { AppComponentBase } from 'src/shared/app-component-base';
import { TenantEnum } from './consultant-information.model';

@Component({
    selector: 'app-consultant-information',
    templateUrl: './consultant-information.component.html',
    styleUrls: ['./consultant-information.component.scss']
})
export class ConsultantInformationComponent extends AppComponentBase {
    @Input() consultantData: any;
    @Input() onlyAdditionalInfo: boolean;
    @Input() size: number;
    tenantEnum = TenantEnum;
    constructor(
        injector: Injector
    ) {
        super(injector);
    }
}
