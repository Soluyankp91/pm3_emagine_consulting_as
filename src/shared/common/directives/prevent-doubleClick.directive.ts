import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Directive({
    selector: '[appPreventDoubleClick]'
})
export class PreventDoubleClickDirective implements OnInit, OnDestroy {
    @Input()
    throttleTime = 700;

    @Output()
    throttledClick = new EventEmitter();

    private clicks = new Subject();
    private subscription = new Subscription();

    constructor() { }

    ngOnInit() {
        this.subscription = this.clicks.pipe(
            throttleTime(this.throttleTime)
        ).subscribe(e => this.emitThrottledClick(e));
    }

    emitThrottledClick(e: any) {
        this.throttledClick.emit(e);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @HostListener('click', ['$event'])
    clickEvent(event: any) {
        event.preventDefault();
        event.stopPropagation();
        this.clicks.next(event);
    }
}
