import { Injectable, Inject } from "@angular/core"
import { DOCUMENT } from "@angular/common"
import { Observable, Subject } from "rxjs"
import { MessageDialogConfig } from "./message-dialog.model"

@Injectable({
    providedIn: "root",
})
export class MessageDialogService {
    private dialogSubject = new Subject<MessageDialogConfig | null>()
    private closeSubject = new Subject<void>()

    public dialog$ = this.dialogSubject.asObservable()
    public close$ = this.closeSubject.asObservable()

    private activeTimeoutId: number | null = null;

    constructor(@Inject(DOCUMENT) private document: Document) { }

    show(config: MessageDialogConfig): Observable<void> {

        if (this.activeTimeoutId !== null) {
            window.clearTimeout(this.activeTimeoutId)
            this.activeTimeoutId = null
        }

        const completeConfig: MessageDialogConfig = {
            showCloseButton: true,
            closeOnEscape: true,
            closeOnBackdropClick: true,
            closable: true,
            duration: 0,
            severity: "info",
            ...config,
        }

        this.dialogSubject.next(completeConfig)

        if (completeConfig.duration && completeConfig.duration > 0) {
            this.activeTimeoutId = window.setTimeout(() => {
                this.close()
            }, completeConfig.duration)
        }

        return this.close$
    }

    success(title: string, message: string, options?: Partial<MessageDialogConfig>): Observable<void> {
        return this.show({
            title,
            message,
            severity: "success",
            ...options,
        })
    }

    info(title: string, message: string, options?: Partial<MessageDialogConfig>): Observable<void> {
        return this.show({
            title,
            message,
            severity: "info",
            ...options,
        })
    }

    warn(title: string, message: string, options?: Partial<MessageDialogConfig>): Observable<void> {
        return this.show({
            title,
            message,
            severity: "warn",
            ...options,
        })
    }

    error(title: string, message: string, options?: Partial<MessageDialogConfig>): Observable<void> {
        return this.show({
            title,
            message,
            severity: "error",
            ...options,
        })
    }

    close(): void {
        if (this.activeTimeoutId !== null) {
            window.clearTimeout(this.activeTimeoutId)
            this.activeTimeoutId = null
        }

        this.dialogSubject.next(null)
        this.closeSubject.next()
    }
}