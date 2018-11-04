import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigBoxComponent } from './config-box.component';

describe('ConfigBoxComponent', () => {
  let component: ConfigBoxComponent;
  let fixture: ComponentFixture<ConfigBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
