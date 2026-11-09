import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioPedido } from './formulario-pedido';

describe('FormularioPedido', () => {
  let component: FormularioPedido;
  let fixture: ComponentFixture<FormularioPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
