import { Directive, Input, Output, EventEmitter, HostListener } from "@angular/core"
import { ConfirmationDialogService } from "./confirmation-dialog.service"
import { ConfirmationDialogConfig, DialogSeverity } from "./confirmation-dialog.model"
import { firstValueFrom } from "rxjs"

@Directive({
    selector: "[nConfirmation]",
    standalone: true,
})
export class ConfirmationDirective {
    @Input() confirmTitle = "Confirm Action"
    @Input() confirmMessage = "Are you sure you want to proceed?"
    @Input() confirmText = "Confirm"
    @Input() cancelText = "Cancel"
    @Input() confirmSeverity: DialogSeverity = "warn"
    @Input() showCancel = true
    @Input() disabled = false

    @Output() confirmed = new EventEmitter<void>()
    @Output() cancelled = new EventEmitter<void>()
    @Output() dialogOpened = new EventEmitter<void>()

    constructor(private dialogService: ConfirmationDialogService) { }

    @HostListener("click", ["$event"])
    async onClick(event: Event): Promise<void> {
        if (this.disabled) {
            return
        }

        event.preventDefault()
        event.stopPropagation()

        const config: ConfirmationDialogConfig = {
            title: this.confirmTitle,
            message: this.confirmMessage,
            confirmText: this.confirmText,
            cancelText: this.cancelText,
            severity: this.confirmSeverity,
            showCancel: this.showCancel,
        }

        try {
            this.dialogOpened.emit()
            const result = await firstValueFrom(this.dialogService.confirm(config))

            if (result.confirmed) {
                this.confirmed.emit()
            } else {
                this.cancelled.emit()
            }
        } catch (error) {
            this.cancelled.emit()
            console.error("Dialog error:", error)
        }
    }
}

