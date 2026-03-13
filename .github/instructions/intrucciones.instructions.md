Utiliza por defecto TypeScript.

Stack principal:

* Node.js
* Express
* Sequelize (ORM)
* SQL Server
* Vue
* PrimeVue

Base de datos:

* Utilizar Sequelize como ORM para interactuar con SQL Server.
* Definir modelos tipados con TypeScript.
* Usar migraciones cuando sea posible.
* Separar modelos, repositorios y lógica de negocio.

Seguridad:

* JWT para autenticación.
* HTTPS / TLS para comunicación segura.
* Validar y sanitizar todos los datos de entrada.

Buenas prácticas:

* Arquitectura modular.
* Separación clara entre:

  * controllers
  * services
  * repositories
  * models
  * middleware
* Manejo de errores centralizado.
* Validación de datos en la capa de entrada.
* Uso de async/await en todas las operaciones asincrónicas.
* Evitar lógica de negocio dentro de controllers.
* Usar variables de entorno para configuraciones sensibles.

Testing:

* Crear tests para las funcionalidades principales.
* Priorizar pruebas de servicios y controladores.

Documentación:

* Comentar el código explicando el PORQUÉ de cada decisión de diseño.
* Documentar funciones complejas, validaciones y reglas de negocio.
* Evitar comentarios redundantes que solo describan lo obvio.
