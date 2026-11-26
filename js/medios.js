/**
 * Almacenamiento de medios (fotografías y notas de voz) en IndexedDB.
 * Comprime fotografías con <canvas> a máximo 1024 px en JPEG al 70 %,
 * eliminando automáticamente metadatos EXIF y coordenadas GPS.
 */

const DB_NAME = 'rutalibre_media_db';
const DB_VERSION = 1;
const STORE_FOTOS = 'fotos';
const STORE_AUDIOS = 'audios';

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB no está disponible en este navegador.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FOTOS)) {
        db.createObjectStore(STORE_FOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIOS)) {
        db.createObjectStore(STORE_AUDIOS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('No se pudo abrir IndexedDB.'));
  });
}

/**
 * Reduce una imagen con <canvas> (máx 1024 px, JPEG 70 %), lo cual elimina EXIF/GPS.
 * @param {File|Blob} file
 */
export function comprimirFotoSinExif(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo procesar la fotografía.'));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                blob,
                dataUrl: reader.result,
                width,
                height,
                sizeKB: Math.max(1, Math.round(blob.size / 1024))
              });
            };
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.7
        );
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
    };
    img.src = objectUrl;
  });
}

export async function guardarFoto(id, blob, meta = {}) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOTOS, 'readwrite');
    tx.objectStore(STORE_FOTOS).put({ id, blob, meta, guardadoEn: Date.now() });
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => {
      const err = tx.error;
      if (err && err.name === 'QuotaExceededError') {
        reject(new Error('Espacio lleno en IndexedDB (QuotaExceededError). Borra reportes o fotos antiguas.'));
      } else {
        reject(err || new Error('Error al guardar fotografía en IndexedDB.'));
      }
    };
  });
}

export async function obtenerFotoUrl(id) {
  if (!id) return null;
  const db = await abrirDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_FOTOS, 'readonly');
    const req = tx.objectStore(STORE_FOTOS).get(id);
    req.onsuccess = () => {
      const reg = req.result;
      if (reg && reg.blob) {
        resolve(URL.createObjectURL(reg.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function guardarAudio(id, blob) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIOS, 'readwrite');
    tx.objectStore(STORE_AUDIOS).put({ id, blob, guardadoEn: Date.now() });
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => {
      const err = tx.error;
      if (err && err.name === 'QuotaExceededError') {
        reject(new Error('Espacio lleno para notas de voz (QuotaExceededError).'));
      } else {
        reject(err || new Error('Error al guardar audio en IndexedDB.'));
      }
    };
  });
}

export async function obtenerAudioUrl(id) {
  if (!id) return null;
  const db = await abrirDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_AUDIOS, 'readonly');
    const req = tx.objectStore(STORE_AUDIOS).get(id);
    req.onsuccess = () => {
      const reg = req.result;
      if (reg && reg.blob) {
        resolve(URL.createObjectURL(reg.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

export async function limpiarTodosLosMedios() {
  try {
    const db = await abrirDB();
    await Promise.all([
      new Promise((res) => {
        const tx = db.transaction(STORE_FOTOS, 'readwrite');
        tx.objectStore(STORE_FOTOS).clear();
        tx.oncomplete = res;
        tx.onerror = res;
      }),
      new Promise((res) => {
        const tx = db.transaction(STORE_AUDIOS, 'readwrite');
        tx.objectStore(STORE_AUDIOS).clear();
        tx.oncomplete = res;
        tx.onerror = res;
      })
    ]);
  } catch (e) {
    console.warn('No se pudieron limpiar medios de IndexedDB:', e);
  }
}
