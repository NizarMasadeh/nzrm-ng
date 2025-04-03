import { Injectable } from "@angular/core"
import { Observable, Subject } from "rxjs"
import { ConfirmationDialogConfig, ConfirmationDialogResult } from "./confirmation-dialog.model"

@Injectable({
    providedIn: "root",
})
export class ConfirmationDialogService {
    private dialogSubject = new Subject<ConfirmationDialogConfig | null>()
    private resultSubject = new Subject<ConfirmationDialogResult>()
    private currentDialog: Observable<ConfirmationDialogResult> | null = null
    public dialog$ = this.dialogSubject.asObservable()

    confirm(config: ConfirmationDialogConfig): Observable<ConfirmationDialogResult> {
        const completeConfig: ConfirmationDialogConfig = {
            confirmText: "Confirm",
            cancelText: "Cancel",
            severity: "info",
            showCancel: true,
            ...config,
        }

        this.dialogSubject.next(completeConfig)
        this.currentDialog = this.resultSubject.asObservable()
        return this.currentDialog
    }

    success(
        title: string,
        message: string,
        options?: Partial<ConfirmationDialogConfig>,
    ): Observable<ConfirmationDialogResult> {
        return this.confirm({
            title,
            message,
            severity: "success",
            ...options,
        })
    }

    info(
        title: string,
        message: string,
        options?: Partial<ConfirmationDialogConfig>,
    ): Observable<ConfirmationDialogResult> {
        return this.confirm({
            title,
            message,
            severity: "info",
            ...options,
        })
    }

    warn(
        title: string,
        message: string,
        options?: Partial<ConfirmationDialogConfig>,
    ): Observable<ConfirmationDialogResult> {
        return this.confirm({
            title,
            message,
            severity: "warn",
            ...options,
        })
    }

    error(
        title: string,
        message: string,
        options?: Partial<ConfirmationDialogConfig>,
    ): Observable<ConfirmationDialogResult> {
        return this.confirm({
            title,
            message,
            severity: "error",
            ...options,
        })
    }

    close(result: ConfirmationDialogResult): void {
        this.resultSubject.next(result)
        this.dialogSubject.next(null)
        this.currentDialog = null
    }
}

