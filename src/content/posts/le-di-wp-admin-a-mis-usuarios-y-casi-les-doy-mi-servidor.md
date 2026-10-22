---
title: "Primero que funcione, después que no me hackeen: del MVP a aislar cada WordPress en Docker"
name: "Primero que funcione, después que no me hackeen: del MVP a aislar cada WordPress en Docker"
ogTitle: "Primero que funcione, después que no me hackeen: cómo pasé mi MVP de WordPress con IA a entornos aislados en Docker"
datePublished: "10/08/2026"
postDescription: "El MVP de Design2Press tenía que funcionar y punto. Cuando funcionó, me tocó mirar debajo de la alfombra: cualquier usuario podía instalar un plugin y leerse mi .env. Así fue el proceso de pasar de lo simple a lo robusto."
tags: ["laravel", "wordpress", "docker", "seguridad", "saas", "mvp", "arquitectura"]
---

Todo MVP tiene una regla sagrada: **primero que funcione**. Que sea bonito, escalable y seguro ya vendrá después... si el proyecto sobrevive.

Yo la seguí al pie de la letra. Y funcionó. El problema es que "después" llegó, y cuando levanté la alfombra me encontré debajo un servidor entero esperando a que alguien se lo llevara.

Este post es el diario de ese proceso: cómo construí el MVP de la forma más simple posible, cómo me di cuenta de que esa simpleza tenía un precio, y cómo me puse manos a la obra para aislar cada entorno sin romper nada por el camino.

## El proyecto: WordPress con IA, un sitio por cliente

Estoy construyendo **Design2Press**, un generador de temas WordPress con IA. Subes capturas de un diseño, un agente construye las plantillas con Tailwind y Secure Custom Fields, y te devuelve un WordPress funcionando para que lo revises, edites el contenido y lo exportes a producción.

La pieza clave es que **cada proyecto tiene su propio WordPress**, y el cliente entra a `wp-admin` como administrador para editarlo.

Guarda ese dato, que luego vuelve.

## Fase 1: el MVP tenía que funcionar, y punto

En la fase de MVP no me preguntaba "¿es seguro?". Me preguntaba "¿sale una plantilla decente de una captura?". Y para responder eso necesitaba montar WordPress rápido y con el mínimo de piezas posible.

Así que la arquitectura fue la más simple que se me ocurrió:

- Cada proyecto es una carpeta con WordPress sobre **SQLite** (nada de un MySQL por cliente).
- Laravel levanta un **`php -S` por proyecto**, en el puerto `8100 + id`.
- **WP-CLI** se ejecuta directamente desde el worker de la cola para instalar, sembrar páginas y exportar.

¿Era elegante? No. ¿Funcionaba? De maravilla. En minutos tenía un WordPress con su tema, sus campos y su contenido, y podía centrarme en lo que de verdad importaba: que la IA generara plantillas buenas.

Y no me arrepiento. Si hubiera empezado montando contenedores, redes internas y servicios con tokens, probablemente seguiría configurando Docker en vez de validando si alguien quería el producto.

**El MVP hizo su trabajo: demostrar que la idea funcionaba.**

## Fase 2: "vale, funciona... ¿y ahora qué pasa si alguien es malo?"

El cambio llegó cuando el proyecto empezó a parecerse a un producto de verdad: **registro público, plan gratuito, pagos**. Ya no eran solo mis pruebas y un par de clientes de confianza. Cualquiera podía crear una cuenta.

Y ahí me hice la pregunta que el MVP me había permitido ignorar:

> "¿Qué puede hacer un usuario con mala intención con lo que le doy?"

La respuesta fue incómoda. Repasemos la cadena:

1. El usuario es **administrador** de su WordPress.
2. Un administrador puede **instalar plugins**, o editar el `functions.php` desde el editor de temas.
3. Un plugin es **PHP**.
4. Ese PHP corría **con el mismo usuario del sistema que Laravel**. En Dokploy, además, como root. 🙃

Traducido: cualquier usuario podía subir un plugin que hiciera un `getenv()` y se llevara mi `APP_KEY`, las credenciales de la base de datos, las API keys de la IA y el token de pagos. O pasearse por las carpetas de los demás clientes. O directamente editar el código de mi aplicación.

Mi "un WordPress por proyecto" en realidad era "**un shell por proyecto, con interfaz bonita**".

Era como un edificio de apartamentos donde le das a cada inquilino la llave de su casa... que casualmente también abre la oficina del administrador, la caja fuerte y la sala de servidores.

## La tentación: parchear y seguir

Lo primero que pensé fue lo típico cuando tienes prisa:

