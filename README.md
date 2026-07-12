# DebuggersEats - Plataforma de Gestión de Restaurantes

> Proyecto desarrollado con fines académicos como parte del curso IN6AM. Implementa una arquitectura de microservicios para la gestión integral de restaurantes con tecnologías modernas como Node.js, React, .NET 8, MongoDB y PostgreSQL.

---

## Recursos del Proyecto

- Tablero de Trello: https://trello.com/invite/b/698bae6ae08cd6449113f642/ATTI1c2690ee2a76c9dbf8fd888412ae6887D54F8FF7/sistema-de-restaurantes
- Evidencia de Trabajo y Participación: https://cetkinal-my.sharepoint.com/:b:/g/personal/egomez-2021272_kinal_edu_gt/IQAKFy0OabjsRZdSEKhtD-6tAUvDEPZcqCOWQOib4Qy59C4?e=7ADGf3
- Reunión de Retrospectiva SCRUM: https://cetkinal-my.sharepoint.com/:v:/g/personal/egomez-2021272_kinal_edu_gt/IQBDdoTu70nBRryTjd0L7GyiAXuXhdKxhFsBBooAl_zbT8I?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=LFTnno

---

## Descripcion

**DebuggersEats** es una plataforma web integral para la gestión completa de restaurantes. Permite a clientes, administradores de restaurante y administradores del sistema interactuar en un entorno seguro, moderno y eficiente.

La plataforma facilita la búsqueda de restaurantes, visualización de menús, realización de pedidos, gestión de reservaciones, participación en eventos gastronómicos y la administración de usuarios mediante un sistema de autenticación centralizado. Adicionalmente cuenta con un módulo de reportes para el análisis de desempeño.

El sistema está basado en una arquitectura de microservicios donde cada servicio es responsable de una funcionalidad específica, lo que permite mayor escalabilidad, mantenibilidad y seguridad.

---

## Arquitectura General

El sistema implementa una arquitectura de microservicios compuesta por cuatro componentes principales:

- `authenthication_server` — Servicio de autenticación y gestión de usuarios (Node.js)
- `add-restaurant-service` — Servicio principal de restaurantes, menús, pedidos, reservaciones y más (Node.js)
- `reports-service` — Servicio de reportes y estadísticas (.NET 8)
- `client-admin` — Aplicación web frontend (React + Vite)

Cada servicio backend se organiza en capas:

- **Configs**: Configuración del servidor, base de datos, CORS y Helmet
- **Middlewares**: JWT, roles, validadores y manejo de errores
- **Src**: Controladores, modelos, rutas y servicios por dominio

---

## Servicios

### Authentication Server

Gestiona la autenticación, autorización y administración de usuarios dentro de la plataforma.

Funcionalidades principales:

- Registro de nuevos usuarios con activación por correo electrónico
- Inicio de sesión mediante username y password con generación de JWT y refresh token
- Recuperación y restablecimiento de contraseña por correo
- Gestión de roles: `ADMIN_ROLE`, `RES_ADMIN_ROLE`, `USER_ROLE`
- Creación de usuarios con roles específicos por el administrador del sistema
- Protección de endpoints mediante JWT Bearer
- Rate limiting para protección contra abuso
- Hash seguro de contraseñas con `@node-rs/bcrypt`
- Seeder automático del usuario administrador al iniciar el servicio

Puerto por defecto: `3013`
Base path: `/debuggersEatsAdmin/v1`

---

### Add Restaurant Service

Servicio principal de la plataforma. Gestiona toda la información operativa de los restaurantes.

Módulos incluidos:

**Restaurantes**: CRUD completo con soporte para imágenes via Cloudinary.

**Menu**: Gestión de platillos por restaurante con imágenes, categorías y precio.

**Pedidos y Carrito**: El carrito se mantiene en memoria del servidor. Permite agregar ítems, modificar cantidades, calcular subtotal, IVA (12%) y total. Los pedidos confirmados se persisten en MongoDB con seguimiento de estados. Cliente puede cancelar solo en los primeros 5 minutos y si el pedido está en estado Pendiente.

