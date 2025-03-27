import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface NotificationMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  timeout?: number;
}

@Component({
  selector: 'app-notification',
  imports: [
    CommonModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  animations: [
    trigger('notificationAnimation', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in'))
    ])
  ]
})
export class NotificationComponent {
  @Input() message: NotificationMessage | null = null;

  visible = false;
  animationState = 'void';
  progressWidth = 100;
  showProgressBar = true;

  private timeout: any;
  private progressInterval: any;

  ngOnInit(): void {
    if (this.message) {
      this.show();
    }
  }

  show(): void {
    this.visible = true;
    this.animationState = 'visible';
    this.startProgressBar();
  }

  hide(): void {
    this.animationState = 'hidden';
    this.clearTimers();

    setTimeout(() => {
      this.visible = false;
    }, 200);
  }

  getIconClass(): string {
    switch (this.message?.severity) {
      case 'success': return 'pi pi-check-circle';
      case 'info': return 'pi pi-info-circle';
      case 'warn': return 'pi pi-exclamation-triangle';
      case 'error': return 'pi pi-times-circle';
      default: return 'pi pi-info-circle';
    }
  }

  private startProgressBar(): void {
    this.progressWidth = 100;
    const duration = this.message?.timeout || 5000;

    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      this.progressWidth -= 0.5;
      if (this.progressWidth <= 0) {
        this.hide();
      }
    }, duration / 200);

    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  private clearTimers(): void {
    clearTimeout(this.timeout);
    clearInterval(this.progressInterval);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}