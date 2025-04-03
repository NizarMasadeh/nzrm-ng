import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ViewEncapsulation,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { Subscription } from "rxjs"
import { trigger, transition, style, animate, AnimationEvent } from "@angular/animations"
import { ConfirmationDialogService } from "./confirmation-dialog.service"
import { ConfirmationDialogConfig, DialogSeverity } from "./confirmation-dialog.model"

@Component({
  selector: "n-confirmation-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger("dialogAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0.95) translateY(10px)" }),
        animate("250ms cubic-bezier(0.16, 1, 0.3, 1)", style({ opacity: 1, transform: "scale(1) translateY(0)" })),
      ]),
      transition(":leave", [
        animate(
          "180ms cubic-bezier(0.16, 1, 0.3, 1)",
          style({ opacity: 0, transform: "scale(0.95) translateY(10px)" }),
        ),
      ]),
    ]),
    trigger("overlayAnimation", [
      transition(":enter", [style({ opacity: 0 }), animate("200ms ease-out", style({ opacity: 1 }))]),
      transition(":leave", [animate("150ms ease-in", style({ opacity: 0 }))]),
    ]),
  ],
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
  visible = false
  config: ConfirmationDialogConfig | null = null
  private subscription: Subscription = new Subscription()
  private animationInProgress = false

  constructor(
    private dialogService: ConfirmationDialogService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.dialogService.dialog$.subscribe((config) => {
        this.config = config
        this.visible = !!config
        this.cdr.detectChanges()
      }),
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  confirm(): void {
    if (this.animationInProgress) return
    this.dialogService.close({ confirmed: true })
  }

  cancel(): void {
    if (this.animationInProgress) return
    this.dialogService.close({ confirmed: false })
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.visible && !this.animationInProgress) {
      this.cancel()
    }
  }

  getIconClass(severity: DialogSeverity = "info"): string {
    switch (severity) {
      case "success":
        return "pi pi-check-circle"
      case "warn":
        return "pi pi-exclamation-triangle"
      case "error":
        return "pi pi-times-circle"
      case "info":
      default:
        return "pi pi-info-circle"
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation()
  }

  onAnimationStart(event: AnimationEvent): void {
    this.animationInProgress = true
  }

  onAnimationDone(event: AnimationEvent): void {
    this.animationInProgress = false
  }
}

