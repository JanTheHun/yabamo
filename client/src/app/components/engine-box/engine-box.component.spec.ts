import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineBoxComponent } from './engine-box.component';

describe('EngineBoxComponent', () => {
  let component: EngineBoxComponent;
  let fixture: ComponentFixture<EngineBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngineBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
