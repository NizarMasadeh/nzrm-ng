import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzrmNgComponent } from './nzrm-ng.component';

describe('NzrmNgComponent', () => {
  let component: NzrmNgComponent;
  let fixture: ComponentFixture<NzrmNgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NzrmNgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NzrmNgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
