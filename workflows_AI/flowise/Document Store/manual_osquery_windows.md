## Base de Conocimiento Osquery - Exclusivo para Windows

## SECCIÓN A: LÓGICA DE POLÍTICAS EN FLEET (CUMPLIMIENTO)
Esta sección contiene las reglas OBLIGATORIAS para generar políticas en Fleet. NUNCA inventes tablas. Usa únicamente las tablas de la SECCIÓN B.

**Regla de Pasa/Falla (Pass/Fail):**
* En Fleet, una política se considera "Incumplida" (Falla) si la consulta SQL **SÍ** devuelve resultados.
* Una política se considera "Cumplida" (Pasa) si la consulta SQL **NO** devuelve resultados (está vacía).
* **Ejemplo correcto para prohibir un puerto:** `SELECT pid, port FROM listening_ports WHERE port = 333;`. (Si devuelve datos, alguien está usando el puerto y la política falla, que es exactamente lo que queremos alertar).

**Estructura Obligatoria de la Política:**
Siempre que se te pida crear una política, debes construir un JSON con estos 5 parámetros:
1. `name`: Nombre descriptivo de la regla.
2. `query`: Consulta SQL validada con las tablas de la SECCIÓN B.
3. `description`: Explicación clara del riesgo.
4. `resolution`: Pasos para que el usuario o el equipo de soporte arregle el problema.
5. `platform`: Siempre escribe "windows".

---

## SECCIÓN B: DICCIONARIO DE TABLAS OSQUERY

## 1. Tabla: `os_version`
**Descripción:** Devuelve la versión exacta, edición y compilación del sistema operativo Windows.
**Columnas:**
* `name` (TEXT): Nombre del sistema operativo (ej. Microsoft Windows 11 Pro).
* `version` (TEXT): Versión del SO.
* `major` (INTEGER): Versión mayor.
* `minor` (INTEGER): Versión menor.
* `build` (TEXT): Número de compilación (ej. 22631).
* `arch` (TEXT): Arquitectura (ej. 64-bit).

## 2. Tabla: `programs`
**Descripción:** Lista el software instalado en el sistema Windows (aparece en "Agregar o quitar programas").
**Columnas:**
* `name` (TEXT): Nombre del programa instalado.
* `version` (TEXT): Versión del programa.
* `install_location` (TEXT): Ruta donde está instalado.
* `install_date` (TEXT): Fecha de instalación (formato YYYYMMDD).
* `publisher` (TEXT): Empresa creadora del software.

## 3. Tabla: `patches`
**Descripción:** Lista los parches de seguridad de Windows Update (Hotfixes) aplicados al sistema.
**Columnas:**
* `hotfix_id` (TEXT): Identificador del parche (ej. KB5034441).
* `installed_on` (TEXT): Fecha en la que se instaló el parche.
* `description` (TEXT): Descripción del parche (ej. Update, Security Update).
* `caption` (TEXT): Título breve del parche.

## 4. Tabla: `users`
**Descripción:** Muestra los usuarios locales configurados en el sistema Windows.
**Columnas:**
* `uid` (BIGINT): User ID.
* `username` (TEXT): Nombre de inicio de sesión del usuario.
* `description` (TEXT): Descripción de la cuenta.
* `directory` (TEXT): Ruta de la carpeta principal del usuario.
* `type` (TEXT): Tipo de cuenta (ej. local).

## 5. Tabla: `services`
**Descripción:** Lista todos los servicios de Windows (ejecutándose o detenidos).
**Columnas:**
* `name` (TEXT): Nombre corto del servicio.
* `display_name` (TEXT): Nombre visible del servicio en la consola.
* `status` (TEXT): Estado actual (ej. RUNNING, STOPPED).
* `start_type` (TEXT): Tipo de inicio (ej. AUTO, DEMAND, DISABLED).
* `path` (TEXT): Ruta al ejecutable del servicio.

## 6. Tabla: `listening_ports`
**Descripción:** Muestra los puertos de red que están abiertos y escuchando conexiones en el equipo.
**Columnas:**
* `pid` (INTEGER): ID del proceso asociado al puerto.
* `port` (INTEGER): Número del puerto abierto.
* `protocol` (INTEGER): Protocolo utilizado (TCP o UDP).
* `address` (TEXT): Dirección IP en la que está escuchando.

## 7. Tabla: `scheduled_tasks`
**Descripción:** Tareas programadas en Windows. Útil para buscar persistencia de malware o rutinas de mantenimiento.
**Columnas:**
* `name` (TEXT): Nombre de la tarea.
* `action` (TEXT): Ejecutable o comando que lanza la tarea.
* `path` (TEXT): Ruta de la tarea en el programador.
* `enabled` (INTEGER): 1 si está activa, 0 si está deshabilitada.
* `state` (TEXT): Estado (ej. READY, RUNNING).