**Reservaciones**: Creación de reservaciones con sistema de confirmación por token JWT enviado al correo. Verifica disponibilidad de mesas según fecha y hora.

**Eventos Gastronómicos**: Permite crear eventos, cupones y promociones. Los usuarios pueden inscribirse a eventos y aplicar cupones o promociones.

**Mesas**: Gestión del inventario de mesas por restaurante con control de estado (habilitada/inhabilitada).

**Resenas**: Los clientes pueden calificar restaurantes con puntaje (1-5) y comentario. Los administradores de restaurante pueden responder las reseñas.

Puerto por defecto: `3014`
Base path: `/add-restaurant/v1`

---

### Reports Service

Servicio construido en .NET 8 para la generación de estadísticas y reportes de rendimiento. Es un servicio de solo lectura — no modifica datos, únicamente los consulta y procesa.

Funcionalidades:

- Reportes por restaurante: ingresos totales, número de pedidos, platos más vendidos, horas pico
- Reportes globales de plataforma: estadísticas consolidadas de todos los restaurantes
- Sistema de caché en PostgreSQL con TTL de 1 hora para optimizar el rendimiento
- La respuesta indica si los datos provienen de caché (`"fuente": "cache"`) o fueron calculados en tiempo real (`"fuente": "calculado"`)
- Endpoint para limpiar caché y forzar recálculo inmediato

Lee pedidos confirmados desde MongoDB y almacena resultados en PostgreSQL.

Puerto por defecto: `5000`
Base path: `/api/reports`

---

### Client Admin

Aplicación frontend SPA construida con React 19 y Vite. Sirve como interfaz unificada para todos los roles del sistema.

Vistas según rol:

**USER_ROLE** (`/home`):
- Explorar restaurantes y sus menús
- Realizar pedidos con carrito interactivo
- Gestionar reservaciones
- Participar en eventos gastronómicos
- Ver y publicar reseñas
- Consultar historial de pedidos

**RES_ADMIN_ROLE** (`/dashboard`):
- Panel de resumen con estadísticas recientes
- Gestión de menú, mesas, eventos y reservaciones
- Cola de pedidos activos con cambio de estado
- Gestión y respuesta de reseñas
- Reportes del restaurante con exportación a PDF

**ADMIN_ROLE** (`/dashboard`):
- Gestión de usuarios del sistema
- Visualización de restaurantes
- Reportes globales de la plataforma

Puerto por defecto: `5173`

---

## Tecnologias Utilizadas

### Backend

| Tecnología | Uso |
|---|---|
| Node.js + Express 5 | Authentication Server y Restaurant Service |
| C# + .NET 8 | Reports Service |
| JavaScript (ESM) | Módulos de ambos servicios Node.js |
| Mongoose | ODM para MongoDB |
| Entity Framework Core 8 | ORM para PostgreSQL en Reports Service |
| jsonwebtoken | Generación y validación de JWT |
| @node-rs/bcrypt | Hash de contraseñas |
| express-validator | Validación de datos de entrada |
| express-rate-limit | Rate limiting en Authentication Server |
| Nodemailer | Envío de correos (activación, recuperación) |
| Cloudinary + Multer | Almacenamiento y upload de imágenes |
| Swagger (swagger-jsdoc + swagger-ui-express) | Documentación de API |
| Morgan + Helmet | Logging y seguridad HTTP |

### Frontend

| Tecnología | Uso |
|---|---|
| React 19 + Vite 8 | Framework y bundler |
| React Router DOM 7 | Enrutamiento |
| Zustand 5 | Gestión de estado global |
| Axios | Comunicación con los servicios backend |
| Tailwind CSS 4 + Material Tailwind | Estilos y componentes UI |
| React Hook Form | Manejo de formularios |
| React Hot Toast | Notificaciones |
| jsPDF + html2canvas | Exportación de reportes a PDF |
| ESLint + Prettier | Calidad y formato del código |

