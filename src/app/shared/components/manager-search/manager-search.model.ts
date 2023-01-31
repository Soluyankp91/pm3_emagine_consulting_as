export enum ManagerSearchType {
    ContractManager = 1,
    SalesManages = 2,
    AccountManager = 3
}

export enum ManagerStatus {
    Upcoming = 1,
    Pending = 2,
    Completed = 3,
}

export enum EManagerStatusIcon {
    'upcoming-icon' = ManagerStatus.Upcoming,
    'in-progress-icon' = ManagerStatus.Pending,
    'completed-icon'= ManagerStatus.Completed
}