## 8. Tabla: `processes`
**Descripción:** Lista todos los procesos que se están ejecutando actualmente en el sistema.
**Columnas:**
* `pid` (BIGINT): ID del proceso.
* `name` (TEXT): Nombre del ejecutable del proceso.
* `path` (TEXT): Ruta completa al archivo ejecutable.
* `cmdline` (TEXT): Argumentos exactos con los que se lanzó el proceso.
* `parent` (BIGINT): PID del proceso padre.
* `resident_size` (BIGINT): Memoria utilizada por el proceso.

## 9. Tabla: `uptime`
**Descripción:** Indica cuánto tiempo ha estado encendida la computadora desde el último reinicio.
**Columnas:**
* `days` (INTEGER): Días transcurridos.
* `hours` (INTEGER): Horas transcurridas.
* `minutes` (INTEGER): Minutos transcurridos.
* `total_seconds` (BIGINT): Segundos totales de actividad.

## 10. Tabla: `drivers`
**Descripción:** Lista todos los controladores (drivers) instalados en Windows y su estado.
**Columnas:**
* `name` (TEXT): Nombre del controlador.
* `display_name` (TEXT): Nombre descriptivo.
* `status` (TEXT): Estado actual (ej. OK, Error).
* `state` (TEXT): Estado de ejecución (ej. Running, Stopped).
* `path` (TEXT): Ruta al archivo .sys del controlador.

## 11. Tabla: `groups`
**Descripción:** Muestra los grupos de usuarios locales definidos en el sistema.
**Columnas:**
* `gid` (BIGINT): ID del grupo.
* `groupname` (TEXT): Nombre del grupo.
* `comment` (TEXT): Descripción del propósito del grupo.

## 12. Tabla: `logical_drives`
**Descripción:** Información sobre las unidades de disco lógicas (C:, D:, etc.) y su espacio.
**Columnas:**
* `device_id` (TEXT): Letra de la unidad.
* `type` (TEXT): Tipo de unidad (ej. Local Disk).
* `free_space` (BIGINT): Espacio libre en bytes.
* `size` (BIGINT): Tamaño total en bytes.
* `file_system` (TEXT): Sistema de archivos (ej. NTFS).

## 13. Tabla: `etc_hosts`
**Descripción:** Contenido del archivo hosts de Windows. Útil para detectar redirecciones maliciosas.
**Columnas:**
* `address` (TEXT): Dirección IP mapeada.
* `hostnames` (TEXT): Nombres de dominio asociados.

## 14. Tabla: `startup_items`
**Descripción:** Aplicaciones que se inician automáticamente al encender Windows.
**Columnas:**
* `name` (TEXT): Nombre del ítem de inicio.
* `path` (TEXT): Ruta al ejecutable o comando.
* `type` (TEXT): Ubicación (ej. Registry, Startup Folder).
* `status` (TEXT): Si está habilitado o deshabilitado.

## 15. Tabla: `bitlocker_info`
**Descripción:** Muestra el estado de cifrado de BitLocker en las unidades del sistema.
**Columnas:**
* `device_id` (TEXT): Letra de la unidad.
* `protection_status` (INTEGER): 1 si está activa, 0 si está desactivada.
* `encryption_method` (TEXT): Algoritmo de cifrado (ej. AES 256).
* `percentage_encrypted` (TEXT): Porcentaje de cifrado completado.

## 16. Tabla: `certificates`
**Descripción:** Lista los certificados instalados en los almacenes del sistema.
**Columnas:**
* `common_name` (TEXT): Nombre común del certificado.
* `issuer` (TEXT): Quién emitió el certificado.
* `not_valid_after` (DATETIME): Fecha de expiración.
* `path` (TEXT): Ubicación del almacén de certificados.

## 17. Tabla: `shared_resources`
**Descripción:** Lista las carpetas y recursos compartidos en la red desde el equipo.
**Columnas:**
* `name` (TEXT): Nombre del recurso compartido.
* `path` (TEXT): Ruta local de la carpeta compartida.
* `description` (TEXT): Descripción del recurso.

## 18. Tabla: `system_info`
**Descripción:** Información general del hardware y la identificación del equipo.
**Columnas:**
* `hostname` (TEXT): Nombre de la computadora.
* `cpu_brand` (TEXT): Modelo del procesador.
* `physical_memory` (BIGINT): Memoria RAM total en bytes.
* `hardware_vendor` (TEXT): Fabricante (ej. Dell, HP).
* `hardware_model` (TEXT): Modelo específico del equipo.

