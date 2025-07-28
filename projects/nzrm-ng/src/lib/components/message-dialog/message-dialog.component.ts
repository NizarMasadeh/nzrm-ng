import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ViewEncapsulation,
  Inject,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { Subscription } from "rxjs"
import { trigger, transition, style, animate, type AnimationEvent } from "@angular/animations"
import { DOCUMENT } from "@angular/common"
import { MessageDialogConfig, MessageSeverity } from "./message-dialog.model"
import { MessageDialogService } from "./message-dialog.service"
@Component({
  selector: "n-message-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./message-dialog.component.html",
  styleUrls: ["./message-dialog.component.scss"],
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
export class MessageDialogComponent implements OnInit, OnDestroy {
  visible = false
  config: MessageDialogConfig | null = null
  private subscription: Subscription = new Subscription()
  private animationInProgress = false;

  constructor(
    private dialogService: MessageDialogService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.dialogService.dialog$.subscribe((config) => {
        this.config = config
        this.visible = !!config

        if (this.visible) {
          this.disableBodyScroll()
        } else {
          this.enableBodyScroll()
        }

        this.cdr.detectChanges()
      }),
    )
  }

  ngOnDestroy(): void {
    this.enableBodyScroll()
    this.subscription.unsubscribe()
  }

  close(): void {
    if (this.animationInProgress || !this.config?.closable) return
    this.dialogService.close()
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.visible && !this.animationInProgress && this.config?.closeOnEscape && this.config?.closable) {
      this.close()
    }
  }

  onBackdropClick(): void {
    if (this.config?.closeOnBackdropClick && this.config?.closable) {
      this.close()
    }
  }

  getIconClass(severity: MessageSeverity = "info"): string {
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

  private disableBodyScroll(): void {
    const scrollbarWidth = window.innerWidth - this.document.documentElement.clientWidth
    this.document.body.style.overflow = "hidden"
    this.document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  private enableBodyScroll(): void {
    this.document.body.style.overflow = ""
    this.document.body.style.paddingRight = ""
  }
}