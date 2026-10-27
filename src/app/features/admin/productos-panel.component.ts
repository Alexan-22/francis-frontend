
import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ProductosIndexedDbService
} from './productos-indexed-db.service';

// ==========================================
// FRANCIS COLLECTION
// TIPOS E INTERFACES
// ==========================================

type Categoria =
  | 'Blusas'
  | 'Vestidos'
  | 'Pantalones'
  | 'Casacas'
  | 'Polos';

type FiltroEstado =
  | 'todos'
  | 'activos'
  | 'inactivos'
  | 'stock-bajo';

interface Producto {
  id: number;
  nombre: string;
  sku: string;
  categoria: Categoria;
  talla: string;
  precio: number;
  stock: number;
  activo: boolean;
  imagenUrl: string;
}

type FormProducto = Omit<Producto, 'id'>;

// ==========================================
// COMPONENTE ANGULAR
// ==========================================

@Component({
  selector: 'app-productos-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './productos-panel.component.html',
  styleUrls: ['./productos-panel.component.css']
})
export class ProductosPanelComponent {

  // ========================================
  // SERVICIO INDEXEDDB
  // ========================================

  private readonly almacenamiento = inject(
    ProductosIndexedDbService
  );

  readonly cargandoCatalogo = signal(true);
  readonly guardandoCatalogo = signal(false);
  readonly errorAlmacenamiento = signal('');

  private colaGuardado: Promise<void> = Promise.resolve();
  private guardadosPendientes = 0;

  // ========================================
  // CATEGORIAS
  // ========================================

  readonly categorias: Categoria[] = [
    'Blusas',
    'Vestidos',
    'Pantalones',
    'Casacas',
    'Polos'
  ];

  // ========================================
  // PRODUCTOS INICIALES DE DEMOSTRACION
  // SOLO SE USAN LA PRIMERA VEZ
  // ========================================

  readonly productos = signal<Producto[]>([
    {
      id: 1,
      nombre: 'Vestido Elegance',
      sku: 'FR-001',
      categoria: 'Vestidos',
      talla: 'M',
      precio: 129.90,
      stock: 12,
      activo: true,
      imagenUrl: ''
    },
    {
      id: 2,
      nombre: 'Blusa Casual',
      sku: 'FR-002',
      categoria: 'Blusas',
      talla: 'S',
      precio: 69.90,
      stock: 3,
      activo: true,
      imagenUrl: ''
    },
    {
      id: 3,
      nombre: 'Pantalón Classic',
      sku: 'FR-003',
      categoria: 'Pantalones',
      talla: 'L',
      precio: 99.90,
      stock: 18,
      activo: true,
      imagenUrl: ''
    },
    {
      id: 4,
      nombre: 'Casaca Urbana',
      sku: 'FR-004',
      categoria: 'Casacas',
      talla: 'M',
      precio: 159.90,
      stock: 9,
      activo: true,
      imagenUrl: ''
    },
    {
      id: 5,
      nombre: 'Polo Básico',
      sku: 'FR-005',
      categoria: 'Polos',
      talla: 'S',
      precio: 49.90,
      stock: 2,
      activo: true,
      imagenUrl: ''
    },
    {
      id: 6,
      nombre: 'Vestido Floral',
      sku: 'FR-006',
      categoria: 'Vestidos',
      talla: 'L',
      precio: 119.90,
      stock: 0,
      activo: false,
      imagenUrl: ''
    }
  ]);

  // ========================================
  // FILTROS Y BUSQUEDA
  // ========================================

  readonly busqueda = signal('');
  readonly categoriaSeleccionada = signal('Todas');
  readonly filtroEstado = signal<FiltroEstado>('todos');
  readonly orden = signal('nombre');

  // ========================================
  // FORMULARIO Y MENSAJES
  // ========================================

  readonly formularioAbierto = signal(false);
  readonly productoEditando = signal<number | null>(null);
  readonly mensajeError = signal('');
  readonly aviso = signal('');

  formulario: FormProducto = this.formularioVacio();

  // ========================================
  // SUBIDA Y PREVISUALIZACION DE IMAGENES
  // ========================================

  readonly imagenPrevisualizacion = signal('');
  readonly leyendoImagen = signal(false);

  readonly imagenMaxBytes = 5 * 1024 * 1024;

  private lectorImagen: FileReader | null = null;

  // ========================================
  // INICIALIZACION DEL COMPONENTE
  // ========================================

  constructor() {
    void this.cargarCatalogo();
  }