- Activar `DISALLOW_FILE_MODS` para que no se puedan instalar plugins.
- Darle al cliente rol de Editor en vez de Administrador.
- Limpiar las variables de entorno al lanzar los procesos.

Son buenas medidas, y en unas horas lo tenía. Pero solo tapan la puerta principal. La llave maestra seguiría debajo del felpudo: si mañana sale una vulnerabilidad en WordPress o en un plugin, vuelvo a tener ejecución de código **con los privilegios de mi aplicación**.

Como todavía no había clientes en producción, decidí no dejarlo a medias:

> Si lo voy a cambiar, que sea de verdad y desde ahora.

## Fase 3: manos a la obra, cada WordPress en su celda

Me puse una regla nueva para toda la arquitectura:

> **Laravel nunca ejecuta código de un sitio, ni confía en nada que salga de un sitio.**

Para cumplirla, cada WordPress pasó a vivir en **su propio contenedor Docker**, con condiciones de "prisión de mínima seguridad, pero mínima de verdad":

- **Corre como `www-data`**, sin capacidades de Linux y sin poder escalar privilegios.
- **Su código es de solo lectura.** WordPress, plugins, tema y `wp-config.php` van montados en read-only. Solo puede escribir en `uploads/` y en su base de datos SQLite.
- **No puede ejecutar comandos**: `exec`, `shell_exec`, `proc_open` y compañía están deshabilitados, y `open_basedir` lo encierra en su carpeta.
- **Tiene límites de memoria, CPU y procesos**, para que nadie mine criptomonedas a mi costa.
- **No tiene internet ni vecinos**: en producción vive en una red interna sin acceso a la base de datos ni a la aplicación.

Además, WordPress lleva `DISALLOW_FILE_MODS` y `DISALLOW_FILE_EDIT`. El cliente sigue siendo administrador y gestiona todo su sitio, pero no puede instalar plugins ni tocar código.

Un detalle que me gustó del cambio: ahora **WordPress, los plugins y TailPress vienen dentro de la imagen de Docker**. Crear un entorno ya no descarga nada; solo copia archivos. El MVP descargaba WordPress cada vez, así que de rebote también se volvió más rápido.

Para comprobar que la celda aguantaba, simulé un plugin malicioso dentro del contenedor:

```text
write theme:          false
write wp-config:      false
write uploads:        1        ← lo único permitido
shell_exec:           BLOCKED
proc_open:            BLOCKED
conectar al host:     false
```

Ver ese `BLOCKED` da una paz que no te da ni el café.

## El portero: el único que tiene las llaves

Aquí había una trampa. Para crear contenedores hace falta el socket de Docker, y **tener el socket de Docker es, en la práctica, ser root en el servidor**. Si se lo daba a Laravel, solo movía el problema de sitio.

Así que creé un servicio pequeñito, el **site runner**: PHP plano, sin dependencias, unos pocos cientos de líneas. Es el único que habla con Docker, y Laravel le pide cosas por HTTP con un token.

Laravel puede decirle "arranca el sitio X" o "ejecuta `wp option get home` en el sitio X", pero **no puede decidir cómo se crea el contenedor**. La imagen, el usuario, los montajes, la red y los límites están fijos en el runner. No existe un parámetro "porfa, móntame `/`", por mucho cariño que le pongas.

También rechaza cosas como `--path=/etc` en los comandos de WP-CLI, y valida los nombres de los sitios para que nadie se cuele con un `../`.

## Lo que encontré al mirar con lupa

Lo mejor de revisar el MVP con calma es que aparecen cosas que ni sabías que estaban ahí. Estas fueron mis favoritas (o mis pesadillas, según el día):

### 1. La base de datos se podía descargar

El `php -S` servía cualquier archivo que existiera. Incluido `/wp-content/database/.ht.sqlite`, con los hashes de las contraseñas. Muy hospitalario.

Ahora el router del contenedor devuelve 404 para la base de datos, para los archivos ocultos y para cualquier PHP dentro de `uploads`.

### 2. El export del tema exportaba lo que el sitio le dijera

Para empaquetar el tema, le pedía al WordPress la lista de imágenes con su ruta, y copiaba esa ruta al ZIP sin preguntar.

Un sitio comprometido podía responder "la imagen está en `/app/.env`" y Laravel la metía en el ZIP, lista para descargar. El primer exfiltrador de secretos con botón de descarga incluido.

Ahora solo acepto **archivos normales dentro de `uploads/`**: nada de `..`, nada de rutas absolutas y nada de symlinks.

### 3. Tailwind podía ejecutar código en mi servidor

