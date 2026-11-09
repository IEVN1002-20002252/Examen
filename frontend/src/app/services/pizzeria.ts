import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class PizzeriaService {
  private apiUrl = "http://localhost:5000/api/ventas";

  private pedidoTemporal = new BehaviorSubject<any[]>([]);
  pedidoTemporal$ = this.pedidoTemporal.asObservable();

  constructor(private http: HttpClient) {}

  agregarPizzaTemporal(pizza: any) {
    const pedidoActual = this.pedidoTemporal.value;
    // Usamos el spread operator para crear un nuevo arreglo
    this.pedidoTemporal.next([...pedidoActual, pizza]);
  }

  quitarPizzaTemporal(index: number) {
    const pedidoActual = this.pedidoTemporal.value;
    pedidoActual.splice(index, 1);
    this.pedidoTemporal.next([...pedidoActual]);
  }

  limpiarPedido() {
    this.pedidoTemporal.next([]);
  }

  guardarVenta(venta: any) {
    return this.http.post(this.apiUrl, venta);
  }

  obtenerVentasPorDia(dia: string) {
    return this.http.get(`${this.apiUrl}/dia/${dia}`);
  }

  obtenerVentasPorMes(mes: string) {
    return this.http.get(`${this.apiUrl}/mes/${mes}`);
  }

  obtenerDetalleVenta(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/detalle`);
  }
}