### Bases de Datos

| Base de Datos | Uso |
|---|---|
| MongoDB | Usuarios, restaurantes, menús, pedidos, eventos, reservaciones, reseñas |
| PostgreSQL | Caché de reportes con TTL (Reports Service) |

---

## Estructura del Proyecto

```
DebuggersEats/
|
├── authenthication_server/        # Servicio de autenticacion (Node.js, puerto 3013)
│   ├── configs/                   # Servidor, DB, CORS, Helmet, Rate Limit
│   ├── helpers/                   # Email helper (Nodemailer)
│   ├── middlewares/               # JWT, roles, validadores, manejo de errores
│   ├── src/
│   │   ├── user.model.js
│   │   ├── user.routes.js
│   │   ├── user.controller.js
│   │   ├── user.services.js
│   │   ├── user.schema.js
│   │   ├── refresh-token.model.js
│   │   ├── refresh-token.controller.js
│   │   └── refresh-token.service.js
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── add-restaurant-service/        # Servicio principal de restaurantes (Node.js, puerto 3014)
│   ├── configs/                   # Servidor, DB, CORS, Helmet, Swagger
│   ├── helpers/                   # Cloudinary service
│   ├── middlewares/               # JWT, roles, validadores, file uploader
│   ├── src/
│   │   ├── restaurants/           # CRUD de restaurantes con imagenes
│   │   ├── menu/                  # Gestion de platillos con imagenes
│   │   ├── orders/                # Carrito en memoria y pedidos
│   │   ├── reservations/          # Reservaciones con token de confirmacion
│   │   ├── gastronomicEvents/     # Eventos, promociones y cupones
│   │   ├── tables/                # Gestion de mesas
│   │   └── reviews/               # Resenas y respuestas
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── reports-service/               # Servicio de reportes (.NET 8, puerto 5000)
│   ├── debuggers-eats-pg/         # docker-compose para PostgreSQL
│   └── src/ReportService.Api/
│       ├── Controllers/           # ReportsController
│       ├── Data/                  # ReportsDbContext (EF Core)
│       ├── Models/                # OrderMongo, ReporteCache, DTOs
│       ├── Services/              # ReportServices (logica y cache)
│       ├── appsettings.json
│       ├── Program.cs
│       └── ReportService.Api.csproj
│
├── client-admin/                  # Frontend React (puerto 5173)
│   ├── src/
│   │   ├── app/                   # App.jsx, rutas, layouts
│   │   ├── assets/                # Imagenes y recursos estaticos
│   │   ├── features/
│   │   │   ├── auth/              # Login, registro, verificacion, reset
│   │   │   ├── restaurants/       # Listado y gestion de restaurantes
│   │   │   ├── menus/             # Menus por restaurante
│   │   │   ├── orders/            # Carrito, checkout, historial
│   │   │   ├── reservations/      # Reservaciones
│   │   │   ├── events/            # Eventos gastronómicos
│   │   │   ├── tables/            # Gestion de mesas
│   │   │   ├── review/            # Resenas
│   │   │   ├── users/             # Gestion de usuarios y perfil
│   │   │   ├── reports/           # Reportes con graficas y PDF
│   │   │   └── res-admin/         # Dashboard del administrador de restaurante
│   │   ├── shared/                # APIs, componentes y utilidades compartidas
│   │   └── styles/                # CSS global
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── package.json                   # Scripts raiz para levantar todos los servicios
└── LICENSE
```

---

## Endpoints

### URLs Base

| Servicio | URL Base |
|---|---|
| Authentication Server | `http://localhost:3013/debuggersEatsAdmin/v1` |
| Restaurant Service | `http://localhost:3014/add-restaurant/v1` |
| Reports Service | `http://localhost:5000/api/reports` |
| Swagger Auth | `http://localhost:3013/debuggersEatsAdmin/v1/api-docs` |
| Swagger Restaurants | `http://localhost:3014/add-restaurant/v1/api-docs` |
| Swagger Reports | `http://localhost:5000/swagger` |

