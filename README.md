# RHEL 10 Image Mode - Demo DevOps Completo

## 🎯 Descripción

Demo completa de **Netlabs** que muestra las capacidades avanzadas de DevOps con **RHEL 10 image mode**, incluyendo:

- 🚀 **Pipeline DevOps completo** con GitHub Actions
- 🔒 **Security scanning** integrado (CodeQL, Trivy, Snyk)
- 🧪 **Testing automatizado** (estructura, integración, performance)
- 📊 **Quality gates** con SonarCloud
- 🖥️ **AMI inteligente** (solo crea si no existe)
- ⚡ **Updates sin downtime** de instancias EC2 corriendo
- 🎭 **Release automation** con staging/production

---

## 🚀 Setup Paso a Paso

### **Paso 1: Fork/Clone del Repositorio**

```bash
# Fork este repositorio en tu cuenta GitHub
# Luego clonarlo localmente
git clone https://github.com/TU-USERNAME/demo-image-mode.git
cd demo-image-mode
```

### **Paso 2: Configurar GitHub Repository Settings**

#### 2.1 Habilitar GitHub Features
En tu repositorio GitHub, ve a **Settings**:

- ✅ **Security > Code security and analysis**:
  - Dependency graph: ✅ Enable
  - Dependabot alerts: ✅ Enable
  - Dependabot security updates: ✅ Enable
  - Code scanning: ✅ Enable (se habilitará automáticamente con workflows)
  - Secret scanning: ✅ Enable

#### 2.2 Branch Protection (Opcional pero recomendado)
- **Settings > Branches > Add rule** para `main`:
  - ✅ Require status checks before merging
  - ✅ Require branches to be up to date
  - Seleccionar checks: `PR Validation`, `Security Scan`, `Code Quality`

### **Paso 3: Configurar Secrets Requeridos**

Ve a **Settings > Secrets and variables > Actions** y agrega:

#### 🔴 **Red Hat Subscription** (Obligatorio)
```
RHT_ORGID=12345678                    # Tu Organization ID de Red Hat
RHT_ACT_KEY=activation-key-name       # Nombre de tu clave de activación
```

#### 🔴 **Red Hat Registry Access** (Obligatorio)
```
SOURCE_REGISTRY_USER=service-account-name|token    # Cuenta de servicio Red Hat
SOURCE_REGISTRY_PASSWORD=service-account-password  # Password de cuenta de servicio
```

#### 🔴 **AWS Credentials** (Obligatorio para AMI)
```
AWS_ACCESS_KEY_ID=AKIA...             # AWS Access Key
AWS_SECRET_ACCESS_KEY=secret...       # AWS Secret Key
AWS_REGION=us-east-1                  # Región AWS preferida
AWS_S3_BUCKET=mi-bucket-bootc         # Bucket S3 para AMI uploads
```

#### 🟡 **Servicios Opcionales** (Para funcionalidades completas)
```
SONAR_TOKEN=sonar-cloud-token         # Para SonarCloud analysis
SNYK_TOKEN=snyk-api-token            # Para Snyk security scanning
SLACK_WEBHOOK=https://hooks.slack...  # Para notificaciones
EC2_INSTANCE_IDS=i-123,i-456         # IDs de instancias para update (opcional)
```

### **Paso 4: Configurar Variables de Repositorio**

Ve a **Settings > Secrets and variables > Actions > Variables** y agrega:

```
AMI_NAME_PREFIX=netlabs-rhel-bootc    # Prefijo para nombres de AMI
```

---

## 🛠️ **Obtener Credenciales Necesarias**

### **Red Hat Subscription**

