
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductosIndexedDbService {

  private readonly nombreBD = 'francis-collection';
  private readonly versionBD = 1;
  private readonly almacen = 'catalogo';
  private readonly clave = 'productos';

  private abrirBD(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {

      if (typeof indexedDB === 'undefined') {
        reject(
          new Error('Este navegador no soporta IndexedDB.')
        );
        return;
      }

      const solicitud = indexedDB.open(
        this.nombreBD,
        this.versionBD
      );

      solicitud.onupgradeneeded = () => {
        const db = solicitud.result;

        if (!db.objectStoreNames.contains(this.almacen)) {
          db.createObjectStore(this.almacen);
        }
      };

      solicitud.onsuccess = () => {
        resolve(solicitud.result);
      };

      solicitud.onerror = () => {
        reject(
          solicitud.error ??
          new Error('No se pudo abrir la base local.')
        );
      };

      solicitud.onblocked = () => {
        reject(
          new Error('La base local está bloqueada.')
        );
      };
    });
  }

  async cargar<T>(): Promise<T | null> {
    const db = await this.abrirBD();

    try {
      return await new Promise<T | null>(
        (resolve, reject) => {

          const transaccion = db.transaction(
            this.almacen,
            'readonly'
          );

          const solicitud = transaccion
            .objectStore(this.almacen)
            .get(this.clave);

          solicitud.onsuccess = () => {
            resolve(
              (solicitud.result as T | undefined) ?? null
            );
          };

          solicitud.onerror = () => {
            reject(
              solicitud.error ??
              new Error('No se pudieron leer productos.')
            );
          };
        }
      );
    } finally {
      db.close();
    }
  }

  async guardar<T>(productos: T): Promise<void> {
    const db = await this.abrirBD();

    try {
      await new Promise<void>((resolve, reject) => {

        const transaccion = db.transaction(
          this.almacen,
          'readwrite'
        );

        transaccion
          .objectStore(this.almacen)
          .put(productos, this.clave);

        transaccion.oncomplete = () => {
          resolve();
        };

        transaccion.onerror = () => {
          reject(
            transaccion.error ??
            new Error('No se pudieron guardar productos.')
          );
        };

        transaccion.onabort = () => {
          reject(
            transaccion.error ??
            new Error('Se canceló el guardado.')
          );
        };
      });
    } finally {
      db.close();
    }
  }
}
