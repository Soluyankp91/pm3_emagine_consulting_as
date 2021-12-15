import { AfterViewInit, Compiler, Component, ComponentFactoryResolver, ComponentRef, Input, OnChanges, OnDestroy, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { WorkflowExtensionComponent } from '../workflow-extension/workflow-extension.component';

@Component({
    selector: 'dynamic-component-loader',
    template: `<div #target></div>`,
    styleUrls: ['./dynamic-component-loader.component.scss']
})
export class DynamicComponentLoaderComponent implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
    @Input() type: Type<Component>;
    @Input() index: number | null;
    @Input() isCollapsedHeader: boolean;
    cmpRef: ComponentRef<Component | any>;
    private isViewInitialized: boolean = false;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private compiler: Compiler) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.cmpRef) {
            // when the `type` input changes we destroy a previously
            // created component before creating the new one
            this.cmpRef.destroy();
        }

        setTimeout(() => {
            let factory = this.componentFactoryResolver.resolveComponentFactory(this.type);
            // let factory = this.componentFactoryResolver.resolveComponentFactory(WorkflowExtensionComponent);
            this.cmpRef = this.target.createComponent(factory);
            // this.cmpRef.instance.isCollapsedHeader = this.isCollapsedHeader;
            if (this.index) {
                this.cmpRef.instance.selectedIndex = this.index;
            }
            // to access the created instance use
            // this.cmpRef.instance.
            // this.compRef.instance.someOutput.subscribe(val => doSomething());
        }, 100);

    }

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.updateComponent();
    }

    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }
}