  // ========================================
  // CARGAR PRODUCTOS DESDE INDEXEDDB
  // ========================================

  private async cargarCatalogo(): Promise<void> {

    this.cargandoCatalogo.set(true);

    try {

      const productosGuardados =
        await this.almacenamiento.cargar<Producto[]>();

      if (
        productosGuardados !== null &&
        Array.isArray(productosGuardados)
      ) {

        // Restaurar el catálogo que ya se guardó
        // en este navegador.
        this.productos.set(productosGuardados);

      } else {

        // Primera vez en el navegador:
        // guardar los productos de ejemplo.
        await this.almacenamiento.guardar(
          this.productos()
        );
      }

      this.errorAlmacenamiento.set('');

    } catch {

      this.errorAlmacenamiento.set(
        'No se pudo recuperar el catálogo local. ' +
        'Los cambios nuevos podrían perderse ' +
        'si actualizas la página.'
      );

    } finally {

      this.cargandoCatalogo.set(false);

    }
  }

  // ========================================
  // GUARDAR PRODUCTOS EN INDEXEDDB
  // ========================================

  private persistirProductos(): void {

    // Crear una copia del catálogo actual.
    // Incluye las imágenes Base64.
    const copia: Producto[] = this.productos().map(
      producto => ({ ...producto })
    );

    this.guardadosPendientes++;

    this.guardandoCatalogo.set(true);

    // Se procesan los guardados en orden.
    // Así evitamos que una operación antigua
    // sobrescriba una modificación reciente.
    this.colaGuardado = this.colaGuardado
      .catch(() => {
        // Recuperar la cola si falló un
        // guardado anterior.
      })
      .then(() =>
        this.almacenamiento.guardar(copia)
      )
      .then(() => {

        this.errorAlmacenamiento.set('');

      })
      .catch(() => {

        this.errorAlmacenamiento.set(
          'No se pudieron guardar los productos. ' +
          'Comprueba el espacio disponible ' +
          'y los permisos de almacenamiento ' +
          'del navegador.'
        );

      })
      .finally(() => {

        this.guardadosPendientes--;

        this.guardandoCatalogo.set(
          this.guardadosPendientes > 0
        );

      });
  }

  // ========================================
  // ESTADISTICAS
  // ========================================

  readonly totalProductos = computed(
    () => this.productos().length
  );

  readonly totalActivos = computed(
    () => this.productos().filter(
      producto => producto.activo
    ).length
  );

  readonly totalStock = computed(
    () => this.productos().reduce(
      (total, producto) =>
        total + producto.stock,
      0
    )
  );

  readonly totalStockBajo = computed(
    () => this.productos().filter(
      producto =>
        producto.activo &&
        producto.stock <= 5
    ).length
  );

  // ========================================
  // LISTA FILTRADA Y ORDENADA
  // ========================================

  readonly productosFiltrados = computed(() => {

    const texto = this.busqueda()
      .trim()
      .toLowerCase();

    const categoria = this.categoriaSeleccionada();
    const estado = this.filtroEstado();
    const orden = this.orden();

    const resultado = this.productos().filter(
      producto => {

        const coincideTexto =
          !texto ||
          producto.nombre.toLowerCase().includes(texto) ||
          producto.sku.toLowerCase().includes(texto);

        const coincideCategoria =
          categoria === 'Todas' ||
          producto.categoria === categoria;

        let coincideEstado = true;

        if (estado === 'activos') {
          coincideEstado = producto.activo;
        }

        if (estado === 'inactivos') {
          coincideEstado = !producto.activo;
        }

        if (estado === 'stock-bajo') {
          coincideEstado =
            producto.activo &&
            producto.stock <= 5;
        }

        return (
          coincideTexto &&
          coincideCategoria &&
          coincideEstado
        );
      }
    );

    return resultado.sort((a, b) => {

      switch (orden) {

        case 'precio-asc':
          return a.precio - b.precio;

        case 'precio-desc':
          return b.precio - a.precio;

        case 'stock':
          return a.stock - b.stock;

        case 'recientes':
          return b.id - a.id;

        default:
          return a.nombre.localeCompare(
            b.nombre,
            'es'
          );
      }
    });
  });

  // ========================================
  // FORMULARIO VACIO
  // ========================================

  private formularioVacio(): FormProducto {

    return {
      nombre: '',
      sku: '',
      categoria: 'Blusas',
      talla: 'M',
      precio: 0,
      stock: 0,
      activo: true,
      imagenUrl: ''
    };
  }

