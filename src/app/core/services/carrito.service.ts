import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import { CarritoItem } from '../models/models';

// =====================================================
// CONFIGURACIÓN
// =====================================================

const STORAGE_KEY = 'francis-carrito-v1';

const CANTIDAD_MAXIMA = 99;

// =====================================================
// VALIDACIÓN DE ARTÍCULOS
// =====================================================

function validarItem(
  valor: unknown
): valor is CarritoItem {

  if (
    valor === null ||
    typeof valor !== 'object'
  ) {
    return false;
  }

  const item = valor as Record<string, unknown>;

  return (
    Number.isSafeInteger(item['idProductoTalla']) &&
    Number(item['idProductoTalla']) > 0 &&

    Number.isSafeInteger(item['idProducto']) &&
    Number(item['idProducto']) > 0 &&

    typeof item['nombre'] === 'string' &&
    item['nombre'].trim().length > 0 &&

    typeof item['talla'] === 'string' &&
    item['talla'].trim().length > 0 &&

    Number.isSafeInteger(item['cantidad']) &&
    Number(item['cantidad']) >= 1 &&
    Number(item['cantidad']) <= CANTIDAD_MAXIMA &&

    typeof item['precioReferencia'] === 'number' &&
    Number.isFinite(item['precioReferencia']) &&
    Number(item['precioReferencia']) >= 0 &&

    (
      item['imagen'] === undefined ||
      typeof item['imagen'] === 'string'
    )
  );
}

// =====================================================
// RECUPERAR CARRITO
// =====================================================

function recuperar(): CarritoItem[] {

  try {

    const guardado = localStorage.getItem(STORAGE_KEY);

    if (!guardado) {
      return [];
    }

    const datos: unknown = JSON.parse(guardado);

    if (!Array.isArray(datos)) {
      return [];
    }

    const items: CarritoItem[] = [];

    for (const dato of datos) {

      if (!validarItem(dato)) {
        continue;
      }

      const existente = items.find(
        item =>
          item.idProductoTalla === dato.idProductoTalla
      );

      if (existente) {

        // Solo combinar registros de la misma variante.
        if (existente.idProducto !== dato.idProducto) {
          continue;
        }

        existente.cantidad = Math.min(
          CANTIDAD_MAXIMA,
          existente.cantidad + dato.cantidad
        );

      } else {

        items.push({ ...dato });

      }
    }

    return items;

  } catch {

    // Si el almacenamiento está inaccesible
    // o contiene datos inválidos, iniciar vacío.
    return [];

  }
}

// =====================================================
// SERVICIO DEL CARRITO
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  // ===================================================
  // ESTADO REACTIVO
  // ===================================================

  readonly items = signal<CarritoItem[]>(recuperar());

  /**
   * Número total de unidades del carrito.
   */
  readonly cantidad = computed(() => {

    return this.items().reduce(
      (total, item) => total + item.cantidad,
      0
    );

  });

  /**
   * Subtotal informativo.
   *
   * El backend debe volver a calcular
   * el precio real durante el checkout.
   */
  readonly subtotal = computed(() => {

    return this.items().reduce(
      (total, item) =>
        total + item.cantidad * item.precioReferencia,
      0
    );

  });

  // ===================================================
  // GUARDAR CARRITO
  // ===================================================

  private guardar(datos: CarritoItem[]): void {

    // Actualizar estado de Angular.
    this.items.set(datos);

    // Persistir en el navegador.
    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(datos)
      );

    } catch {

      // Si localStorage no está disponible,
      // conservar los datos en memoria.
    }
  }

  // ===================================================
  // AGREGAR ARTÍCULO
  // ===================================================

  agregar(item: CarritoItem): void {

    // No guardar artículos inválidos.
    if (!validarItem(item)) {
      return;
    }

    const actuales = this.items();

    const existente = actuales.find(
      actual =>
        actual.idProductoTalla === item.idProductoTalla
    );

    // Si la variante ya existe, aumentar cantidad.
    if (existente) {

      if (existente.idProducto !== item.idProducto) {
        return;
      }

      const nuevos = actuales.map(actual => {

        if (
          actual.idProductoTalla !== item.idProductoTalla
        ) {
          return actual;
        }

        return {
          ...actual,
          cantidad: Math.min(
            CANTIDAD_MAXIMA,
            actual.cantidad + item.cantidad
          )
        };

      });

      this.guardar(nuevos);

      return;
    }

    // Si es una variante nueva, agregarla.
    this.guardar([
      ...actuales,
      { ...item }
    ]);
  }

  // ===================================================
  // CAMBIAR CANTIDAD
  // ===================================================

  cambiar(
    idProductoTalla: number,
    cantidad: number
  ): void {

    if (
      !Number.isSafeInteger(idProductoTalla) ||
      idProductoTalla <= 0 ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > CANTIDAD_MAXIMA
    ) {
      return;
    }

    const nuevos = this.items().map(item => {

      if (item.idProductoTalla !== idProductoTalla) {
        return item;
      }

      return {
        ...item,
        cantidad
      };

    });

    this.guardar(nuevos);
  }

  // ===================================================
  // ELIMINAR ARTÍCULO
  // ===================================================

  eliminar(idProductoTalla: number): void {

    const nuevos = this.items().filter(
      item =>
        item.idProductoTalla !== idProductoTalla
    );

    this.guardar(nuevos);
  }

  // ===================================================
  // VACIAR CARRITO
  // ===================================================

  vaciar(): void {

    this.guardar([]);
  }
}