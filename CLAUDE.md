# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Demo de RHEL 10 Image Mode con DevOps Completo**

Este repositorio es una demostración de Netlabs para mostrar el potencial completo de DevOps con RHEL 10 image mode, incluyendo:
- Pipelines de CI/CD automatizados con GitHub Actions
- Revisión de código automatizada
- Chequeos de seguridad integrados
- Pruebas unitarias y de integración
- Construcción y despliegue de imágenes bootc

El objetivo es demostrar a clientes las capacidades avanzadas de desarrollo moderno con RHEL 10 image mode.

## Arquitectura del Demo

### Core Components
- **Containerfile**: Imagen base RHEL 9.6 bootc (preparada para migrar a RHEL 10)
- **GitHub Actions**: Pipeline completo de DevOps con múltiples etapas
- **Security Scanning**: Chequeos de vulnerabilidades en contenedores
- **Code Review**: Automatización de revisiones de código
- **Testing Framework**: Pruebas unitarias y de integración

### Pipeline DevOps Orquestado

**Pipeline Principal** (`main-pipeline.yml`):
1. **Stage 1**: `build_rhel_bootc.yml` - Construcción y push de imagen contenedor
2. **Stage 2 (Paralelo)**:
   - 2a. `security-scan.yml` - Security scanning completo con SARIF  
   - 2b. `code-quality.yml` - Quality gates y linting
3. **Stage 3**: Quality Gate - Evaluación de resultados críticos
4. **Stage 4**: `create_ami.yml` - Creación inteligente de AMI + actualización de instancias
5. **Stage 5**: Post-deployment - Tareas finales y notificaciones

**Workflows Independientes**:
- `pr-checks.yml`: Validación rápida de PRs
- `release.yml`: Orquesta main-pipeline para releases
- `update-instances.yml`: Actualización manual de instancias corriendo

## Comandos de Desarrollo

### Construcción Local
```bash
# Build de imagen bootc (requiere suscripción Red Hat)
podman build -t demo-rhel10-image-mode -f Containerfile .

# Lint del contenedor (integrado en Containerfile)
bootc container lint

# Test local del contenedor
podman run -d -p 8080:80 demo-rhel10-image-mode
```

### GitHub Actions
```bash
# PIPELINE PRINCIPAL (recomendado)
gh workflow run main-pipeline.yml

# Pipeline con opciones específicas
gh workflow run main-pipeline.yml \
  -f force_ami_creation=true \
  -f update_instances=true \
  -f environment=staging

# Deploy por tag (ejecuta pipeline completo)  
git tag v1.0.0 && git push origin v1.0.0

# Release con ambiente específico
gh workflow run release.yml \
  -f release_type=minor \
  -f environment=production

# Workflows individuales (para testing/debugging)
gh workflow run security-scan.yml
gh workflow run code-quality.yml

# Actualizar instancias EC2 manualmente
gh workflow run update-instances.yml \
  -f image_tag=latest \
  -f force_reboot=true

# Ver status de workflows
gh workflow list
gh run list
```

### Testing (cuando se implemente)
```bash
# Pruebas unitarias
npm test  # o pytest, según framework elegido

# Pruebas de integración
npm run test:integration

# Pruebas de seguridad
npm run security:scan
```

## Secrets Requeridos

### Red Hat Subscription & Registry
- `RHT_ORGID`: ID organización Red Hat
- `RHT_ACT_KEY`: Clave de activación
- `SOURCE_REGISTRY_USER`: Usuario registry Red Hat
- `SOURCE_REGISTRY_PASSWORD`: Password registry Red Hat

### AWS (AMI Creation)
- AWS credentials para upload S3 y registro AMI

### Security & Quality (futuro)
- Tokens para herramientas de scanning de seguridad
- Tokens para análisis de calidad de código

## Configuración DevOps

### Variables de Entorno Clave
- `DEST_IMAGE`: `${{ github.actor }}/${{ github.event.repository.name }}`
- `TAGLIST`: `latest ${{ github.sha }} ${{ github.ref_name }}`
- `DEST_REGISTRY_HOST`: `ghcr.io`
- `SOURCE_REGISTRY_HOST`: `registry.redhat.io`

### Imagen Base y Configuración
- **Base**: `registry.redhat.io/rhel9/rhel-bootc:9.6` (migrar a RHEL 10)
- **Usuario**: `bootc-user` (password: `netlabs`, sudo habilitado)
- **Servicios**: httpd habilitado por defecto
- **Puerto**: 80 expuesto para demo web

## Características Demo

### Implementadas
- ✅ Pipeline automatizado de build
- ✅ Gestión automática de suscripciones Red Hat
- ✅ Multi-registry support (Red Hat + GitHub)
- ✅ **Creación inteligente de AMI** (solo si no existe)
- ✅ **Actualización bootc de instancias EC2 corriendo**
- ✅ Container linting integrado
- ✅ **Security scanning completo** (CodeQL, Trivy, Hadolint, Snyk)
- ✅ **PR validation** con fast checks
- ✅ **Code quality gates** (SonarCloud, linting)
- ✅ **Release automation** con deployment staging/production
- ✅ **Dependabot** para updates automáticos

### Por Implementar (roadmap demo)
- 🔄 Migración completa a RHEL 10 image mode
- 🔄 Blue-green deployment completo
- 🔄 Monitoring y observabilidad
- 🔄 Compliance scanning avanzado

## Funcionalidades Avanzadas

### AMI Inteligente
- **Check de existencia**: Solo crea AMI si no existe en AWS
- **Force creation**: Parámetro para forzar creación aunque exista
- **Output consistency**: Retorna AMI ID tanto si es nueva como existente

### Actualización de Instancias EC2
- **Bootc switch**: Actualiza imagen en instancias corriendo sin recrearlas
- **Auto-discovery**: Encuentra instancias por tag `Project=rhel-bootc-demo`
- **SSM integration**: Usa AWS Systems Manager para ejecución remota
- **Scheduled reboots**: Programa reinicio automático para activar imagen
- **Manual workflow**: `update-instances.yml` para actualizaciones on-demand

### Pipeline Orquestado
- **Sequential execution**: Workflows ejecutan en orden definido (build → security/quality → deploy)
- **Parallel optimization**: Security/Quality en paralelo para eficiencia
- **Quality gates**: Evaluación crítica antes de deployment
- **Conditional deployment**: Solo despliega si pasa quality gate
- **Smart workflows**: Pueden ejecutarse individualmente o como parte del pipeline
- **Release automation**: Pipeline completo orquestado para releases

## Notas de Desarrollo

- Containerfile usa formato heredoc para comandos complejos
- Gestión automática de suscripciones (register/unregister)
- Imágenes limpiadas de caches antes de completion
- Web server sirve página de bienvenida en puerto 80
- Instancias EC2 deben tener tag `Project=rhel-bootc-demo` para auto-discovery
- SSM agent requerido en instancias para updates remotos
- Preparado para mostrar capacidades completas de DevOps moderno