import { Component, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PizzeriaService } from "../../services/pizzeria";

@Component({
  selector: "app-ventas-dia",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./ventas-dia.html",
})
export class VentasDiaComponent {
  tipoConsulta: string = "dia"; 
  diaBuscar: string = "";
  mesBuscar: string = "";
  
  ventas: any[] = [];
  totalGeneral: number = 0;
  detalleVenta: any = null;

  constructor(
    private pizzeriaService: PizzeriaService,
    private cdRef: ChangeDetectorRef // Inyectamos el detector de cambios
  ) {}

  buscarVentas() {
    this.detalleVenta = null; 

    if (this.tipoConsulta === "dia") {
      if (!this.diaBuscar) return;
      this.pizzeriaService.obtenerVentasPorDia(this.diaBuscar).subscribe({
        next: (res: any) => {
          this.ventas = res.ventas || [];
          this.totalGeneral = res.totalGeneral || 0;
          this.cdRef.detectChanges(); // Forzamos actualización visual
        },
        error: (err) => console.error("Error al consultar ventas por día", err)
      });
    } else {
      if (!this.mesBuscar) return;
      this.pizzeriaService.obtenerVentasPorMes(this.mesBuscar).subscribe({
        next: (res: any) => {
          this.ventas = res.ventas || [];
          this.totalGeneral = res.totalGeneral || 0;
          this.cdRef.detectChanges(); // Forzamos actualización visual
        },
        error: (err) => console.error("Error al consultar ventas por mes", err)
      });
    }
  }

  verDetalle(id: number) {
    this.pizzeriaService.obtenerDetalleVenta(id).subscribe({
      next: (res: any) => {
        this.detalleVenta = res;
        this.cdRef.detectChanges(); // <-- Esto hace que aparezca de inmediato al primer clic
      },
      error: (err) => console.error("Error al obtener detalle de venta", err)
    });
  }
}