---

### Authentication Server

Todos los paths son relativos a `http://localhost:3013/debuggersEatsAdmin/v1`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/health` | Estado del servicio | No |
| GET | `/auth/activate/:token` | Activar cuenta con token recibido por correo | No |
| POST | `/auth/login` | Login con username y password, devuelve JWT y refresh token | No |
| POST | `/auth/register` | Registro de usuario, envia correo de activacion | No |
| POST | `/auth/forgot-password` | Solicitar restablecimiento de contraseña por correo | No |
| POST | `/auth/reset-password/:token` | Restablecer contraseña con token del correo | No |
| POST | `/auth/refresh` | Renovar JWT usando refresh token | No |
| POST | `/auth/logout` | Cerrar sesion, invalida el refresh token actual | No |
| POST | `/auth/logout-all` | Cerrar todas las sesiones activas del usuario | Token |
| PUT | `/auth/change-password` | Cambiar contraseña propia | Token |
| PUT | `/auth/profile` | Actualizar perfil propio (nombre, apellido, teléfono) | Token |
| POST | `/auth/` | Crear usuario con rol especifico | ADMIN_ROLE |
| GET | `/auth/users` | Listar todos los usuarios | ADMIN_ROLE |
| GET | `/auth/users/:id` | Ver usuario por ID | ADMIN_ROLE |
| PATCH | `/auth/users/:id/status` | Activar o desactivar usuario (toggle) | ADMIN_ROLE |
| DELETE | `/auth/users/:id` | Eliminar usuario | ADMIN_ROLE |

Credenciales del administrador por defecto (creado automaticamente por el seeder al iniciar):

```json
{
  "username": "admin",
  "password": "Admin123!DebuggersEats"
}
```

---

### Restaurantes

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/restaurants/` | Listar todos los restaurantes | Token (cualquier rol) |
| GET | `/restaurants/:id` | Ver restaurante por ID | No |
| POST | `/restaurants/` | Crear restaurante (multipart/form-data) | ADMIN_ROLE |
| PATCH | `/restaurants/:id` | Actualizar datos del restaurante | ADMIN_ROLE |
| DELETE | `/restaurants/:id` | Eliminar restaurante | ADMIN_ROLE |
| POST | `/restaurants/:id/photo` | Subir o reemplazar foto banner | ADMIN_ROLE |
| DELETE | `/restaurants/:id/photo` | Eliminar foto del restaurante | ADMIN_ROLE |

Campos para crear restaurante (multipart/form-data): `name`, `address`, `phone` (8 dígitos), `category` (COMIDA_RAPIDA, ITALIANA, CHINA, MEXICANA, CAFETERIA), `capacity` (mínimo 20), `businessHours[open]`, `businessHours[close]`, `contactInfo[managerName]`, `contactInfo[email]`, `photo` (opcional).

---

