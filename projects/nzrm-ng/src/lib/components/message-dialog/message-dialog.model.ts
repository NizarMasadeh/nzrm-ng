export type MessageSeverity = "success" | "info" | "warn" | "error"

export interface MessageDialogConfig {
    title: string
    message: string
    severity?: MessageSeverity
    duration?: number
    showCloseButton?: boolean
    closeOnEscape?: boolean
    closeOnBackdropClick?: boolean
}

