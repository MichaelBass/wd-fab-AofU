import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofsheetComponent } from './proofsheet.component';

describe('ProofsheetComponent', () => {
  let component: ProofsheetComponent;
  let fixture: ComponentFixture<ProofsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofsheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
