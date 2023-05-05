import * as moment from 'moment';

export interface IUpdateData {
    eventName: string;
    args: SignalRArgs;
}

export interface SignalRArgs {
    authorName?: string;
    // actionType?: EActionTypes;
    // candidateId?: number;
    // count?: number;
    date?: moment.Moment;
}

export enum EActionTypes {
    // Default = 'The consultant has been updated',
    // EmailSent = 'The Email has been sent',
    // AddedToFinalCut = 'The consultant has been added to Final Cut',
    // ManyAddedToFinalCut = 'consultant has been added to Final Cut',
    // NewLinkedIn = 'The new Linkedin profile has been added',
}

// export enum ENotificationEventName {
//     NotifyAgreementEditing = 'NotifyAgreementEditing',
// }

export enum EActiveReloadEventNames {
    AgreementEditing = 'AgreementEditing',
}

export enum EActiveReloadMethodNames {
    NotifyAgreementEditing = 'NotifyAgreementEditing',
}

export enum EActiveReloadCallbackMethodNames {
    NotifyAgreementEditing = 'broadcastNotifyAgreementEditing',
}
