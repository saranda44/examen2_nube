# Examen 2 - Cloud Notes en Kubernetes

Sistema de gestión de notas de venta migrado a una arquitectura de microservicios desplegada en **Amazon EKS**. La aplicación permite administrar clientes, domicilios, productos y notas de venta. Al crear una nota, se genera automáticamente un PDF, se almacena en S3 y se notifica al cliente por correo electrónico.

---

## Estructura de carpetas

```
examen2_nube/
├── docker-compose.yml          # Build y push de las 4 imágenes a Docker Hub
├── README.md
│
├── services/                   # Código de los 4 servicios
│   ├── api/                    # API REST (CRUD + publish a SQS)
│   ├── pdf-generator/          # Genera PDFs y los sube a S3
│   ├── notifier/               # Envía correos vía SNS
│   └── receipt-worker/         # Consume SQS y orquesta el flujo
│
├── infra/                      # Infraestructura AWS (scripts bash)
│   ├── .env.example
│   ├── ddl.sql                 # DDL de la base de datos
│   ├── 01-create-rds.sh
│   ├── 02-create-s3.sh
│   ├── 03-create-sqs.sh
│   ├── 04-create-sns.sh
│   ├── 05-create-secrets.sh
│   ├── 06-init-database.sh
│   ├── deploy-all.sh           # Script maestro
│   └── destroy-all.sh
│
└── k8s/                        # Manifiestos de Kubernetes
    ├── cluster.yaml            # Configuración del cluster EKS
    ├── create-cluster.sh
    ├── destroy-cluster.sh
    ├── configmap.yaml
    ├── api-deployment.yaml
    ├── api-service.yaml
    ├── pdf-generator-deployment.yaml
    ├── pdf-generator-service.yaml
    ├── notifier-deployment.yaml
    ├── notifier-service.yaml
    ├── receipt-worker-deployment.yaml
    └── deploy-k8s.sh           # Aplica todos los manifiestos
```

---
## Despliegue del sistema

### Pre-requisitos

En tu máquina local:

```bash
eksctl version           # eksctl
kubectl version --client # kubectl
docker --version         # docker
psql --version           # postgresql-client
```

Configurar credenciales de AWS Learner Lab en `~/.aws/credentials`.

### Paso 1: Configurar variables

```bash
cp infra/.env.example infra/.env
# Editar infra/.env y cambiar nombre de servicios y RDS_DB_PASSWORD a una contraseña segura
```

### Paso 2: Crear infraestructura AWS 

Crea RDS, S3, SQS, SNS, Secrets Manager e inicializa la base de datos.

```bash
bash infra/deploy-all.sh
```

### Paso 3: Build y push de imágenes

Construye las 4 imágenes Docker y las sube a Docker Hub.

```bash
docker compose build && docker compose push
```

### Paso 4: Crear cluster EKS

```bash
bash k8s/07-create-cluster.sh
```

### Paso 5: Aplicar manifiestos

Aplica ConfigMap, Services, Deployments. Al final crea el secreto `examen2-api-url` con la URL del LoadBalancer.

```bash
bash k8s/08-deploy-k8s.sh
```

### Verificación

```bash
# Estado de los pods
kubectl get pods

# URL del api
kubectl get service api-service

# Logs en tiempo real del receipt-worker
kubectl logs -l app=receipt-worker -f
```

### Limpieza

Cuando termines:

```bash
bash k8s/destroy-cluster.sh
bash infra/destroy-all.sh
```

---

## Imágenes Docker