### Menu

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/menu/` | Listar todos los platillos | Token (ADMIN_ROLE, RES_ADMIN_ROLE, USER_ROLE) |
| GET | `/menu/restaurant/:restaurantId` | Ver menú de un restaurante | No |
| GET | `/menu/:id` | Ver platillo por ID | No |
| POST | `/menu/` | Crear platillo (multipart/form-data) | RES_ADMIN_ROLE |
| PUT | `/menu/:id` | Actualizar platillo | RES_ADMIN_ROLE |
| DELETE | `/menu/:id` | Eliminar platillo | RES_ADMIN_ROLE |
| POST | `/menu/:id/photo` | Subir o reemplazar foto del platillo | RES_ADMIN_ROLE |
| DELETE | `/menu/:id/photo` | Eliminar foto del platillo | RES_ADMIN_ROLE |

---

### Pedidos y Carrito

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

> El carrito vive en memoria del servidor. Se pierde si el servicio reinicia.

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/orders/menu/:restaurantId` | Ver menú del restaurante para hacer pedido | No |
| GET | `/orders/menu/:restaurantId/:itemId` | Ver platillo específico del menú | No |
| POST | `/orders/cart/:userId` | Agregar ítem al carrito | Token |
| GET | `/orders/cart/:userId` | Ver carrito con subtotal, IVA 12% y total | Token |
| PATCH | `/orders/cart/:userId/:menuItemId` | Cambiar cantidad de un ítem (0 = eliminar) | Token |
| DELETE | `/orders/cart/:userId/:menuItemId` | Quitar ítem del carrito | Token |
| DELETE | `/orders/cart/:userId` | Vaciar carrito completo | Token |
| POST | `/orders/` | Confirmar pedido | Token |
| GET | `/orders/user/:userId` | Historial de pedidos del cliente | Token |
| GET | `/orders/restaurant/:restaurantId` | Cola de pedidos activos del restaurante | RES_ADMIN_ROLE |
| GET | `/orders/:orderId` | Detalle completo de un pedido | Token |
| PATCH | `/orders/:orderId/status` | Cambiar estado del pedido | RES_ADMIN_ROLE |
| PATCH | `/orders/:orderId/edit` | Editar ítems o notas de un pedido (solo si está Pendiente o Aceptado) | RES_ADMIN_ROLE |
| DELETE | `/orders/:orderId` | Cancelar pedido | Token |

Flujo de estados del pedido:

```
Pendiente → Aceptado → En_preparación → Listo → Entregado
Pendiente → Cancelado
Aceptado  → Cancelado
```

Reglas de cancelación: el cliente solo puede cancelar si el pedido está en estado Pendiente y dentro de los primeros 5 minutos. El RES_ADMIN puede cancelar si está Pendiente o Aceptado.

Ejemplo para confirmar pedido:

```json
{
  "userId": "id_del_usuario",
  "direccion": {
    "tipo": "Casa",
    "descripcion": "Zona 1, Calle Falsa 123",
    "referencias": "Casa con portón azul"
  },
  "telefono": "12345678",
  "tipoPago": "Efectivo",
  "notas": "Sin cebolla"
}
```

---

### Reservaciones

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

> Todos los endpoints requieren JWT. El middleware `validateJWT` se aplica globalmente en este router.

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| POST | `/reservations/` | Crear reservación | Token |
| POST | `/reservations/confirm` | Confirmar o cancelar reservación con token del correo | Token |
| GET | `/reservations/` | Ver mis reservaciones | Token |
| PUT | `/reservations/:id` | Actualizar reservación | Token |
| DELETE | `/reservations/:id` | Eliminar reservación | Token |
| GET | `/reservations/disponibilidad/:restaurantName?date=&hour=` | Verificar disponibilidad de mesas | Token |
| GET | `/reservations/restaurant/:restaurantName` | Ver todas las reservaciones del restaurante | RES_ADMIN_ROLE |

Flujo de estados:

```
PENDIENTE → CONFIRMADA → FINALIZADA (automatico al pasar la fecha)
PENDIENTE / CONFIRMADA → CANCELADA
```

Ejemplo para crear reservación:

```json
{
  "restaurantName": "Los Debuggers",
  "reservationDate": "2026-03-15",
  "reservationHour": "19:00",
  "peopleName": "Juan García",
  "peopleNumber": 4,
  "observation": "Mesa cerca de la ventana"
}
```

Para confirmar o cancelar:

```json
{
  "token": "token_recibido_al_crear",
  "action": "CONFIRMAR"
}
```

---

