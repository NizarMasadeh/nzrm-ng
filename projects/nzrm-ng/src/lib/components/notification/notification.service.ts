import { Injectable, ApplicationRef, ComponentFactoryResolver, ComponentRef, Injector, EmbeddedViewRef } from '@angular/core';
import { NotificationComponent, NotificationMessage } from './notification.component';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationRefs: ComponentRef<NotificationComponent>[] = [];

    constructor(
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector
    ) { }

    show(message: NotificationMessage): void {
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(NotificationComponent)
            .create(this.injector);

        componentRef.instance.message = message;

        this.appRef.attachView(componentRef.hostView);

        const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

        document.body.appendChild(domElement);

        this.notificationRefs.push(componentRef);

        componentRef.instance.animationState = 'visible';
        const originalHide = componentRef.instance.hide;
        componentRef.instance.hide = () => {
            originalHide.call(componentRef.instance);

            setTimeout(() => {
                this.removeNotification(componentRef);
            }, 300);
        };
    }

    success(summary: string, detail: string, timeout = 5000): void {
        this.show({ severity: 'success', summary, detail, timeout });
    }

    info(summary: string, detail: string, timeout = 5000): void {
        this.show({ severity: 'info', summary, detail, timeout });
    }

    warn(summary: string, detail: string, timeout = 5000): void {
        this.show({ severity: 'warn', summary, detail, timeout });
    }

    error(summary: string, detail: string, timeout = 5000): void {
        this.show({ severity: 'error', summary, detail, timeout });
    }

    private removeNotification(ref: ComponentRef<NotificationComponent>): void {
        const index = this.notificationRefs.indexOf(ref);
        if (index !== -1) {
            this.appRef.detachView(ref.hostView);
            ref.destroy();
            this.notificationRefs.splice(index, 1);
        }
    }

    clear(): void {
        this.notificationRefs.forEach(ref => {
            this.appRef.detachView(ref.hostView);
            ref.destroy();
        });
        this.notificationRefs = [];
    }
}