  // ========================================
  // FORMATO DE PRECIO EN SOLES
  // ========================================

  moneda(valor: number): string {

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  // ========================================
  // ICONOS SEGUN CATEGORIA
  // ========================================

  iconoCategoria(categoria: Categoria): string {

    switch (categoria) {

      case 'Vestidos':
        return '👗';

      case 'Blusas':
        return '👚';

      case 'Pantalones':
        return '👖';

      case 'Casacas':
        return '🧥';

      case 'Polos':
        return '👕';
    }
  }

  // ========================================
  // ESTADO DEL STOCK
  // ========================================

  estadoStock(producto: Producto): string {

    if (producto.stock === 0) {
      return 'Sin stock';
    }

    if (producto.stock <= 5) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  // ========================================
  // LIMPIAR FILTROS
  // ========================================

  limpiarFiltros(): void {

    this.busqueda.set('');
    this.categoriaSeleccionada.set('Todas');
    this.filtroEstado.set('todos');
    this.orden.set('nombre');
  }

  // ========================================
  // ABRIR NUEVO PRODUCTO
  // ========================================

  abrirNuevo(): void {

    if (this.cargandoCatalogo()) {
      return;
    }

    this.cancelarLecturaImagen();

    this.formulario = this.formularioVacio();

    this.imagenPrevisualizacion.set('');
    this.productoEditando.set(null);
    this.mensajeError.set('');
    this.formularioAbierto.set(true);
  }

  // ========================================
  // EDITAR PRODUCTO
  // ========================================

  editar(producto: Producto): void {

    if (this.cargandoCatalogo()) {
      return;
    }

    this.cancelarLecturaImagen();

    this.formulario = {
      nombre: producto.nombre,
      sku: producto.sku,
      categoria: producto.categoria,
      talla: producto.talla,
      precio: producto.precio,
      stock: producto.stock,
      activo: producto.activo,
      imagenUrl: producto.imagenUrl
    };

    // Mostrar la fotografía guardada
    // anteriormente en IndexedDB.
    this.imagenPrevisualizacion.set(
      producto.imagenUrl || ''
    );

    this.productoEditando.set(producto.id);
    this.mensajeError.set('');
    this.formularioAbierto.set(true);
  }

  // ========================================
  // CERRAR FORMULARIO
  // ========================================

  cerrarFormulario(): void {

    this.cancelarLecturaImagen();

    this.formularioAbierto.set(false);
    this.imagenPrevisualizacion.set('');
    this.mensajeError.set('');
  }

  // ========================================
  // SELECCIONAR IMAGEN DEL EQUIPO
  // ========================================

  seleccionarImagen(evento: Event): void {

    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    // Permitir seleccionar el mismo archivo
    // nuevamente si es necesario.
    input.value = '';

    this.cancelarLecturaImagen();
    this.mensajeError.set('');

    const formatosPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!formatosPermitidos.includes(archivo.type)) {

      this.mensajeError.set(
        'Formato no permitido. ' +
        'Selecciona una fotografía JPG, PNG o WEBP.'
      );

      return;
    }

    if (archivo.size === 0) {

      this.mensajeError.set(
        'El archivo seleccionado está vacío.'
      );

      return;
    }

    if (archivo.size > this.imagenMaxBytes) {

      this.mensajeError.set(
        'La fotografía supera el límite permitido de 5 MB.'
      );

      return;
    }

    const lector = new FileReader();

    this.lectorImagen = lector;
    this.leyendoImagen.set(true);

    lector.onload = () => {

      if (this.lectorImagen !== lector) {
        return;
      }

      const resultado = lector.result;

      if (typeof resultado !== 'string') {

        this.mensajeError.set(
          'No se pudo procesar la fotografía.'
        );

      } else {

        // Guardar imagen como Data URL (Base64).
        // IndexedDB persistirá esta cadena.
        this.formulario.imagenUrl = resultado;

        this.imagenPrevisualizacion.set(resultado);
      }

      this.lectorImagen = null;
      this.leyendoImagen.set(false);
    };

    lector.onerror = () => {

      if (this.lectorImagen !== lector) {
        return;
      }

      this.lectorImagen = null;
      this.leyendoImagen.set(false);

      this.mensajeError.set(
        'Ocurrió un error al leer la fotografía.'
      );
    };

    try {

      lector.readAsDataURL(archivo);

    } catch {

      this.lectorImagen = null;
      this.leyendoImagen.set(false);

      this.mensajeError.set(
        'No se pudo abrir la imagen seleccionada.'
      );
    }
  }

  // ========================================
  // QUITAR IMAGEN
  // ========================================

  quitarImagen(input?: HTMLInputElement): void {

    this.cancelarLecturaImagen();

    this.formulario.imagenUrl = '';

    this.imagenPrevisualizacion.set('');
    this.mensajeError.set('');

    if (input) {
      input.value = '';
    }
  }

  // ========================================
  // CANCELAR LECTURA DE IMAGEN
  // ========================================

  private cancelarLecturaImagen(): void {

    const lector = this.lectorImagen;

    this.lectorImagen = null;
    this.leyendoImagen.set(false);

    if (
      lector &&
      lector.readyState === FileReader.LOADING
    ) {
      lector.abort();
    }
  }

  // ========================================
  // GUARDAR PRODUCTO
  // ========================================

  guardar(): void {

    if (this.cargandoCatalogo()) {

      this.mensajeError.set(
        'Espera mientras cargamos el catálogo.'
      );

      return;
    }

    if (this.leyendoImagen()) {

      this.mensajeError.set(
        'Espera a que termine de cargar la imagen.'
      );

      return;
    }

    const nombre = this.formulario.nombre.trim();

    const sku = this.formulario.sku
      .trim()
      .toUpperCase();

    const precio = Number(this.formulario.precio);
    const stock = Number(this.formulario.stock);

    // Validar nombre y código SKU.
    if (!nombre || !sku) {

      this.mensajeError.set(
        'El nombre y el SKU son obligatorios.'
      );

      return;
    }

    // Validar precio.
    if (
      !Number.isFinite(precio) ||
      precio <= 0
    ) {

      this.mensajeError.set(
        'El precio debe ser mayor que cero.'
      );

      return;
    }

    // Validar stock.
    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      this.mensajeError.set(
        'El stock debe ser un número entero no negativo.'
      );

      return;
    }

    const idActual = this.productoEditando();

    // Evitar códigos SKU duplicados.
    const skuDuplicado = this.productos().some(
      producto =>
        producto.sku.toUpperCase() === sku &&
        producto.id !== idActual
    );

    if (skuDuplicado) {

      this.mensajeError.set(
        'Ya existe un producto con ese SKU.'
      );

      return;
    }

    const datos: FormProducto = {
      ...this.formulario,
      nombre,
      sku,
      precio,
      stock,
      imagenUrl: this.formulario.imagenUrl.trim()
    };

    // ======================================
    // ACTUALIZAR PRODUCTO
    // ======================================

    if (idActual !== null) {

      this.productos.update(lista =>
        lista.map(producto =>
          producto.id === idActual
            ? {
                ...datos,
                id: idActual
              }
            : producto
        )
      );

      this.aviso.set(
        'Producto actualizado. Guardando cambios localmente...'
      );

    } else {

      // ====================================
      // CREAR NUEVO PRODUCTO
      // ====================================

      const nuevoId = Math.max(
        0,
        ...this.productos().map(
          producto => producto.id
        )
      ) + 1;

      this.productos.update(lista => [
        {
          ...datos,
          id: nuevoId
        },
        ...lista
      ]);

      this.aviso.set(
        'Producto agregado. Guardando cambios localmente...'
      );
    }

    // GUARDAR PRODUCTOS E IMAGENES
    // EN INDEXEDDB.
    this.persistirProductos();

    this.cerrarFormulario();
  }

  // ========================================
  // ACTIVAR / DESACTIVAR PRODUCTO
  // ========================================

  cambiarActivo(producto: Producto): void {

    if (this.cargandoCatalogo()) {
      return;
    }

    this.productos.update(lista =>
      lista.map(item =>
        item.id === producto.id
          ? {
              ...item,
              activo: !item.activo
            }
          : item
      )
    );

    this.persistirProductos();

    this.aviso.set(
      'Estado actualizado. Guardando localmente...'
    );
  }

  // ========================================
  // ELIMINAR PRODUCTO
  // ========================================

  eliminar(producto: Producto): void {

    if (this.cargandoCatalogo()) {
      return;
    }

    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}" del catálogo local?`
    );

    if (!confirmado) {
      return;
    }

    this.productos.update(lista =>
      lista.filter(
        item => item.id !== producto.id
      )
    );

    this.persistirProductos();

    this.aviso.set(
      'Producto eliminado. Guardando cambios localmente...'
    );
  }

  // ========================================
  // CERRAR AVISO
  // ========================================

  cerrarAviso(): void {
    this.aviso.set('');
  }
}