## 19. Tabla: `windows_security_center`
**Descripción:** Muestra el estado de salud reportado por el Centro de Seguridad de Windows.
**Columnas:**
* `firewall` (TEXT): Estado del Firewall.
* `antivirus` (TEXT): Estado del Antivirus principal.
* `autoupdate` (TEXT): Estado de las actualizaciones automáticas.

## 20. Tabla: `connectivity`
**Descripción:** Verifica si el equipo tiene salida a internet y el estado de la conexión.
**Columnas:**
* `disconnected` (INTEGER): 1 si no hay conexión, 0 si está conectado.
* `ipv4_count` (INTEGER): Cantidad de direcciones IPv4 activas.

## 21. Tabla: `interface_addresses`
**Descripción:** Lista las direcciones IP asignadas a cada interfaz de red.
**Columnas:**
* `interface` (TEXT): Nombre de la interfaz.
* `address` (TEXT): Dirección IP.
* `mask` (TEXT): Máscara de subred.

## 22. Tabla: `video_info`
**Descripción:** Información sobre la tarjeta gráfica y el adaptador de video.
**Columnas:**
* `color_depth` (INTEGER): Profundidad de color.
* `manufacturer` (TEXT): Fabricante del chip de video.
* `model` (TEXT): Modelo de la tarjeta de video.
* `series` (TEXT): Serie del hardware.

## 23. Tabla: `arp_cache`
**Descripción:** Muestra la caché del Protocolo de Resolución de Direcciones (ARP). Útil para detectar envenenamiento ARP en la red local.
**Columnas:**
* `address` (TEXT): Dirección IP de destino IPv4.
* `mac` (TEXT): Dirección MAC física (ej. 00:11:22:33:44:55).
* `interface` (TEXT): Nombre de la interfaz de red asociada.
* `state` (TEXT): Estado de la entrada en la caché (ej. dynamic, static).

## 24. Tabla: `autoexec`
**Descripción:** Registra elementos históricos de inicio en Windows (ejecutables de arranque automático).
**Columnas:**
* `path` (TEXT): Ruta al archivo ejecutable.
* `name` (TEXT): Nombre del ítem de arranque.
* `source` (TEXT): Ubicación o clave de registro que origina el arranque.

## 25. Tabla: `dns_cache`
**Descripción:** Muestra las resoluciones de nombres de dominio (DNS) cacheadas en el sistema. Ideal para rastrear conexiones a dominios maliciosos (C2).
**Columnas:**
* `name` (TEXT): Nombre de dominio resuelto.
* `type` (TEXT): Tipo de registro DNS (ej. A, AAAA).
* `flags` (TEXT): Opciones de la resolución.

## 26. Tabla: `hash`
**Descripción:** Genera firmas criptográficas (hashes) de un archivo específico en el sistema para detectar malware conocido. Requiere la cláusula JOIN o especificar el `path`.
**Columnas:**
* `path` (TEXT): Ruta completa al archivo.
* `directory` (TEXT): Directorio del archivo.
* `md5` (TEXT): Hash MD5.
* `sha1` (TEXT): Hash SHA-1.
* `sha256` (TEXT): Hash SHA-256.

## 27. Tabla: `ie_extensions`
**Descripción:** Extensiones y complementos instalados en Internet Explorer/Edge (modo compatibilidad).
**Columnas:**
* `name` (TEXT): Nombre de la extensión.
* `path` (TEXT): Ruta a la DLL o archivo de la extensión.
* `version` (TEXT): Versión del complemento.

## 28. Tabla: `logged_in_users`
**Descripción:** Usuarios que tienen una sesión activa actualmente en el sistema operativo.
**Columnas:**
* `user` (TEXT): Nombre del usuario logueado.
* `tty` (TEXT): Consola o terminal asociada a la sesión.
* `host` (TEXT): Nombre del host remoto (si es por red).
* `time` (INTEGER): Timestamp de cuándo inició sesión.
* `pid` (INTEGER): ID del proceso de la sesión.

## 29. Tabla: `logon_sessions`
**Descripción:** Detalles avanzados sobre las sesiones de inicio de sesión de Windows.
**Columnas:**
* `logon_id` (INTEGER): ID único de la sesión.
* `user` (TEXT): Cuenta de usuario asociada.
* `logon_type` (INTEGER): Tipo de inicio (ej. 2 = Interactivo, 3 = Red, 10 = RDP).
* `authentication_package` (TEXT): Protocolo de autenticación (ej. NTLM, Kerberos).

## 30. Tabla: `memory_info`
**Descripción:** Información sobre el uso de memoria RAM a nivel de sistema.
**Columnas:**
* `memory_total` (BIGINT): Memoria física total disponible.
* `memory_free` (BIGINT): Memoria libre actual.
* `buffers` (BIGINT): Memoria utilizada para búferes.
* `cached` (BIGINT): Memoria cacheada por el sistema.

