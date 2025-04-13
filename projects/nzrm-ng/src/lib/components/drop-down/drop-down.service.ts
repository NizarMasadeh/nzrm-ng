import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DropdownManagerService {
    private openDropdownId: string | null = null;
    private dropdownCloseSubject = new Subject<string>();

    public dropdownClose$ = this.dropdownCloseSubject.asObservable();

    registerOpenDropdown(id: string): void {
        if (this.openDropdownId !== id) {
            if (this.openDropdownId) {
                this.dropdownCloseSubject.next(this.openDropdownId);
            }
            this.openDropdownId = id;
        }
    }

    closeDropdown(id: string): void {
        if (this.openDropdownId === id) {
            this.openDropdownId = null;
        }
    }

    closeAll(): void {
        if (this.openDropdownId) {
            this.dropdownCloseSubject.next(this.openDropdownId);
            this.openDropdownId = null;
        }
    }
}