- [saranda06/api-examen2](https://hub.docker.com/r/saranda06/api-examen2)
- [saranda06/pdf-generator-examen2](https://hub.docker.com/r/saranda06/pdf-generator-examen2)
- [saranda06/notifier-examen2](https://hub.docker.com/r/saranda06/notifier-examen2)
- [saranda06/receipt-worker-examen2](https://hub.docker.com/r/saranda06/receipt-worker-examen2)

---

## Servicios utilizados

### Servicios AWS

| Servicio | Uso |
|---|---|
| **EKS** | Cluster de Kubernetes donde corren los 4 pods |
| **RDS PostgreSQL** | Base de datos relacional (clientes, domicilios, productos, notas, nota_detalle) |
| **SQS** | Cola para comunicar `api` con `receipt-worker` |
| **S3** | Almacenamiento de los PDFs generados con metadatos |
| **SNS** | Envío de correos a clientes con FilterPolicy por `cliente_id` |
| **Secrets Manager** | Almacenamiento de credenciales y configuración sensible |
| **ELB (Elastic Load Balancer)** | Provisionado automáticamente por el Service tipo LoadBalancer |

### Pods en Kubernetes

| Pod | Tipo de Service | Puerto |
|---|---|---|
| `api` | LoadBalancer | 8080 |
| `pdf-generator` | ClusterIP | 8081 |
| `notifier` | ClusterIP | 8082 |
| `receipt-worker` | Sin Service | — |

---

## Explicación de cada servicio

### `api`
API REST en Node.js + Express + TypeScript. Único pod expuesto al exterior mediante un LoadBalancer. Maneja el CRUD completo de clientes, domicilios, productos y notas. Al crear una nota, publica un mensaje a SQS con el `notaId` y responde inmediatamente al cliente sin esperar el flujo asíncrono.

### `receipt-worker`
Worker sin servidor HTTP. Hace polling continuo a SQS con long polling de 20 segundos. Por cada mensaje recibido consulta la nota completa en RDS y orquesta dos llamadas HTTP secuenciales: primero a `pdf-generator` para generar el PDF, luego a `notifier` para enviar el correo. Si cualquier paso falla, no borra el mensaje de SQS y SQS lo reintenta automáticamente después del VisibilityTimeout.

### `pdf-generator`
Servicio HTTP que recibe los datos completos de una nota y genera el PDF con la librería PDFKit. Sube el PDF a S3 con tres metadatos requeridos (`hora-envio`, `nota-descargada: false`, `veces-enviado: 1`) y devuelve la URL del objeto.

### `notifier`
Servicio HTTP que envía notificaciones por correo. Verifica si el cliente ya tiene suscripción confirmada al topic SNS; si no, lo suscribe con un FilterPolicy basado en su `cliente_id`. Publica el mensaje incluyendo el `cliente_id` como MessageAttribute para que SNS entregue el correo solo al cliente correspondiente. Después actualiza los metadatos del PDF en S3 (incrementa `veces-enviado` y refresca `hora-envio`).

---

## Endpoints

### `api` (expuesto al exterior)

#### Health check
- `GET /health` — devuelve `{status: "ok"}`

#### Clientes
- `GET /api/clientes` — lista todos los clientes
- `GET /api/clientes/:id` — obtiene cliente por id (con sus domicilios)
- `POST /api/clientes` — crea cliente
- `PUT /api/clientes/:id` — actualiza cliente
- `DELETE /api/clientes/:id` — elimina cliente

#### Domicilios
- `GET /api/domicilios` — lista todos los domicilios
- `GET /api/domicilios/:id` — obtiene domicilio por id
- `GET /api/domicilios/clientes/:id` — domicilios de un cliente
- `POST /api/domicilios` — crea domicilio
- `PUT /api/domicilios/:id` — actualiza domicilio
- `DELETE /api/domicilios/:id` — elimina domicilio

#### Productos
- `GET /api/productos` — lista todos los productos
- `GET /api/productos/:id` — obtiene producto por id
- `POST /api/productos` — crea producto
- `PUT /api/productos/:id` — actualiza producto
- `DELETE /api/productos/:id` — elimina producto

#### Notas
- `GET /api/notas/:id` — obtiene nota completa con cliente, domicilios y detalle
- `POST /api/notas` — crea nota (publica mensaje a SQS para flujo asíncrono)
- `GET /api/notas/:rfc/:folio/descargar` — descarga el PDF y actualiza el metadato `nota-descargada: true`

### `pdf-generator` (interno)
- `POST /generate` — recibe los datos de una nota, genera el PDF y lo sube a S3. Devuelve `{key, url}`
- `GET /health`

### `notifier` (interno)
- `POST /notify` — recibe `{cliente_id, email, rfc, folio}`, suscribe al cliente si es necesario, publica el correo y actualiza metadatos de S3
- `GET /health`

### `receipt-worker`
No expone endpoints. Solo consume mensajes de SQS.

---

## Flujo del sistema

1. El cliente hace `POST /api/notas` desde Postman
2. El **api** crea la nota en RDS dentro de una transacción y publica un mensaje a **SQS** con el `notaId`
3. El **api** responde 201 al cliente inmediatamente con la nota creada
4. El **receipt-worker** recibe el mensaje de SQS por long polling
5. El **receipt-worker** consulta la nota completa en **RDS** (con joins de cliente, domicilios y detalle)
6. El **receipt-worker** llama por HTTP al **pdf-generator** con los datos completos
7. El **pdf-generator** genera el PDF con PDFKit y lo sube a **S3** con los metadatos requeridos
8. El **receipt-worker** llama por HTTP al **notifier**
9. El **notifier** verifica/crea la suscripción al topic SNS con FilterPolicy basado en `cliente_id` y publica el mensaje
10. El cliente recibe el correo con el link al endpoint de descarga
11. Al descargar, el **api** obtiene el PDF de S3 y actualiza el metadato `nota-descargada` a `true`

---

