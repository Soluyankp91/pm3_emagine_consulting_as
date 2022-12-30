import { BaseEnumDto } from '../../../../entities/contracts.interfaces';
import {
    CountryDto,
    EmployeeDto,
    EnumEntityTypeDto,
    LegalEntityDto,
} from 'src/shared/service-proxies/service-proxies';

export type TableFiltersEnum = {
    [key: string]:
        | CountryDto[]
        | BaseEnumDto[]
        | EnumEntityTypeDto[]
        | LegalEntityDto[]
        | EmployeeDto[]
        | BaseEnumDto [];
};
export interface Actions {
    label: string;
    actionType: string;
}