## 31. Tabla: `pipes`
**Descripción:** Tuberías con nombre (Named Pipes) activas en Windows. Muy usado por atacantes para comunicación lateral (ej. Cobalt Strike).
**Columnas:**
* `pid` (BIGINT): Process ID que posee el pipe.
* `name` (TEXT): Nombre interno del pipe.
* `instances` (INTEGER): Número de instancias concurrentes de este pipe.

## 32. Tabla: `process_envs`
**Descripción:** Variables de entorno asociadas a cada proceso en ejecución.
**Columnas:**
* `pid` (INTEGER): ID del proceso.
* `key` (TEXT): Nombre de la variable de entorno.
* `value` (TEXT): Valor actual de la variable.

## 33. Tabla: `process_memory_map`
**Descripción:** Mapeo detallado de la memoria asignada a procesos específicos.
**Columnas:**
* `pid` (INTEGER): ID del proceso objetivo.
* `start` (TEXT): Dirección de memoria de inicio (Hex).
* `end` (TEXT): Dirección de memoria final (Hex).
* `permissions` (TEXT): Permisos del bloque (ej. rwx, r-x).
* `offset` (BIGINT): Desplazamiento en la memoria.
* `path` (TEXT): Archivo mapeado en esa dirección.

## 34. Tabla: `process_open_sockets`
**Descripción:** Conexiones de red activas (sockets) abiertas por un proceso específico. Vital para auditorías de red.
**Columnas:**
* `pid` (INTEGER): ID del proceso.
* `fd` (BIGINT): Descriptor de archivo del socket.
* `socket` (BIGINT): ID del socket interno.
* `family` (INTEGER): Familia de red (ej. IPv4 = 2).
* `protocol` (INTEGER): Protocolo (TCP = 6, UDP = 17).
* `local_address` (TEXT): IP local.
* `remote_address` (TEXT): IP de destino conectada.
* `local_port` (INTEGER): Puerto local abierto.
* `remote_port` (INTEGER): Puerto remoto de destino.

## 35. Tabla: `registry`
**Descripción:** Interfaz para consultar y leer valores directamente desde el Editor del Registro de Windows (Regedit).
**Columnas:**
* `path` (TEXT): Ruta completa de la clave de registro.
* `name` (TEXT): Nombre del valor específico.
* `type` (TEXT): Tipo de dato (ej. REG_SZ, REG_DWORD).
* `data` (TEXT): Contenido o valor guardado.
* `mtime` (BIGINT): Timestamp de última modificación.

## 36. Tabla: `windows_crashes`
**Descripción:** Lista de bloqueos del sistema o aplicaciones recientes (Crash Dumps).
**Columnas:**
* `datetime` (TEXT): Fecha y hora del fallo.
* `module` (TEXT): Módulo o DLL que causó el crash.
* `path` (TEXT): Ruta al archivo de volcado de memoria.
* `type` (TEXT): Tipo de crash (aplicación o sistema).

## 37. Tabla: `windows_eventlog`
**Descripción:** Acceso a los registros de eventos de Windows (Visor de Eventos). Requiere filtrar por `channel`.
**Columnas:**
* `channel` (TEXT): Canal del evento (ej. Security, Application, System).
* `eventid` (INTEGER): ID único del evento de Windows (ej. 4624 para Logon).
* `provider_name` (TEXT): Servicio que emitió el evento.
* `datetime` (TEXT): Fecha de registro.
* `data` (TEXT): Detalles técnicos del evento en crudo.

## 38. Tabla: `windows_firewall_rules`
**Descripción:** Reglas activas configuradas en el Firewall de Windows Defender.
**Columnas:**
* `action` (TEXT): Acción de la regla (ej. Allow, Block).
* `direction` (TEXT): Dirección del tráfico (ej. In, Out).
* `name` (TEXT): Nombre descriptivo de la regla.
* `app_name` (TEXT): Aplicación a la que aplica la regla.
* `local_ports` (TEXT): Puertos locales afectados.
* `remote_ports` (TEXT): Puertos remotos afectados.

## 39. Tabla: `windows_optional_features`
**Descripción:** Características y roles opcionales de Windows (activadas o desactivadas).
**Columnas:**
* `name` (TEXT): Nombre del componente interno.
* `caption` (TEXT): Nombre visible para el usuario.
* `state` (INTEGER): 1 si está instalado/activo, 0 si no.

## 40. Tabla: `wmi_cli_event_consumers`
**Descripción:** Consumidores de eventos WMI por línea de comandos. Frecuentemente abusado para persistencia de malware "fileless".
**Columnas:**
* `name` (TEXT): Nombre del consumidor WMI.
* `command_line_template` (TEXT): Comando o payload a ejecutar.
* `executable_path` (TEXT): Ruta del ejecutable llamado.

