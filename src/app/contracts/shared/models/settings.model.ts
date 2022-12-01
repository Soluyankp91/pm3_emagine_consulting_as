import {
    EnumEntityTypeDto,
    LegalEntityDto,
} from 'src/shared/service-proxies/service-proxies';
import { BaseEnumDto } from '../entities/contracts.interfaces';

export interface SettingsOptions {
    agreementTypes: BaseEnumDto[];
    recipientTypes: EnumEntityTypeDto[];
    legalEntities: LegalEntityDto[];
    salesTypes: EnumEntityTypeDto[];
    deliveryTypes: EnumEntityTypeDto[];
    contractTypes: EnumEntityTypeDto[];
    languages: BaseEnumDto[];
}
