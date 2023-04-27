import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	ElementRef,
	EventEmitter,
	NgZone,
	OnDestroy,
	ViewChild,
} from '@angular/core';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'toggle-edit-mode',
	templateUrl: './toggle-edit-mode.component.html',
	styleUrls: ['./toggle-edit-mode.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleEditModeComponent implements AfterViewInit, OnDestroy {
	@ViewChild('buttonsContainer', { static: false }) buttonsContainer: ElementRef;
	@Input() canToggleEditMode: boolean;
	@Input() showReturnToSales = false;
	@Input() canReopen: boolean;
	@Output() editModeToggled = new EventEmitter<any>();
	@Output() onReturnToSales = new EventEmitter<any>();
	buttonsAreHovering = false;
	private _unsubscribe = new Subject();
	constructor(private _scrollDispatcher: ScrollDispatcher, private _zone: NgZone, private readonly _cdr: ChangeDetectorRef) {}
	ngAfterViewInit(): void {
		this._scrollDispatcher
			.scrolled()
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((cdk: CdkScrollable | any) => {
				this._zone.run(() => {
					const scrollPosition = cdk.getElementRef().nativeElement.scrollTop;
					if (scrollPosition > 150) {
						if (!this.buttonsAreHovering) {
							this.buttonsAreHovering = true;
							this._cdr.detectChanges();
						}
					} else {
						if (this.buttonsAreHovering) {
							this.buttonsAreHovering = false;
							this._cdr.detectChanges();
						}
					}
				});
			});
	}
	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}
	toggleEditMode() {
		this.editModeToggled.emit();
	}
	returnToSales() {
		this.onReturnToSales.emit();
	}
}