## 41. Tabla: `wmi_script_event_consumers`
**Descripción:** Consumidores de eventos WMI basados en scripts (VBScript/JScript). Otra técnica de persistencia oculta.
**Columnas:**
* `name` (TEXT): Nombre del consumidor WMI.
* `scripting_engine` (TEXT): Motor usado (ej. VBScript).
* `script_text` (TEXT): Código crudo del script ejecutado.

## 42. Tabla: `user_groups`
**Descripción:** Tabla de relación (mapping) entre usuarios locales y grupos a los que pertenecen.
**Columnas:**
* `uid` (BIGINT): User ID.
* `gid` (BIGINT): Group ID.

## 43. Tabla: `time`
**Descripción:** Obtiene la fecha, hora y zona horaria actual del equipo remoto.
**Columnas:**
* `weekday` (TEXT): Día de la semana.
* `year` (INTEGER): Año actual.
* `month` (INTEGER): Mes actual.
* `day` (INTEGER): Día actual.
* `hour` (INTEGER): Hora en formato 24h.
* `minutes` (INTEGER): Minutos actuales.
* `seconds` (INTEGER): Segundos actuales.

## 44. Tabla: `cpu_time`
**Descripción:** Estadísticas detalladas de tiempo de uso y carga por cada núcleo del procesador.
**Columnas:**
* `core` (INTEGER): Número del núcleo físico/lógico.
* `user` (BIGINT): Tiempo procesando tareas de usuario.
* `nice` (BIGINT): Tiempo en procesos de baja prioridad.
* `system` (BIGINT): Tiempo procesando tareas del kernel.
* `idle` (BIGINT): Tiempo en estado de reposo.

## 45. Tabla: `cpuid`
**Descripción:** Extrae las características avanzadas y flags soportadas por el procesador del equipo.
**Columnas:**
* `feature` (TEXT): Nombre de la instrucción o característica (ej. VMX para virtualización).
* `value` (TEXT): Valor del registro (1 si está soportado, 0 si no).

## 46. Tabla: `ntdomains`
**Descripción:** Información sobre la pertenencia a un dominio de Active Directory o red de trabajo.
**Columnas:**
* `name` (TEXT): Nombre del dominio o Workgroup.
* `client_site_name` (TEXT): Sitio del cliente en AD.
* `dc_site_name` (TEXT): Sitio del controlador de dominio.
* `dns_forest_name` (TEXT): Nombre del bosque DNS raíz.
* `domain_controller_address` (TEXT): Dirección IP del servidor de dominio.

## 47. Tabla: `python_packages`
**Descripción:** Lista de paquetes y dependencias instaladas en el entorno Python global del equipo.
**Columnas:**
* `name` (TEXT): Nombre del paquete (ej. requests, urllib3).
* `version` (TEXT): Versión instalada.
* `path` (TEXT): Ruta de instalación.
* `summary` (TEXT): Descripción breve del paquete.

## 48. Tabla: `npm_packages`
**Descripción:** Lista de paquetes de Node.js instalados globalmente mediante npm.
**Columnas:**
* `name` (TEXT): Nombre del paquete Node.
* `version` (TEXT): Versión del módulo instalada.
* `path` (TEXT): Ubicación en el disco.
* `description` (TEXT): Información sobre el paquete.

## 49. Tabla: `wmi_event_filters`
**Descripción:** Filtros WMI que establecen condiciones (triggers) para ejecutar consumidores WMI.
**Columnas:**
* `name` (TEXT): Nombre del filtro.
* `query` (TEXT): Condición WQL (WMI Query Language) que activa el evento.
* `query_language` (TEXT): Lenguaje de la consulta (normalmente WQL).

## 50. Tabla: `wmi_filter_consumer_binding`
**Descripción:** Tabla que vincula un trigger (Event Filter) con una carga útil (Event Consumer) en WMI.
**Columnas:**
* `filter` (TEXT): Ruta del filtro WMI que activa la acción.
* `consumer` (TEXT): Ruta del consumidor WMI (acción/script) a ejecutar.


## 51. Tabla: `appcompat_shims`
**Descripción:** Lista los Application Compatibility Shims instalados. Los atacantes suelen instalar shims maliciosos para inyectar código o evadir detecciones.
**Columnas:**
* `executable` (TEXT): Archivo ejecutable al que se le aplica el shim.
* `path` (TEXT): Ruta a la base de datos del shim (.sdb).
* `description` (TEXT): Descripción de la corrección de compatibilidad.
* `install_time` (INTEGER): Timestamp de instalación.
* `type` (TEXT): Tipo de shim aplicado.