El CSS con los colores y tipografías del tema lo generaba WordPress, y Laravel lo compilaba con Tailwind. Pero Tailwind v4 soporta `@plugin "./algo.js"`, que **carga y ejecuta JavaScript**.

Un sitio malicioso podía mandarme CSS que ejecutaba código en Laravel al exportar. Ahora ese CSS lo genera Laravel con sus propios datos, usando la misma función que el tema, sin pasar nunca por el sitio.

### 4. Los symlinks, esos pequeños traidores

Al exportar el sitio completo hay que copiar `uploads` y la base de datos, que escribe el propio sitio. Si el sitio deja ahí un symlink hacia `/etc/passwd` o hacia la carpeta de otro cliente, una copia ingenua lo sigue sin rechistar.

Ahora la copia la hace el runner en un contenedor desechable que solo ve ese sitio, y antes de devolver nada **borra los symlinks, los FIFOs y cualquier archivo raro**. Lo probé plantando un symlink y un FIFO desde dentro: el ZIP salió limpio. Lo único "evil" que apareció fue `icon_evil.gif`, que es un emoticono del propio WordPress. 😈

### 5. La red "interna" de Docker no es tan interna

Esta me sorprendió de verdad. Creé una red `--internal`, levanté un contenedor y probé:

```text
gateway=172.21.0.1
HOST_REACHABLE   ← 👀
no_internet
```

Internet no tenía, pero **el host seguía respondiendo** por el gateway. Si tu servidor tiene algo escuchando en todas las interfaces (el panel de Dokploy, SSH, una base de datos), los contenedores pueden llegar a ello.

Moraleja: `--internal` no significa "aislado del host". Hace falta una regla de firewall, y ahora está en la documentación con su comprobación.

## Restringir el entorno, no al cliente

Algo que tenía claro desde el principio: **las restricciones son para mi entorno de desarrollo, no para la web del cliente**.

Cuando exporta el sitio, el `wp-config.php` se genera de nuevo con claves nuevas y **sin** `DISALLOW_FILE_MODS` ni nada raro. En su hosting tiene un WordPress normal, con todos sus permisos. Lo que está encerrado es mi servidor, no su web.

## Bonus: vistas previas privadas

En el MVP, cualquiera que adivinara la URL de una vista previa podía verla. Ahora, en producción, Caddy le pregunta a Laravel antes de cada petición (`forward_auth`) si quien la hace es miembro del workspace.

Los enlaces del Studio llevan un token cifrado que caduca en 10 minutos y dejan una cookie `__Host-` ligada a ese sitio concreto. Si abres la URL en una ventana privada, te recibe un amable "Vista previa privada".

(Dato curioso: casi me vuelvo loco porque Caddy no enrutaba nada, y era porque el `{0,62}` de mi regex rompía el placeholder `{$VAR:default}` del Caddyfile. Las llaves cerraban el placeholder antes de tiempo. Cambié el cuantificador por `*` y listo.)

## ¿Y la versión del MVP? La guardé

No la tiré. Para herramientas internas, donde los usuarios son de confianza, la versión con `php -S` es muchísimo más fácil de montar y mantener. Así que vive en su propia rama, `legacy/simple-sites`, lista para reutilizarla en otros proyectos.

Con una advertencia en mayúsculas: **si tus usuarios pueden instalar plugins, esa versión les regala tu servidor**. Es perfecta para tu equipo, no para un SaaS abierto al público.

## Lo que me llevo de todo el proceso

- **Hacer el MVP simple fue la decisión correcta.** Me dejó validar la idea sin perderme en infraestructura.
- **Pero el MVP tiene fecha de caducidad**, y la marca el primer usuario que no conoces. En mi caso, el día que abrí el registro público.
- **"Mis usuarios no van a hacer eso" no es un modelo de seguridad.** Basta con uno, o con un plugin legítimo que tenga una vulnerabilidad.
- **Trata como no confiable todo lo que sale del entorno del usuario**: rutas, CSS, JSON y archivos.
- **No le des el socket de Docker a tu aplicación.** Ponle un portero con una API mínima y la configuración fija.
- **Prueba los ataques, no solo las funcionalidades.** Plantar un symlink a propósito me enseñó más que cualquier documentación.

Primero que funcione. Después, que no me hackeen. El orden está bien; lo importante es no quedarse en el primer paso cuando el producto ya no es solo tuyo. 😅

¿Tienes un MVP donde tus usuarios ejecutan código, aunque sea sin saberlo? Hazte la misma pregunta que yo: **¿y si uno de ellos es malo?**
