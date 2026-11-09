import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PizzeriaService } from "../../services/pizzeria";
import Swal from 'sweetalert2';

@Component({
  selector: "app-detalle-pedido",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./detalle-pedido.html",
})
export class DetallePedidoComponent implements OnInit {
  pizzas: any[] = [];
  totalPedido = 0;

  constructor(
    private pizzeriaService: PizzeriaService,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.pizzeriaService.pedidoTemporal$.subscribe((pizzas: any[]) => {
      this.pizzas = [...pizzas];
      this.totalPedido = this.pizzas.reduce((acc, curr) => acc + curr.subtotal, 0);
      this.cdRef.detectChanges(); 
    });
  }

  quitarPizza(index: number) {
    if(index >= 0) {
      this.pizzeriaService.quitarPizzaTemporal(index);
    }
  }

  terminarPedido() {
    if (this.pizzas.length === 0) {
      Swal.fire('Atención', 'Agrega al menos una pizza antes de terminar.', 'warning');
      return;
    }

    // Verificamos que exista la información del cliente en la primera pizza guardada
    const primeraPizza = this.pizzas[0];
    if (!primeraPizza || !primeraPizza.cliente) {
      Swal.fire('Error', 'Faltan los datos del cliente en el formulario.', 'error');
      return;
    }

    const datosCliente = primeraPizza.cliente;

    // Estructura exacta que espera Flask en app.py
    const ventaFinal = {
      nombre: datosCliente.nombre,
      direccion: datosCliente.direccion,
      telefono: datosCliente.telefono,
      fecha: datosCliente.fecha, // Formato YYYY-MM-DD garantizado por el input date
      detalles: this.pizzas.map(p => ({
        tamano: p.tamano,
        ingredientes: p.ingredientes,
        num_pizzas: p.num_pizzas,
        subtotal: p.subtotal
      }))
    };

    console.log("Enviando venta a Flask:", ventaFinal);

    this.pizzeriaService.guardarVenta(ventaFinal).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: '¡Pedido Registrado!',
          text: `El importe total a pagar es $${res.total}`,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.pizzeriaService.limpiarPedido();
      },
      error: (err) => {
        console.error("Error en la petición HTTP:", err);
        Swal.fire('Error', 'No se pudo guardar la venta en el servidor. Revisa que Flask esté corriendo.', 'error');
      }
    });
  }
}