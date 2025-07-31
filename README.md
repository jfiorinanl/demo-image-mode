# netlabs-image-mode-actions

## Repositorio de demostración para builds de imágenes bootc con GitHub Actions

Este repositorio forma parte de una demo de **Netlabs** orientada a mostrar cómo construir imágenes RHEL en modo *bootc* utilizando GitHub Actions. Contiene una plantilla base con un `Containerfile` y un flujo de trabajo que puede adaptarse a distintos entornos o proyectos.

El flujo puede ser ejecutado manualmente o mediante la creación de un tag. En ejecuciones manuales, una de las etiquetas generadas será el nombre de la rama, lo cual puede sobrescribir builds anteriores.

---

## Variables del flujo de trabajo

En la sección `env` del archivo [.github/workflows/build_rhel_bootc.yml](.github/workflows/build_rhel_bootc.yml), se definen múltiples variables que influyen en el comportamiento del build. Algunas provienen del entorno de ejecución y otras deben configurarse como *secrets* dentro del repositorio.

| Variable | Descripción | Valor por defecto | ¿Requiere personalización? |
| -------- | ----------- | ----------------- | --------------------------- |
| `SMDEV_CONTAINER_OFF` | Desactiva el uso de Subscription Manager en el contenedor | `1` | No |
| `RHT_ORGID` | ID de organización para acceder al Subscription Manager de Red Hat |  | Sí |
| `RHT_ACT_KEY` | Clave de activación del Subscription Manager |  | Sí |
| `SOURCE_REGISTRY_HOST` | Host del registro de la imagen base | `registry.redhat.io` | No |
| `SOURCE_REGISTRY_USER` | Usuario del registro (cuenta de servicio) |  | Sí |
| `SOURCE_REGISTRY_PASSWORD` | Contraseña del registro (token) |  | Sí |
| `CONTAINERFILE` | Nombre del archivo de construcción | `Containerfile` | No |
| `DEST_IMAGE` | Imagen destino con nombre de repositorio (`miusuario/mimagen`) | `github-user/github-repo-name` | No |
| `TAGLIST` | Lista de tags a aplicar a la imagen | `latest`, SHA corto, nombre de rama | No |
| `DEST_REGISTRY_HOST` | Registro de destino donde se publicará la imagen | `ghcr.io` | No |
| `DEST_REGISTRY_USER` | Usuario del registro de destino | Usuario de GitHub | No |
| `DEST_REGISTRY_PASSWORD` | Token de acceso al registro de destino | Token de acceso | No |

---

## Acceso a la suscripción durante la compilación

Para instalar paquetes desde los repositorios oficiales de RHEL durante la construcción, el contenedor debe estar temporalmente registrado. Este flujo de trabajo gestiona la suscripción de manera temporal, registrando y anulando el registro automáticamente.

Se recomienda utilizar una **clave de activación** para este fin. Si aún no tenés una suscripción válida, podés solicitar una gratuita para desarrolladores:  
[https://developers.redhat.com/products/rhel/download](https://developers.redhat.com/products/rhel/download)

> Una clave de activación permite registrar un sistema sin exponer usuario y contraseña, facilitando la automatización y aumentando la seguridad.

### Secrets requeridos para la suscripción

Estos valores deben ser configurados como *Actions secrets* dentro del repositorio:

- `RHT_ORGID`: ID de la organización
- `RHT_ACT_KEY`: Nombre de la clave de activación

---

## Acceso a la imagen base

A diferencia de las imágenes UBI, las imágenes base *bootc* requieren autenticación. Para ello, se recomienda generar una **cuenta de servicio para el registro** desde el [portal de clientes de Red Hat](https://access.redhat.com/RegistryAuthentication#registry-service-accounts-for-shared-environments-4).

### Secrets requeridos para el acceso al registro

- `SOURCE_REGISTRY_USER`: Usuario/token (contiene el carácter `|`)
- `SOURCE_REGISTRY_PASSWORD`: Contraseña/token

---

## Recursos adicionales

Este repositorio forma parte de las iniciativas de Netlabs para demostrar pipelines automatizados de construcción de imágenes RHEL en modo bootc, integrando herramientas modernas de CI/CD como GitHub Actions.

Para consultas o colaboración, podés contactarte con nuestro equipo.