import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PizzeriaService } from "../../services/pizzeria";

@Component({
  selector: "app-formulario-pedido",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./formulario-pedido.html",
})
export class FormularioPedidoComponent {
  pedidoForm: FormGroup;
  preciosTamano: any = { Chica: 40, Mediana: 80, Grande: 120 };

  constructor(private fb: FormBuilder, private pizzeriaService: PizzeriaService) {
    this.pedidoForm = this.fb.group({
      nombre: ["", Validators.required],
      direccion: ["", Validators.required],
      telefono: ["", Validators.required],
      fecha: ["", Validators.required], // Debe ser tipo date en HTML
      tamano: ["Chica", Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      num_pizzas: [1, [Validators.required, Validators.min(1)]],
    });
  }

  agregarPizza() {
    if (this.pedidoForm.invalid) {
      alert("Por favor, llena todos los campos correctamente.");
      return;
    }

    const form = this.pedidoForm.value;
    let ingredientes = [];
    let costoIngredientes = 0;

    if (form.jamon) {
      ingredientes.push("Jamón");
      costoIngredientes += 10;
    }
    if (form.pina) {
      ingredientes.push("Piña");
      costoIngredientes += 10;
    }
    if (form.champinones) {
      ingredientes.push("Champiñones");
      costoIngredientes += 10;
    }

    const precioBase = this.preciosTamano[form.tamano];
    const subtotal = (precioBase + costoIngredientes) * form.num_pizzas;

    const pizza = {
      tamano: form.tamano,
      ingredientes: ingredientes,
      num_pizzas: form.num_pizzas,
      subtotal: subtotal,
      cliente: {
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
        fecha: form.fecha, // Envía la fecha seleccionada
      },
    };

    this.pizzeriaService.agregarPizzaTemporal(pizza);
    
    // Limpia solo las opciones de la pizza, manteniendo los datos del cliente
    this.pedidoForm.patchValue({ jamon: false, pina: false, champinones: false, num_pizzas: 1 });
  }
}