## 52. Tabla: `authenticode`
**Descripción:** Verifica las firmas digitales (Authenticode) de los archivos ejecutables. Ideal para encontrar malware sin firmar o firmas falsificadas.
**Columnas:**
* `path` (TEXT): Ruta al archivo a verificar.
* `original_program_name` (TEXT): Nombre original guardado en la firma.
* `serial_number` (TEXT): Número de serie del certificado.
* `issuer_name` (TEXT): Entidad certificadora que emitió la firma.
* `subject_name` (TEXT): A quién pertenece la firma.
* `result` (TEXT): Estado de la verificación (ej. "trusted", "expired").

## 53. Tabla: `background_activities_moderator`
**Descripción:** Extrae información del Background Activity Moderator (BAM) del registro. Muestra el historial de ejecución de programas, incluso si fueron borrados.
**Columnas:**
* `path` (TEXT): Ruta del ejecutable.
* `execution_time` (INTEGER): Timestamp de la última vez que se ejecutó.
* `sid` (TEXT): SID del usuario que ejecutó el archivo.

## 54. Tabla: `chrome_extensions`
**Descripción:** Lista las extensiones instaladas en los perfiles de Google Chrome. Útil para auditar extensiones maliciosas o filtración de datos.
**Columnas:**
* `uid` (BIGINT): User ID asociado al perfil del navegador.
* `name` (TEXT): Nombre de la extensión.
* `version` (TEXT): Versión instalada.
* `description` (TEXT): Descripción breve.
* `path` (TEXT): Ruta local donde reside la extensión.

## 55. Tabla: `cpu_info`
**Descripción:** Proporciona detalles físicos y lógicos sobre el procesador del sistema.
**Columnas:**
* `device_id` (TEXT): Identificador del socket (ej. CPU0).
* `model` (TEXT): Modelo exacto del procesador.
* `logical_processors` (INTEGER): Número de hilos/núcleos lógicos.
* `max_clock_speed` (INTEGER): Velocidad máxima del reloj en MHz.

## 56. Tabla: `default_environment`
**Descripción:** Variables de entorno por defecto configuradas a nivel del sistema operativo.
**Columnas:**
* `variable` (TEXT): Nombre de la variable (ej. PATH, TEMP).
* `value` (TEXT): Contenido de la variable.
* `expand` (INTEGER): 1 si requiere expansión, 0 si no.

## 57. Tabla: `disk_info`
**Descripción:** Muestra los discos físicos conectados al sistema, diferenciándose de los volúmenes lógicos.
**Columnas:**
* `partitions` (INTEGER): Número de particiones en el disco.
* `disk_size` (BIGINT): Tamaño físico total del disco en bytes.
* `id` (TEXT): Identificador del hardware del disco.
* `description` (TEXT): Descripción del dispositivo (ej. Disk drive).

## 58. Tabla: `dns_resolvers`
**Descripción:** Muestra los servidores DNS que el equipo está utilizando para resolver nombres.
**Columnas:**
* `id` (INTEGER): Índice de la interfaz de red.
* `type` (TEXT): Tipo de servidor (ej. primary, secondary).
* `address` (TEXT): Dirección IP del servidor DNS.
* `netmask` (TEXT): Máscara de red aplicable.

## 59. Tabla: `file`
**Descripción:** Tabla interactiva para inspeccionar los metadatos de un archivo o carpeta en disco. (Requiere indicar el `path` o `directory` en el WHERE).
**Columnas:**
* `path` (TEXT): Ruta absoluta.
* `directory` (TEXT): Directorio contenedor.
* `filename` (TEXT): Nombre del archivo.
* `size` (BIGINT): Tamaño en bytes.
* `mtime` (BIGINT): Timestamp de última modificación.
* `atime` (BIGINT): Timestamp de último acceso.

## 60. Tabla: `firefox_addons`
**Descripción:** Lista de complementos (add-ons) instalados en Mozilla Firefox.
**Columnas:**
* `uid` (BIGINT): User ID del dueño del perfil.
* `name` (TEXT): Nombre del complemento.
* `identifier` (TEXT): ID único de la extensión.
* `version` (TEXT): Versión instalada.
* `description` (TEXT): Descripción del add-on.

## 61. Tabla: `intel_me_info`
**Descripción:** Detalles de la versión del Intel Management Engine (Intel ME) del equipo. Útil para verificar vulnerabilidades de hardware.
**Columnas:**
* `version` (TEXT): Versión del firmware de Intel ME.
* `status` (TEXT): Estado actual del motor (ej. Configured).

