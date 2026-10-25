
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarritoService } from '../../core/services/carrito.service';

@Component({
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './carrito.component.html'
})
export class CarritoComponent {

  // =====================================================
  // SERVICIOS
  // =====================================================

  readonly carrito = inject(CarritoService);

  // =====================================================
  // ACTUALIZAR CANTIDAD DE UN PRODUCTO
  // =====================================================

  cantidad(
    idProductoTalla: number,
    evento: Event
  ): void {

    const input = evento.target as HTMLInputElement;

    // Buscar el artículo en el carrito.
    const articulo = this.carrito.items().find(
      item => item.idProductoTalla === idProductoTalla
    );

    if (!articulo) {
      return;
    }

    const texto = input.value.trim();
    const nuevaCantidad = Number(texto);

    // Validar la cantidad introducida.
    if (
      texto === '' ||
      !Number.isSafeInteger(nuevaCantidad) ||
      nuevaCantidad < 1 ||
      nuevaCantidad > 99
    ) {

      // Restaurar la cantidad anterior.
      input.value = String(articulo.cantidad);

      return;
    }

    // Actualizar mediante CarritoService.
    this.carrito.cambiar(
      idProductoTalla,
      nuevaCantidad
    );

    // Consultar la cantidad realmente guardada.
    const actualizado = this.carrito.items().find(
      item => item.idProductoTalla === idProductoTalla
    );

    // Sincronizar el campo con el carrito.
    input.value = String(
      actualizado?.cantidad ?? articulo.cantidad
    );
  }

  // =====================================================
  // FORMATO DE PRECIOS EN SOLES PERUANOS
  // =====================================================

  precio(valor: number): string {

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }
}