1. **Suscripción gratuita**: [Red Hat Developer](https://developers.redhat.com/products/rhel/download)

2. **Obtener Organization ID**:
   ```bash
   # En un sistema RHEL registrado:
   sudo subscription-manager identity
   ```

3. **Crear Activation Key**:
   - Ve a [Red Hat Customer Portal](https://access.redhat.com/management/activation_keys)
   - Create Activation Key → anota el nombre

4. **Cuenta de Servicio para Registry**:
   - Ve a [Registry Service Accounts](https://access.redhat.com/RegistryAuthentication#registry-service-accounts-for-shared-environments-4)
   - Create New → anota username y token

### **AWS Setup**

1. **Crear IAM User** con permisos:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ec2:*",
           "s3:*",
           "ssm:SendCommand",
           "ssm:GetCommandInvocation"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

2. **Crear S3 Bucket** para AMI uploads:
   ```bash
   aws s3 mb s3://mi-bucket-bootc --region us-east-1
   ```

### **Servicios Opcionales**

- **SonarCloud**: [sonarcloud.io](https://sonarcloud.io) → Create token
- **Snyk**: [snyk.io](https://snyk.io) → Account settings → API token

---

## 🎮 **Uso de la Demo**

### **Primera Ejecución**

1. **Trigger del pipeline principal**:
   ```bash
   # Via GitHub UI: Actions > Main DevOps Pipeline > Run workflow
   # O via CLI:
   gh workflow run main-pipeline.yml
   ```

2. **Pipeline ejecuta en secuencia**:
   - 🏗️ **Stage 1**: Build container image
   - 🔒 **Stage 2a**: Security scanning (paralelo)
   - 📊 **Stage 2b**: Code quality analysis (paralelo)  
   - 🧪 **Stage 2c**: Testing pipeline (paralelo)
   - 🚦 **Stage 3**: Quality gate evaluation
   - 🚀 **Stage 4**: Deployment (AMI creation)
   - 📋 **Stage 5**: Post-deployment tasks

3. **Verificar resultados**:
   - ✅ Container image en GitHub Packages
   - ✅ AMI creada en AWS EC2 Console
   - ✅ Security reports en Security tab
   - ✅ Quality reports en Actions summary
   - ✅ Pipeline status completo

### **Testing PR Workflows**

1. **Crear branch y PR**:
   ```bash
   git checkout -b feature/test-pr
   # Hacer cambios al Containerfile
   git add . && git commit -m "test: add new package"
   git push origin feature/test-pr
   # Crear PR en GitHub
   ```

2. **Verificar PR checks**:
   - ✅ PR Validation ejecuta automáticamente
   - ✅ Security scan en paralelo
   - ✅ Quality gates
   - ✅ Comentarios automáticos en PR

### **Release Process**

1. **Manual release**:
   ```bash
   gh workflow run release.yml \
     -f release_type=minor \
     -f environment=production
   ```

2. **Tag-based release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Release pipeline se ejecuta automáticamente
   ```

### **Actualizar Instancias EC2**

1. **Lanzar instancia con AMI creada**:
   ```bash
   # Usar AMI generada por el pipeline
   # Asegurar tag: Project=rhel-bootc-demo
   # Instalar SSM agent si no está presente
   ```

2. **Update manual**:
   ```bash
   gh workflow run update-instances.yml \
     -f image_tag=latest \
     -f force_reboot=true \
     -f reboot_delay_minutes=5
   ```

---

## 📋 **Verificación de Setup**

### **Checklist de Configuración**

- [ ] Secrets configurados (Red Hat + AWS)
- [ ] Variables de repositorio configuradas
- [ ] GitHub security features habilitados
- [ ] S3 bucket creado y accesible
- [ ] IAM permisos configurados

### **Test de Funcionalidad**

```bash
# 1. Test pipeline completo (recomendado)
gh workflow run main-pipeline.yml

# 2. Test componentes individuales (opcional)
gh workflow run security-scan.yml
gh workflow run code-quality.yml  
gh workflow run test-pipeline.yml

# 3. Test con opciones
gh workflow run main-pipeline.yml \
  -f skip_tests=false \
  -f force_ami_creation=true \
  -f update_instances=false \
  -f environment=staging

# 4. Verificar en GitHub:
# - Actions tab: pipeline ejecutándose en secuencia
# - Packages: container image
# - Security: vulnerability reports
# - Pipeline summary: status completo por stages
```

### **Verificación AWS**

```bash
# Verificar AMI creada
aws ec2 describe-images \
  --owners self \
  --filters "Name=name,Values=*rhel-bootc*" \
  --region us-east-1

# Verificar S3 bucket
aws s3 ls s3://mi-bucket-bootc/
```

---

## 🔧 **Workflows Disponibles**

| Workflow | Trigger | Propósito | Orden de Ejecución |
|----------|---------|-----------|-------------------|
| `main-pipeline.yml` | Manual, Push main, Tag | **Pipeline principal orquestador** | **PRIMERO** |
| `build_rhel_bootc.yml` | Llamado por main-pipeline | Build imagen contenedor | Stage 1 |
| `security-scan.yml` | Llamado por main-pipeline, PR | Security scanning | Stage 2a |
| `code-quality.yml` | Llamado por main-pipeline, PR | Quality gates | Stage 2b |
| `test-pipeline.yml` | Llamado por main-pipeline, PR | Testing completo | Stage 2c |
| `create_ami.yml` | Llamado por main-pipeline | Creación AMI + updates | Stage 4 |
| `pr-checks.yml` | PR | Validación rápida PRs | Independiente |
| `release.yml` | Release, Tag | Release automation | Usa main-pipeline |
| `update-instances.yml` | Manual | Update EC2 instances | Independiente |

### **🎯 Pipeline Principal Recomendado**

**Usar `main-pipeline.yml` para todas las ejecuciones principales** - orquesta todos los demás workflows en el orden correcto.

---

## 🎯 **Casos de Uso Demo**

### **Para Clientes**

1. **DevOps Moderno**: Mostrar pipeline completo con quality gates
2. **Security First**: Demostrar scanning automático y compliance
3. **Zero Downtime**: Updates de instancias sin recrear infraestructura
4. **Cost Optimization**: AMI inteligente que no duplica recursos

### **Para Partners**

1. **Integration Showcase**: Múltiples tools (GitHub, AWS, Red Hat)
2. **Automation**: Procesos end-to-end sin intervención manual
3. **Scalability**: Pattern replicable para proyectos reales

---

## 🆘 **Troubleshooting**

### **Errores Comunes**

1. **Build fails con auth error**: Verificar `SOURCE_REGISTRY_*` secrets
2. **Subscription error**: Verificar `RHT_ORGID` y `RHT_ACT_KEY`
3. **AMI creation fails**: Verificar AWS credentials y S3 bucket
4. **SSM command fails**: Verificar SSM agent en instancias EC2

### **Logs y Debugging**

- **Actions logs**: Cada step tiene logs detallados
- **Security reports**: Security tab para vulnerabilities
- **AWS CloudTrail**: Para debugging de operaciones AWS

---

## 📚 **Recursos Adicionales**

- [RHEL Image Mode Documentation](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/composing_installing_and_managing_rhel_for_edge_images/index)
- [Bootc Documentation](https://containers.github.io/bootc/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Red Hat Developer Program](https://developers.redhat.com/)

---

## 🤝 **Soporte**

Para consultas sobre esta demo:
- 📧 Contactar equipo Netlabs
- 🐛 Issues en este repositorio
- 📚 Consultar [CLAUDE.md](./CLAUDE.md) para detalles técnicos

---

**¡La demo está lista para mostrar el poder completo de DevOps con RHEL 10 image mode!** 🚀