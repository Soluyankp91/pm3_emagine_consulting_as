export interface IManagerTeamDisplay {
    team?: string;
    tenant?: string;
    division?: string;
    label?: 'Team' | 'Division' | 'Tenant' | ''
}

export const InitialManagerTeam: IManagerTeamDisplay = {
    team: '',
    tenant: '',
    division: '',
    label: 'Tenant'
}