### Eventos Gastronómicos

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/events/restaurant/:restaurantId` | Ver eventos activos de un restaurante | No |
| GET | `/events/:id` | Ver detalle de un evento | No |
| GET | `/events/` | Ver todos los eventos | Token (ADMIN_ROLE, RES_ADMIN_ROLE) |
| POST | `/events/` | Crear evento, cupon o promocion | RES_ADMIN_ROLE |
| PATCH | `/events/:id` | Actualizar evento | RES_ADMIN_ROLE |
| DELETE | `/events/:id` | Eliminar evento | RES_ADMIN_ROLE |
| POST | `/events/:id/join` | Inscribirse a un evento (solo tipo `event`) | Token |
| DELETE | `/events/:id/join` | Cancelar inscripción a un evento | Token |
| POST | `/events/:id/apply` | Aplicar una promocion o cupon (solo tipos `promotion` o `coupon`) | Token |

---

### Mesas

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/tables/restaurant/:restaurantId` | Ver mesas de un restaurante | Token |
| GET | `/tables/:id` | Ver mesa por ID | Token |
| POST | `/tables/` | Crear mesa | RES_ADMIN_ROLE |
| PATCH | `/tables/:id` | Actualizar datos de la mesa | RES_ADMIN_ROLE |
| PATCH | `/tables/:id/status` | Habilitar o inhabilitar mesa (toggle) | RES_ADMIN_ROLE |
| DELETE | `/tables/:id` | Eliminar mesa | RES_ADMIN_ROLE |

---

### Resenas

Todos los paths son relativos a `http://localhost:3014/add-restaurant/v1`

> Todos los endpoints requieren JWT. El middleware `validateJWT` se aplica globalmente en este router.

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/reviews/me` | Ver mis propias reseñas | Token |
| GET | `/reviews/restaurant/:restaurantId` | Ver reseñas de un restaurante | Token |
| POST | `/reviews/restaurant/:restaurantId` | Crear reseña en un restaurante (rating 1-5) | Token |
| PATCH | `/reviews/:id` | Actualizar reseña propia | Token |
| DELETE | `/reviews/:id` | Eliminar reseña propia | Token |
| POST | `/reviews/:id/reply` | Responder a una reseña | RES_ADMIN_ROLE |

---

### Reports Service (.NET 8)

Todos los paths son relativos a `http://localhost:5000/api/reports`

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| GET | `/health` | Estado del servicio | No |
| GET | `/restaurant/:restaurantId` | Reporte del restaurante (usa caché de 1h) | No |
| GET | `/plataforma` | Estadísticas globales de la plataforma | No |
| DELETE | `/cache/:restaurantId` | Limpiar caché y forzar recálculo inmediato | No |

---

## Instalacion

### Requisitos previos

- Node.js 18 o superior
- pnpm
- MongoDB en ejecución local o remoto
- PostgreSQL (para el Reports Service, se puede levantar con Docker)
- .NET 8 SDK
- Docker (opcional, para PostgreSQL del Reports Service)

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/egomez-2021272/DebuggersEats.git
cd DebuggersEats
```

---

### 2. Configurar variables de entorno

Crear el archivo `.env` en cada servicio Node.js antes de instalar dependencias.

**`authenthication_server/.env`**

```env
PORT=3013
URI_MONGODB=mongodb://localhost:27017/auth-de-debuggers

JWT_SECRET=tu_secreto_seguro
JWT_ISSUER=DebuggersEats
JWT_AUDIENCE=DebuggersEats
JWT_EXPIRES_IN=1h

EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
FRONTEND_URL=http://localhost:5173/debuggersEatsAdmin/v1/auth
```

**`add-restaurant-service/.env`**

```env
PORT=3014
URI_MONGODB=mongodb://localhost:27017/auth-de-debuggers

