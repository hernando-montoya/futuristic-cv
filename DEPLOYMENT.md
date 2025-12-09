# Guía de Despliegue con Portainer

## 📋 Requisitos Previos

- Portainer instalado y funcionando
- Acceso a un repositorio Git (GitHub, GitLab, Bitbucket, etc.)
- Docker y Docker Compose instalados en el servidor

## 🚀 Pasos para Desplegar en Portainer

### 1. Preparar el Repositorio Git

Asegúrate de que tu código esté en un repositorio Git con los siguientes archivos:
- `compose.yml` (archivo principal de Docker Compose)
- `nginx.conf` (configuración de Nginx)
- `index.html`, `admin.html`, `data.json`, etc. (archivos de la aplicación)

### 2. Crear Stack en Portainer

1. **Accede a Portainer** en tu navegador (normalmente `http://tu-servidor:9000`)

2. **Navega a Stacks**:
   - En el menú lateral, selecciona **Stacks**
   - Haz clic en **+ Add stack**

3. **Configura el Stack**:
   - **Name**: `futuristic-cv` (o el nombre que prefieras)
   - **Build method**: Selecciona **Git Repository**

4. **Configuración del Repositorio**:
   - **Repository URL**: Pega la URL de tu repositorio Git
     - Ejemplo: `https://github.com/tu-usuario/futuristic-cv.git`
   - **Repository reference**: `refs/heads/main` (o la rama que uses)
   - **Compose path**: `compose.yml`

5. **Autenticación** (si el repositorio es privado):
   - Activa **Authentication**
   - Proporciona tus credenciales de Git o token de acceso personal

6. **Variables de Entorno** (opcional):
   - Puedes agregar variables de entorno si necesitas personalizar el puerto u otras configuraciones
   - Ejemplo: `PORT=8080`

7. **Haz clic en "Deploy the stack"**

### 3. Verificar el Despliegue

Una vez desplegado:
- El contenedor debería estar ejecutándose
- Accede a tu aplicación en `http://tu-servidor:8080`

### 4. Actualizar la Aplicación

Para actualizar la aplicación después de hacer cambios en Git:

1. Ve a **Stacks** en Portainer
2. Selecciona tu stack `futuristic-cv`
3. Haz clic en **Pull and redeploy**
4. Portainer descargará los últimos cambios y recreará los contenedores

## ⚙️ Configuración Personalizada

### Cambiar el Puerto

Para cambiar el puerto expuesto (por defecto 8080), edita el archivo `compose.yml`:

```yaml
ports:
  - "3000:80"  # Cambia 8080 por el puerto que prefieras
```

### Configuración SSL/HTTPS

Si quieres usar HTTPS, puedes:

1. **Opción 1**: Usar un reverse proxy como Traefik o Nginx Proxy Manager
2. **Opción 2**: Modificar el `compose.yml` para incluir certificados SSL

Ejemplo con certificados SSL:

```yaml
services:
  futuristic-cv:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./:/usr/share/nginx/html:ro
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
      - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
```

## 🔧 Solución de Problemas

### El contenedor no inicia

1. Verifica los logs en Portainer:
   - Ve a **Containers**
   - Selecciona el contenedor `futuristic-cv`
   - Haz clic en **Logs**

2. Verifica que los archivos existan en el repositorio

### No puedo acceder a la aplicación

1. Verifica que el puerto esté abierto en el firewall
2. Comprueba que el contenedor esté en estado "running"
3. Verifica la configuración de red de Docker

### Cambios no se reflejan

1. Asegúrate de hacer commit y push de tus cambios a Git
2. En Portainer, usa **Pull and redeploy** para actualizar
3. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)

## 📊 Monitoreo

Portainer proporciona:
- **Estado del contenedor**: Running, stopped, etc.
- **Uso de recursos**: CPU, memoria, red
- **Logs en tiempo real**: Para debugging
- **Estadísticas**: Gráficos de uso de recursos

## 🔐 Seguridad

Recomendaciones:
- Usa HTTPS en producción
- Configura un firewall para limitar el acceso
- Mantén Nginx actualizado usando `nginx:alpine` (se actualiza automáticamente)
- Considera usar autenticación básica si la aplicación contiene información sensible

## 📝 Notas Adicionales

- El contenedor usa `nginx:alpine` que es una imagen ligera y segura
- Los archivos se montan como solo lectura (`:ro`) por seguridad
- El healthcheck verifica que Nginx esté respondiendo correctamente
- La configuración de caché optimiza la carga de archivos estáticos
