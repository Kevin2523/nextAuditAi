# Politica de Gestion de Llaves

Las llaves LLM, Fleet, n8n y los secretos de firma deben existir solo en backend.

- No exponer llaves de proveedores a Angular.
- Almacenar llaves LLM cifradas en reposo.
- Restringir la gestion de llaves LLM al rol `super_admin`.
- Registrar eventos de auditoria al crear, actualizar, deshabilitar o eliminar llaves.
- Rotar los secretos de desarrollo local antes de cualquier demo compartida o piloto.
