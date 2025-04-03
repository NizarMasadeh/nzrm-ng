export type DialogSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ConfirmationDialogConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: DialogSeverity;
    showCancel?: boolean;
}

export interface ConfirmationDialogResult {
    confirmed: boolean;
}