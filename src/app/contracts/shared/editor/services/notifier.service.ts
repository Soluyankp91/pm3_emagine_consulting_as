import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum NotificationType {
	Noop,
	SavingChanges,
	ChangesSaved,
	ChangesNotSavedYet,
	VersionBeingCreated,
	VersionCreatedSuccess,
	EnvelopeBeingVoided,
	EnvelopeVoidedSuccess,
	SavingAsADraft,
	DraftSavedSuccess,
	SentSuccessfully,
	SendingInProgress,
}

export interface Notification {
	text: string;
	icon: string;
	type: 'success' | 'warning' | 'pending';
	id: NotificationType;
}

@Injectable()
export class NotifierService {
	private _prevState: Notification | null = null;
	private _notification$$: BehaviorSubject<Notification> = new BehaviorSubject(null);

	public readonly notification$ = this._notification$$.asObservable();

	constructor() {}

	public notify(type: NotificationType.SentSuccessfully, params: { filename: string });
	public notify(
		type:
			| NotificationType.SendingInProgress
			| NotificationType.ChangesSaved
			| NotificationType.ChangesNotSavedYet
			| NotificationType.SavingChanges
			| NotificationType.Noop
	);
	public notify(
		type:
			| NotificationType.VersionBeingCreated
			| NotificationType.VersionCreatedSuccess
			| NotificationType.DraftSavedSuccess
			| NotificationType.SavingAsADraft
			| NotificationType.EnvelopeBeingVoided
			| NotificationType.EnvelopeVoidedSuccess,
		params: { version: number }
	);
	public notify(type: NotificationType, params?: any) {
		let notification = this._getNotification(type, params);
		this._prevState = this._notification$$.value;
		this._notification$$.next(notification || null);
	}

	get currentNotification() {
		return this._notification$$.value;
	}

	notifyPrevState() {
		this._notification$$.next(this._prevState);
	}

	private _getNotification(type: NotificationType, params?: Record<string, any>): Notification {
		switch (type) {
			case NotificationType.Noop:
				return null;
			case NotificationType.SavingChanges:
				return {
					id: NotificationType.SavingChanges,
					text: 'Saving changes',
					icon: 'loading-icon',
					type: 'pending',
				};
			case NotificationType.ChangesSaved:
				return {
					id: NotificationType.ChangesSaved,
					text: 'Changes has been saved successfully',
					icon: 'approved',
					type: 'success',
				};
			case NotificationType.ChangesNotSavedYet:
				return {
					id: NotificationType.ChangesNotSavedYet,
					text: "Changes applied on the document weren't saved yet",
					icon: 'info_icon',
					type: 'warning',
				};
			case NotificationType.VersionBeingCreated:
				return {
					id: NotificationType.VersionBeingCreated,
					text: `<strong>Version ${params.version}</strong> is being created`,
					icon: 'loading-icon',
					type: 'pending',
				};

			case NotificationType.VersionCreatedSuccess:
				return {
					id: NotificationType.VersionCreatedSuccess,
					text: `<strong>Version ${params.version}</strong> has been created successfully`,
					icon: 'approved',
					type: 'success',
				};
			case NotificationType.EnvelopeBeingVoided:
				return {
					id: NotificationType.EnvelopeBeingVoided,
					text: `Envelope with version ${params.version} is being voided`,
					icon: 'loading-icon',
					type: 'pending',
				};

			case NotificationType.EnvelopeVoidedSuccess:
				return {
					id: NotificationType.EnvelopeVoidedSuccess,
					text: `Envelope with version ${params.version} has been voided successfully. Version ${
						params.version + 1
					} has been created successfully`,
					icon: 'approved',
					type: 'success',
				};
			case NotificationType.SavingAsADraft:
				return {
					id: NotificationType.SavingAsADraft,
					text: `Saving as a draft`,
					icon: 'loading-icon',
					type: 'pending',
				};

			case NotificationType.DraftSavedSuccess:
				return {
					id: NotificationType.DraftSavedSuccess,
					text: `Draft of the Version ${params.version} has been saved successfully`,
					icon: 'approved',
					type: 'success',
				};
			case NotificationType.SentSuccessfully:
				return {
					id: NotificationType.SentSuccessfully,
					text: `${params.filename} has been sent successfully`,
					icon: 'approved',
					type: 'success',
				};
			case NotificationType.SendingInProgress:
				return {
					id: NotificationType.SendingInProgress,
					text: `In progress`,
					icon: 'loading-icon',
					type: 'pending',
				};

			default:
				return null;
		}
	}
}
