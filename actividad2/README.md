# Registro de Alumnos — Backend

## Requisitos
- Node.js 18 o superior
- npm

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor
npm start
```

El servidor queda escuchando en el puerto 3000, accesible desde cualquier IP de la red.

## Cómo acceder

- **Desde la misma PC:** http://localhost:3000
- **Desde otra PC en la red:** http://<IP-del-servidor>:3000

Para conocer tu IP local, ejecutá en la terminal:
- Windows: `ipconfig`
- Linux/Mac: `ip a` o `ifconfig`

## Cómo funciona

- Cada navegador recibe una **cookie `userId`** única (UUID) la primera vez que abre la página.
- Esa cookie persiste 1 año en el navegador.
- El servidor guarda los alumnos de cada usuario en memoria, indexados por su `userId`.
- Al reabrir la página, el navegador envía la cookie y el servidor devuelve los datos correspondientes.
- **Los datos se pierden si se reinicia el servidor** (están en memoria RAM).

## API

| Método | Ruta                  | Descripción               |
|--------|-----------------------|---------------------------|
| GET    | `/`                   | Sirve la página HTML      |
| GET    | `/api/alumnos`        | Lista alumnos del usuario |
| POST   | `/api/alumnos`        | Agrega un alumno          |
| DELETE | `/api/alumnos/:id`    | Elimina un alumno         |

### Cuerpo del POST /api/alumnos
```json
{ "nombre": "Ana García", "edad": 20, "nota": 8.5 }
```