## 62. Tabla: `interface_details`
**Descripción:** Información granular sobre las interfaces de red físicas y virtuales.
**Columnas:**
* `interface` (TEXT): Nombre de la conexión (ej. Ethernet).
* `mac` (TEXT): Dirección MAC física de la tarjeta.
* `type` (INTEGER): Tipo de interfaz de red.
* `mtu` (INTEGER): Tamaño de la unidad máxima de transferencia.
* `connection_status` (TEXT): Estado (ej. Up, Down).

## 63. Tabla: `kernel_info`
**Descripción:** Proporciona detalles básicos sobre el núcleo del sistema operativo.
**Columnas:**
* `version` (TEXT): Versión exacta del kernel (NT).
* `arguments` (TEXT): Argumentos pasados al kernel durante el arranque.
* `path` (TEXT): Ruta del archivo del kernel (ej. ntoskrnl.exe).
* `device` (TEXT): Dispositivo de arranque.

## 64. Tabla: `ntfs_acl_permissions`
**Descripción:** Muestra los permisos de la Lista de Control de Acceso (ACL) para archivos/carpetas NTFS. Útil para detectar permisos inseguros.
**Columnas:**
* `path` (TEXT): Ruta del archivo a auditar.
* `type` (TEXT): Tipo de permiso (Allow o Deny).
* `principal` (TEXT): Usuario o grupo al que se le aplica (ej. SYSTEM).
* `access` (TEXT): Nivel de acceso concedido (ej. FullControl, Read).

## 65. Tabla: `osquery_info`
**Descripción:** Estado y metadatos del propio agente Osquery ejecutándose en el endpoint.
**Columnas:**
* `pid` (INTEGER): ID del proceso de Osqueryd.
* `version` (TEXT): Versión del cliente Osquery.
* `config_hash` (TEXT): Hash MD5 del archivo de configuración activo.
* `config_valid` (INTEGER): 1 si la configuración es correcta, 0 si tiene errores.
* `start_time` (INTEGER): Timestamp de cuándo inició el agente.

## 66. Tabla: `platform_info`
**Descripción:** Información central de la placa base, BIOS o firmware UEFI del sistema.
**Columnas:**
* `vendor` (TEXT): Fabricante del firmware (ej. American Megatrends).
* `version` (TEXT): Versión de la BIOS/UEFI.
* `date` (TEXT): Fecha de lanzamiento del firmware.
* `revision` (TEXT): Revisión del firmware.

## 67. Tabla: `powershell_events`
**Descripción:** Registros de bloques de scripts de PowerShell ejecutados. (Requiere configuración previa en Windows Logging).
**Columnas:**
* `time` (BIGINT): Timestamp del evento.
* `datetime` (TEXT): Fecha y hora legible.
* `script_block_id` (TEXT): ID único del bloque de script.
* `script_text` (TEXT): El código exacto de PowerShell ejecutado.
* `script_name` (TEXT): Nombre del archivo .ps1 (si aplica).

## 68. Tabla: `routes`
**Descripción:** Tabla de enrutamiento de red activa. Útil para encontrar túneles o VPNs no autorizadas.
**Columnas:**
* `destination` (TEXT): Dirección IP o red de destino.
* `netmask` (TEXT): Máscara de subred de la ruta.
* `gateway` (TEXT): Puerta de enlace por defecto para esta ruta.
* `source` (TEXT): IP de origen asociada a la ruta.
* `interface` (TEXT): Nombre de la interfaz que enruta el tráfico.

## 69. Tabla: `secureboot`
**Descripción:** Verifica si Secure Boot está habilitado a nivel de hardware/UEFI para proteger la secuencia de arranque.
**Columnas:**
* `secure_boot` (INTEGER): 1 si Secure Boot está activado, 0 si está desactivado.
* `setup_mode` (INTEGER): 1 si está en modo configuración, 0 si está en modo usuario.

## 70. Tabla: `shimcache`
**Descripción:** Extrae el Application Compatibility Cache (Shimcache). Muestra históricos de ejecución de programas incluso tras un reinicio.
**Columnas:**
* `path` (TEXT): Ruta completa del archivo ejecutado.
* `execution_time` (INTEGER): Timestamp de la última vez que fue procesado por el subsistema.

## 71. Tabla: `smbios_tables`
**Descripción:** Extrae datos crudos de las tablas SMBIOS del sistema (System Management BIOS).
**Columnas:**
* `number` (INTEGER): Número de la tabla (ej. 0 para BIOS, 1 para Sistema).
* `type` (INTEGER): Tipo de estructura SMBIOS.
* `description` (TEXT): Explicación del tipo de hardware mapeado.
* `size` (INTEGER): Tamaño de la tabla en memoria.

## 72. Tabla: `user_assist`
**Descripción:** Registra las aplicaciones gráficas (GUI) ejecutadas por los usuarios desde el Explorador de Windows y el Menú Inicio.
**Columnas:**
* `path` (TEXT): Nombre o ruta del programa ejecutado.
* `last_execution_time` (INTEGER): Última vez que se abrió.
* `count` (INTEGER): Cantidad de veces que se ha ejecutado.
* `sid` (TEXT): Identificador del usuario que lo ejecutó.