JWT_SECRET=tu_secreto_seguro
JWT_ISSUER=DebuggersEats
JWT_AUDIENCE=DebuggersEats
JWT_EXPIRES_IN=1h

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_BASE_URL=https://res.cloudinary.com/tu_cloud_name/image/upload/
CLOUDINARY_RESTAURANTS_FOLDER=add-restaurant/restaurants
CLOUDINARY_MENU_FOLDER=add-restaurant/menu
```

**`client-admin/.env`**

```env
VITE_AUTH_URL=http://localhost:3013/debuggersEatsAdmin/v1
VITE_RESTAURANT_URL=http://localhost:3014/add-restaurant/v1
VITE_REPORTS_URL=http://localhost:5000
```

**`reports-service/src/ReportService.Api/appsettings.json`** (ya incluido en el repositorio)

```json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://localhost:27017",
    "PostgreSQL": "Host=localhost;Database=debuggers_reports;Username=IN6AM;Password=Admin!;Port=5438"
  },
  "MongoDB": {
    "DatabaseName": "auth-de-debuggers"
  },
  "Urls": "http://localhost:5000"
}
```

---

### 3. Levantar PostgreSQL con Docker (para Reports Service)

```bash
cd reports-service/debuggers-eats-pg
docker-compose up -d
```

Esto levanta una instancia de PostgreSQL en el puerto `5438` con las credenciales del `appsettings.json`.

---

### 4. Instalar dependencias

Desde la raiz del proyecto se puede instalar todo con un solo comando:

```bash
pnpm run install:all
```

O manualmente por servicio:

```bash
cd authenthication_server && pnpm install
cd ../add-restaurant-service && pnpm install
cd ../client-admin && pnpm install
```

El Reports Service usa NuGet y se restaura automaticamente al ejecutar `dotnet run`.

---

### 5. Iniciar los servicios

**Opcion A — Desde la raiz (todos los servicios a la vez):**

```bash
pnpm run start
```

Usa `concurrently` para levantar los cuatro servicios en una sola terminal con colores y prefijos diferenciados (AUTH, RESTAURANTS, REPORTS, CLIENT).

**Opcion B — Por separado (una terminal por servicio):**

```bash
# Terminal 1 — Authentication Server
cd authenthication_server
pnpm run dev

# Terminal 2 — Restaurant Service
cd add-restaurant-service
pnpm run dev

# Terminal 3 — Reports Service
cd reports-service/src/ReportService.Api
dotnet run

# Terminal 4 — Frontend
cd client-admin
pnpm run dev
```

Al iniciar el Authentication Server por primera vez, el seeder crea automaticamente el usuario administrador si no existe.

Usuario administrador por defecto:
- Username: `admin`
- Password: `Admin123!DebuggersEats`

---

### 6. Acceder a la aplicacion

| Recurso | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Swagger Auth | http://localhost:3013/debuggersEatsAdmin/v1/api-docs |
| Swagger Restaurants | http://localhost:3014/add-restaurant/v1/api-docs |
| Swagger Reports | http://localhost:5000/swagger |
| Health Auth | http://localhost:3013/debuggersEatsAdmin/v1/health |
| Health Restaurants | http://localhost:3014/add-restaurant/v1/health |
| Health Reports | http://localhost:5000/api/reports/health |

---

## Seguridad

El sistema implementa las siguientes medidas de seguridad:

- Autenticación mediante JWT firmado con issuer y audience
- Refresh tokens con detección de reutilización (revoca toda la familia si se detecta robo de sesión)
- Hash de contraseñas con `@node-rs/bcrypt`
- Protección de rutas privadas basada en roles
- Validación de datos de entrada con `express-validator`
- Manejo de errores centralizado por servicio
- Rate limiting en el Authentication Server
- Tokens de activación de cuenta y recuperación de contraseña con expiración
- Tokens JWT de confirmación para reservaciones (24 horas de validez)
- Cabeceras HTTP seguras con Helmet
- Política de CORS configurada por servicio

---

## Creditos

Proyecto base desarrollado por Braulio Echeverría — Curso IN6AM, Kinal Guatemala 2026.

Repositorios originales de referencia:
- https://github.com/IN6AMProm33/server_admin.git
- https://github.com/IN6AMProm33/auth-service-nodejs.git

Referencias tecnicas utilizadas:

- Hash de contraseñas (`@node-rs/bcrypt`): https://github.com/napi-rs/node-rs — OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Nodemailer: https://nodemailer.com/ — Gmail SMTP: https://nodemailer.com/usage/using-gmail/
- Reset de contraseña — OWASP Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html — NIST Digital Identity Guidelines: https://pages.nist.gov/800-63-3/

---

## Licencia

ISC — ver archivo `LICENSE` para detalles completos.