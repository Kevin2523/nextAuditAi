# Manual de usuario de NextAudit AI

Este manual explica como utilizar la plataforma NextAudit AI para revisar el estado de seguridad de los dispositivos, consultar actividad reciente, descargar reportes y dar seguimiento a eventos importantes.

La guia esta dirigida a usuarios operativos, administradores, personal de soporte y responsables de auditoria de cualquier organizacion donde se implemente el sistema.

## 1. Acceso a la plataforma

1. Abre la direccion web entregada por el administrador del sistema.
2. El sistema iniciara sesion de forma automatica utilizando las credenciales configuradas internamente.
3. Verifica que se muestre el panel principal de NextAudit AI de forma inmediata.

El acceso esta automatizado para garantizar una experiencia fluida. Si la plataforma no carga la informacion de forma automatica, verifica tu conexion a internet o solicita apoyo al administrador.

## 2. Navegacion general

La pantalla principal tiene un menu lateral con las secciones disponibles:

- **Dashboard**: muestra el resumen general del estado de seguridad.
- **Inventario de Dispositivos**: permite consultar los equipos registrados.
- **Registro de Actividad**: muestra eventos, acciones y resultados recientes.
- **Asistente Virtual**: permite realizar consultas guiadas sobre el estado del sistema.
- **Centro de Ayuda**: contiene material de apoyo para el uso de la plataforma.

En la parte superior tambien hay una barra de busqueda. Puedes escribir el nombre de un dispositivo, reporte o alerta para encontrar informacion rapidamente.

## 3. Dashboard

El Dashboard es la vista inicial de la plataforma. Su objetivo es ofrecer una lectura rapida del estado general de la organizacion.

En esta seccion puedes revisar:

- **Puntuacion de cumplimiento**: indica el nivel general de cumplimiento observado.
- **Salud de la flota**: muestra cuantos dispositivos estan registrados y cuantos estan conectados.
- **Incidentes detectados**: resume riesgos o vulnerabilidades activas.
- **Remediaciones exitosas**: indica acciones correctivas completadas correctamente.
- **Rendimiento semanal**: muestra la evolucion de la seguridad durante los ultimos dias.
- **Resumen operativo**: presenta los eventos recientes mas importantes.

Para descargar un reporte, selecciona **Descargar Reporte**. El sistema generara un archivo con la informacion operativa disponible en ese momento.

## 4. Inventario de dispositivos

La seccion **Inventario de Dispositivos** permite consultar los equipos monitoreados por la plataforma.

La tabla muestra:

- Nombre del dispositivo.
- Sistema operativo.
- Estado de seguridad.
- Fecha de la ultima auditoria.
- Acciones disponibles.

### Estados de seguridad

- **Protegido**: el dispositivo no presenta riesgos criticos visibles en la plataforma.
- **Riesgo Detectado**: el dispositivo requiere revision o seguimiento.
- **Offline**: el dispositivo no esta reportando informacion actualmente.

### Buscar dispositivos

Usa el campo **Filtrar por nombre o SO** para encontrar equipos por nombre o sistema operativo. La lista se actualizara con los resultados que coincidan con tu busqueda.

### Usar filtros

Selecciona **Filtros** para mostrar las opciones de filtrado por estado. Esto ayuda a revisar rapidamente equipos protegidos, en riesgo u offline.

### Ver detalles de un dispositivo

En la columna **Acciones**, selecciona **Detalles** para ver informacion adicional del equipo, como hostname, plataforma, fecha de inscripcion y cantidad de vulnerabilidades criticas.

## 5. Registro de actividad

La seccion **Registro de Actividad** muestra eventos recientes, acciones ejecutadas y resultados asociados a los dispositivos.

Aqui puedes revisar:

- Tipo de suceso.
- Dispositivo afectado.
- Resultado de la accion.
- Fecha y hora del evento.
- Actividad reciente ordenada cronologicamente.

Cuando una accion se complete correctamente, puede aparecer la opcion **Descargar Certificado de Resolucion**. Usa este certificado como evidencia de atencion del evento.

Si un evento aparece como fallido o pendiente, debe ser revisado por el equipo responsable antes de marcarlo como resuelto.

## 6. Asistente Virtual

El **Asistente Virtual** permite hacer consultas sobre la informacion disponible en la plataforma.

Puedes usarlo para:

- Preguntar por el estado de un dispositivo.
- Consultar incidentes recientes.
- Solicitar orientacion sobre eventos detectados.
- Revisar recomendaciones generales de seguimiento.

Escribe tu consulta en el campo de texto y presiona el boton de enviar. Tambien puedes usar las sugerencias rapidas que aparecen sobre la barra de escritura.

Si la opcion de voz esta disponible, puedes activar el microfono para dictar una consulta. Al terminar, revisa la respuesta antes de tomar una decision operativa.

## 7. Notificaciones

El icono de notificaciones se encuentra en la parte superior derecha.

Desde ahi puedes:

- Ver alertas pendientes.
- Abrir una alerta para ir a la seccion relacionada.
- Marcar notificaciones como leidas.
- Activar notificaciones del sistema si el navegador lo solicita.

Las notificaciones ayudan a priorizar eventos que requieren revision. Una alerta critica debe atenderse antes que una alerta informativa.

## 8. Centro de ayuda

El **Centro de Ayuda** reune articulos y orientaciones de uso de la plataforma.

Puedes buscar articulos desde el campo de busqueda o seleccionar una categoria disponible. Esta seccion debe utilizarse como referencia para resolver dudas operativas antes de escalar un caso al administrador.

## 9. Buenas practicas de uso

- Revisa el Dashboard al iniciar la jornada.
- Atiende primero los dispositivos con **Riesgo Detectado**.
- Usa los filtros para priorizar equipos offline o con alertas.
- Descarga reportes cuando necesites evidencias para reuniones, auditorias o seguimiento de la organizacion.
- No compartas tu usuario ni tu contrasena.
- Cierra la sesion cuando termines de trabajar en un equipo compartido.
- Reporta cualquier informacion inconsistente al administrador de la plataforma.

## 10. Problemas frecuentes

### No aparecen dispositivos

Puede que no existan equipos registrados, que la informacion aun no este disponible o que haya un problema de conexion. Espera unos minutos y vuelve a cargar la pagina. Si continua, contacta al administrador.

### Un dispositivo aparece offline

El equipo puede estar apagado, sin conexion o fuera de la red. Verifica el estado fisico del dispositivo y registra el caso si requiere seguimiento.

### No se descarga el reporte

Revisa si el navegador bloqueo la descarga. Tambien confirma que exista informacion disponible para generar el archivo.

### No llegan notificaciones

Verifica que las notificaciones esten permitidas en el navegador. Si estan bloqueadas, habilitalas desde la configuracion del sitio.

### El asistente no responde

Espera unos segundos y vuelve a intentar. Si el problema persiste, registra el caso con el administrador de la plataforma.

## 11. Escalamiento

Debes contactar al administrador o al equipo de soporte cuando ocurra alguno de estos casos:

- No puedes acceder a la plataforma.
- Hay dispositivos criticos sin informacion actualizada.
- Un incidente aparece repetidamente sin resolucion.
- Un reporte contiene informacion incompleta o incorrecta.
- Se detecta actividad sospechosa o no reconocida.

Al reportar un problema, incluye el nombre del dispositivo, la fecha, la seccion donde ocurrio el problema y una descripcion breve de lo observado.