## 73. Tabla: `user_ssh_keys`
**Descripción:** Busca claves privadas SSH almacenadas en los directorios de los usuarios (riesgo de robo de credenciales).
**Columnas:**
* `uid` (BIGINT): User ID al que le pertenece la clave.
* `path` (TEXT): Ruta del archivo de la llave SSH.
* `encrypted` (INTEGER): 1 si la clave privada tiene contraseña, 0 si está expuesta en texto plano.
* `key_type` (TEXT): Algoritmo de la clave (ej. rsa, ed25519).

## 74. Tabla: `windows_events`
**Descripción:** Interfaz para consultar eventos de auditoría (ETW) en tiempo real (procesos, red).
**Columnas:**
* `eventid` (INTEGER): ID del evento capturado.
* `source` (TEXT): Origen o proveedor del evento ETW.
* `datetime` (TEXT): Fecha y hora de captura.
* `data` (TEXT): JSON con el contenido detallado de la auditoría.

## 75. Tabla: `windows_security_products`
**Descripción:** Muestra los productos de seguridad (Antivirus, Antispyware, Firewall) de terceros registrados en Windows.
**Columnas:**
* `type` (TEXT): Tipo de producto (ej. Antivirus).
* `name` (TEXT): Nombre de la solución (ej. Windows Defender, McAfee).
* `state` (TEXT): Estado (ej. On, Off).
* `signatures_up_to_date` (INTEGER): 1 si la base de firmas está actualizada, 0 si no.

## 76. Tabla: `wmi_bios_info`
**Descripción:** Información de la BIOS extraída mediante llamadas WMI.
**Columnas:**
* `name` (TEXT): Nombre descriptivo de la BIOS.
* `version` (TEXT): Versión y fabricante.
* `serial_number` (TEXT): Número de serie del hardware.
* `release_date` (TEXT): Fecha de publicación del firmware.

## 77. Tabla: `yara`
**Descripción:** Permite escanear archivos en disco buscando patrones de malware definidos en firmas YARA.
**Columnas:**
* `path` (TEXT): Ruta absoluta del archivo escaneado.
* `matches` (TEXT): Nombre de la regla YARA que dio positivo.
* `count` (INTEGER): Número de veces que el patrón hizo "match" en el archivo.
* `sig_group` (TEXT): Grupo de firmas utilizado para el escaneo.

## 78. Tabla: `curl`
**Descripción:** Realiza peticiones de red HTTP/HTTPS directamente desde Osquery. Útil para validar conexiones a IPs sospechosas.
**Columnas:**
* `url` (TEXT): Dirección web o IP a consultar.
* `method` (TEXT): Método HTTP (GET, POST).
* `response_code` (INTEGER): Código de estado devuelto (ej. 200, 404).
* `round_trip_time` (BIGINT): Latencia o tiempo de respuesta.

## 79. Tabla: `chocolatey_packages`
**Descripción:** Lista de paquetes instalados mediante el gestor Chocolatey (muy común en entornos corporativos de Windows).
**Columnas:**
* `name` (TEXT): Nombre del paquete.
* `version` (TEXT): Versión instalada.
* `summary` (TEXT): Resumen de la utilidad.
* `author` (TEXT): Autor o empaquetador original.

## 80. Tabla: `applocker_events`
**Descripción:** Eventos extraídos de los registros de Microsoft AppLocker (aplicaciones bloqueadas o auditadas).
**Columnas:**
* `time` (BIGINT): Timestamp del bloqueo/auditoría.
* `file_path` (TEXT): Ruta del archivo bloqueado.
* `rule_name` (TEXT): Nombre de la política de AppLocker que lo detuvo.
* `action` (TEXT): Resultado final (ej. Audited, Blocked).

## 81. Tabla: `logical_drives`
**Descripción:** Detalles de las unidades lógicas y particiones mapeadas en el sistema. Es la tabla oficial y más confiable en Windows para detectar pendrives y almacenamientos USB conectados.
**Columnas:**
* `device_id` (TEXT): Letra de la unidad asignada por Windows (ej. C:, D:, E:).
* `type` (TEXT): Tipo de unidad física (para bloquear USBs, se debe buscar el valor 'Removable Disk').
* `description` (TEXT): Descripción estándar del disco.
* `file_system` (TEXT): Sistema de archivos detectado (ej. NTFS, FAT32, exFAT).
* `free_space` (BIGINT): Espacio libre disponible en bytes.
* `size` (BIGINT): Tamaño total de la unidad en bytes.