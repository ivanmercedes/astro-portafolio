---
title: "Arquitectura: entornos WordPress aislados con Docker y Laravel (site runner, read-only y forward_auth)"
name: "Arquitectura: entornos WordPress aislados con Docker y Laravel (site runner, read-only y forward_auth)"
ogTitle: "Cómo aislar un WordPress por cliente con Docker y Laravel: site runner, montajes read-only, exports seguros y forward_auth"
datePublished: "10/08/2026"
postDescription: "Explicación técnica de la arquitectura de entornos aislados de Design2Press: un contenedor endurecido por sitio, un site runner como único dueño del socket de Docker, WP-CLI dentro del contenedor, exports que no confían en el sitio y vistas previas privadas con Caddy forward_auth."
tags: ["laravel", "wordpress", "docker", "seguridad", "arquitectura", "caddy", "backend"]
---

En el [post anterior](/blog/le-di-wp-admin-a-mis-usuarios-y-casi-les-doy-mi-servidor) conté la historia: qué falló en el MVP, qué agujeros encontré y por qué decidí aislar cada WordPress. Aquí no voy a repetirla.

Este post es el manual de implementación: la configuración real de cada pieza, el código que la sostiene y cómo comprobé que funcionaba. Si tienes un SaaS donde los usuarios ejecutan código (plugins, plantillas, scripts...), casi todo esto te sirve aunque no uses WordPress.

## Antes y después

En el MVP todo vivía junto:

![Diagrama del MVP: Laravel, el worker de la cola y un php -S por sitio comparten el mismo usuario del sistema, así que cualquier plugin puede leer el .env](/posts/arquitectura-entornos-wordpress-aislados-docker-laravel/antes-mvp.svg)

Así quedó después de aplicar la regla de "Laravel nunca ejecuta código de un sitio ni confía en lo que sale de él":

![Diagrama de la nueva arquitectura: Traefik, contenedor de la aplicación con Caddy y Laravel, red interna d2p-sites con un contenedor por sitio y red d2p-runner con el site runner, único dueño del socket de Docker](/posts/arquitectura-entornos-wordpress-aislados-docker-laravel/despues-arquitectura.svg)

Hay tres tipos de contenedor:

| Pieza | Responsabilidad | ¿Toca código del cliente? |
| --- | --- | --- |
| Aplicación (Laravel) | Panel, Studio, IA, cola, exports | **Nunca lo ejecuta** |
| Site runner | Crear contenedores y ejecutar WP-CLI en ellos | No: solo orquesta |
| `d2p-site-{uuid}` | Servir un WordPress | Sí, y por eso está encerrado |

Vamos una por una.

## 1. La imagen de los sitios

Lo primero fue una imagen propia, `design2press/wordpress`, basada en `php:8.5-cli-alpine`. Lleva **todo horneado**: WordPress, el paquete de idioma, SQLite Database Integration, Secure Custom Fields, la plantilla base con sus dependencias de Composer y WP-CLI.

Así los sitios no necesitan internet y las versiones quedan fijadas: para actualizar WordPress se reconstruye la imagen, no se depende de lo que responda wordpress.org en ese momento.

Un detalle curioso: las traducciones no siempre se publican el mismo día que sale una versión de WordPress, así que `wp core download --locale=es_ES` puede fallar. La imagen pregunta a la API de traducciones cuál es el paquete disponible para esa versión y, si no hay ninguno, sigue en inglés en vez de romper el build.

El servidor web es el mismo `php -S` del MVP, pero arrancado con restricciones que solo afectan al servidor (WP-CLI las necesita sueltas):

```dockerfile
USER www-data

CMD ["php", \
    "-d", "open_basedir=/var/www/html:/tmp:/opt/d2p", \
    "-d", "disable_functions=exec,passthru,shell_exec,system,proc_open,popen,pcntl_exec,pcntl_fork,dl,putenv", \
    "-d", "display_errors=0", \
    "-d", "expose_php=0", \
    "-S", "0.0.0.0:8080", "-t", "/var/www/html", "/opt/d2p/router.php"]
```

Y un router propio que no sirve lo que no debe:

```php
$isForbidden = str_contains($path, '..')
    || str_contains($path, '/.')
    || str_starts_with($path, '/wp-content/database')
    || (str_starts_with($path, '/wp-content/uploads/') && preg_match('/\.(php\d?|phtml|phar)$/i', $path));
```

El router se ejecuta antes que WordPress en cada petición, así que estas reglas aplican también a archivos estáticos que `php -S` serviría directamente.

## 2. El contenedor de cada sitio

Esta es la parte central. Cada sitio corre en un contenedor creado siempre con la misma especificación. Este es el fragmento real que arma el runner para la API de Docker:

```php
'User' => '82:82',                       // www-data, nunca root
'Env' => [],                             // ningún secreto heredado
'HostConfig' => [
    'ReadonlyRootfs' => true,
    'Tmpfs' => ['/tmp' => 'rw,noexec,nosuid,nodev,size=64m'],
    'CapDrop' => ['ALL'],
    'SecurityOpt' => ['no-new-privileges:true'],
    'Privileged' => false,
    'Memory' => 384 * 1024 * 1024,
    'MemorySwap' => 384 * 1024 * 1024,
    'NanoCpus' => 1_000_000_000,
    'PidsLimit' => 256,
    'NetworkMode' => 'd2p-sites',
    'RestartPolicy' => ['Name' => 'unless-stopped'],
],
```

Lo más interesante son los **montajes**, que es donde de verdad se define qué puede tocar el sitio:

```text
/var/www/html                       ← {sitio}/                       solo lectura
/var/www/html/wp-content/uploads    ← {sitio}/wp-content/uploads     lectura y escritura
/var/www/html/wp-content/database   ← {sitio}/wp-content/database    lectura y escritura
/d2p/control                        ← .d2p/control/{sitio}/          solo lectura
```

El orden importa: Docker aplica primero el montaje de solo lectura de la raíz y luego los dos de escritura **encima**, así que esas dos subcarpetas "agujerean" el read-only y nada más. `/d2p/control` es por donde Laravel le pasa scripts al sitio (lo vemos en la sección del runner).

En producción no monto carpetas del host, sino **subrutas de un volumen Docker** (`VolumeOptions.Subpath`, disponible desde Docker Engine 26). El volumen de la aplicación guarda muchas más cosas, como la base de datos de Laravel, pero cada sitio solo ve su subcarpeta.

### Propiedad de los archivos

Hay un juego de permisos que hace que todo encaje:

- Los archivos de WordPress pertenecen **al usuario de la aplicación** (root en el contenedor de Laravel, o tu usuario en local). Laravel puede escribir el tema y el sitio no.
- `uploads/` y `database/` pertenecen a `www-data` (uid 82). El sitio puede escribir ahí y en ningún otro sitio.

Esa asignación la hace una tarea de "setup" al crear el sitio: un contenedor desechable, sin red, que copia el WordPress horneado de la imagen y ajusta la propiedad. Corre como root, pero solo ejecuta un script fijo del runner y solo ve las carpetas de ese sitio.

### WordPress endurecido, pero solo en desarrollo

El `wp-config.php` ya no lo genera WP-CLI: lo escribe Laravel con claves nuevas por sitio y estas constantes:

```php
define( 'DISALLOW_FILE_MODS', true );       // sin instalar plugins ni temas
define( 'DISALLOW_FILE_EDIT', true );       // sin editor de código en el escritorio
define( 'WP_HTTP_BLOCK_EXTERNAL', true );   // no esperar timeouts sin internet
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'DISABLE_WP_CRON', true );
```

`WP_HTTP_BLOCK_EXTERNAL` no es solo seguridad: sin internet, cada visita al escritorio esperaría el timeout de las comprobaciones de actualizaciones. Con la constante, WordPress ni lo intenta.

El cliente sigue siendo administrador. Verificado dentro del contenedor:

```text
can install_plugins  => false
can edit_themes      => false
can manage_options   => true
```

## 3. El site runner: el único con las llaves

El runner es PHP plano sin Composer ni framework, servido con `php -S` en su propio contenedor. Es lo único que monta `/var/run/docker.sock`, solo escucha en la red `d2p-runner` y no guarda ningún secreto aparte del token que comparte con Laravel.

Esta es su API completa:

```text
POST   /sites/{site}/setup   copiar WordPress en un sitio nuevo
POST   /sites/{site}/start   crear y arrancar su contenedor
POST   /sites/{site}/stop    pararlo
GET    /sites/{site}         {"exists": bool, "running": bool}
DELETE /sites/{site}         borrar el contenedor y vaciar sus carpetas
POST   /sites/{site}/wp      {"args": [...]} ejecutar WP-CLI dentro del sitio
POST   /builds/{build}/copy  copiar un sitio para exportarlo
POST   /builds/{build}/wp    ejecutar WP-CLI sobre esa copia
```

Ningún endpoint acepta una imagen, un montaje o un flag de Docker: el cuerpo de las peticiones es, como mucho, una lista de argumentos de WP-CLI. Los nombres de sitio y de build se validan con una sola función:

```php
public static function assertName(string $name): string
{
    if (preg_match('/^[a-z0-9][a-z0-9-]{0,62}$/', $name) !== 1) {
        throw new InvalidArgumentException('Invalid name.');
    }

    return $name;
}
```

Los argumentos de WP-CLI tienen que ser una lista de strings (nunca una cadena que pase por un shell), y se rechazan `--path`, `--ssh` y `--http`, para que un comando siempre apunte al WordPress del propio contenedor.

Para hablar con Docker uso cURL contra el socket Unix, con `CURLOPT_UNIX_SOCKET_PATH`. La única parte algo rara es la salida de `docker exec`: sin TTY, Docker multiplexa stdout y stderr en el mismo stream, con una cabecera de 8 bytes por bloque:

```php
while ($offset + 8 <= strlen($stream)) {
    $header = unpack('Ctype/x3/Nsize', substr($stream, $offset, 8));
    $streams[$header['type'] === 2 ? 2 : 1] .= substr($stream, $offset + 8, $header['size']);
    $offset += 8 + $header['size'];
}
```

### En Laravel: `SiteRuntime` y `WpCli`

Del lado de Laravel, `SiteRuntime` es un cliente HTTP del runner, y `WpCli` dejó de lanzar procesos locales:

```php
public function run(Project $project, array $arguments, int $timeout = 300): string
{
    return $this->runtime->wp($project, $arguments, $timeout);
}
```

Los scripts que Laravel necesita ejecutar dentro de WordPress (sembrar páginas, exportar contenido) se escriben en la carpeta de control del sitio, que el contenedor ve de solo lectura en `/d2p/control`, y se ejecutan con `wp eval-file`. En el MVP esos archivos temporales se escribían en la raíz web, accesibles por HTTP mientras existían.

## 4. Exports: no confiar en nada que salga del sitio

El export es el único punto donde datos del sitio vuelven a Laravel. En el post anterior conté los tres abusos que encontré (rutas de imágenes, CSS con `@plugin` y symlinks); aquí va cómo se cerró cada uno.

### La ruta de las imágenes

La lista de imágenes que devuelve WordPress se trata como dato no confiable. Primero se valida la ruta como texto y después se resuelve en disco, porque un prefijo correcto no garantiza nada si hay symlinks por medio:

```php
$prefix = '/var/www/html/wp-content/uploads/';

if (! str_starts_with($containerPath, $prefix) || str_contains($containerPath, '..') || str_contains($containerPath, "\0")) {
    return null;
}

$uploads = realpath($project->site_path.'/wp-content/uploads');
$path = $project->site_path.'/wp-content/uploads/'.substr($containerPath, strlen($prefix));
$realPath = realpath($path);

if ($uploads === false || $realPath === false || is_link($path) || ! is_file($realPath) || ! str_starts_with($realPath, $uploads.'/')) {
    return null;
}
```

Fíjate en el `is_link($path)` sobre la ruta original y no sobre la resuelta: `realpath()` ya ha seguido el enlace, así que comprobarlo después no serviría de nada.

### El CSS del tema

Laravel compila el CSS con `@tailwindcss/node`, así que el bloque `@theme` no puede venir del sitio. La función que lo genera se sacó a un archivo sin dependencias de WordPress:

```php
if (! function_exists('wp_ai_tailwind_theme_css_for')) {
    function wp_ai_tailwind_theme_css_for(array $tokens): string
    {
        // Valida colores (#hex) y fuentes (letras y espacios) y devuelve el bloque @theme.
    }
}
```

El tema la usa en desarrollo y Laravel la carga **desde sus propios archivos** (no desde la copia del sitio) con los tokens de su base de datos. Hay una sola fuente de verdad y el sitio nunca decide qué CSS se compila.

### Symlinks y archivos especiales

Además de symlinks, un sitio puede plantar **FIFOs** en `uploads/`, que dejan colgado a quien intente leerlos. Y había un problema extra: la extensión de SQLite crea la base de datos con permisos restrictivos, así que Laravel ni siquiera podía leerla. Las dos cosas se resolvieron igual: **la copia la hace el runner** en un contenedor desechable que solo ve ese sitio (de solo lectura) y la carpeta del export:

```sh
set -e
mkdir -p /build/public_html
cp -R /site/. /build/public_html/
find /build ! -type f ! -type d -delete
chown -R 0:0 /build
```

El `find` borra todo lo que no sea un archivo o una carpeta normal. Como el contenedor solo ve esas dos carpetas, un symlink a `/etc/passwd` apunta al `/etc/passwd` de un contenedor que se destruye al terminar.

Después, todos los comandos de WP-CLI del export (cambiar las URLs a producción, volcar la base de datos a MySQL, el `VACUUM` de SQLite...) corren en **otro contenedor desechable sin red**, como `www-data`. Para no arrancar un contenedor por comando, el runner los ejecuta en lote con un pequeño script que se detiene en el primer error.

Por último, al crear el ZIP, Laravel ignora cualquier enlace, por si el contenedor del export hubiera dejado alguno:

```php
foreach (Finder::create()->files()->ignoreDotFiles(false)->in($build) as $file) {
    if (! $file->isLink()) {
        $zip->addFile($file->getPathname(), $project->slug.'/'.$file->getRelativePathname());
    }
}
```

### El `wp-config.php` de producción

Laravel genera uno nuevo con claves nuevas y la base de datos fuera de la raíz web, sin ninguna de las constantes de desarrollo. Que no se cuele ninguna tiene su propio test:

```php
expect($config)->not->toContain('DISALLOW_FILE_MODS', 'DISALLOW_FILE_EDIT', 'WP_HTTP_BLOCK_EXTERNAL');
```

## 5. Red

En producción los sitios viven en una red overlay `--internal`, a la que solo se conectan ellos y la aplicación (para que Caddy les pase las vistas previas). El runner está en otra red, `d2p-runner`, que los sitios no ven.

Como conté en el post anterior, `--internal` corta internet pero no el acceso al host por el gateway. Esta es la prueba que uso para comprobarlo en cada servidor:

```bash
docker network create --internal d2p-probe
docker run --rm --network d2p-probe busybox:1.36 sh -c \
  "wget -T 3 -qO- http://$GATEWAY:18999/ && echo HOST_REACHABLE"
```

Si imprime `HOST_REACHABLE`, la guía de despliegue añade una regla de `iptables` que descarta el tráfico de esa subred hacia el host, y se repite la prueba hasta que falle.

## 6. Vistas previas privadas con Caddy `forward_auth`

Las URLs pasaron de `p{puerto}` a `s-{uuid}.d2p-preview.com`, lo que de paso elimina el límite de 899 proyectos que imponía el rango de puertos. Caddy reparte por host:

```caddy
@preview header_regexp preview Host ^s-([a-z0-9][a-z0-9-]*)\.

@previewAccess {
    header_regexp Host ^s-([a-z0-9][a-z0-9-]*)\.
    path /__d2p/*
}

handle @previewAccess {
    root * /app/public
    php_server
}

handle @preview {
    forward_auth 127.0.0.1:{$PORT:80} {
        uri /__d2p/verify
    }

    reverse_proxy d2p-site-{re.preview.1}:8080
}
```

(En el Caddyfile real esos regex van dentro de un placeholder de variable de entorno, `{$WP_PREVIEW_HOST_REGEX:...}`, para poder cambiarlos.)

El flujo es este:

1. El Studio genera enlaces del tipo `https://s-{uuid}.../__d2p/login?token=...`. El token va cifrado con la `APP_KEY` y lleva el sitio, el usuario, la ruta de destino y una caducidad de **10 minutos**.
2. Laravel valida el token, comprueba que el host de la petición es el de ese sitio y que el usuario sigue en el workspace, y deja una cookie.
3. En cada petición posterior, Caddy pregunta a `/__d2p/verify` antes de pasar al contenedor. Un `204` deja pasar y un `401` devuelve una página de "Vista previa privada".

La cookie está pensada para no poder salir de su sitio:

```php
Cookie::create('__Host-d2p_preview', $value, $expires, '/', null, true, true, false, Cookie::SAMESITE_NONE, true);
```

- **`__Host-`**: el navegador la rechaza si no es `Secure`, no tiene `Path=/` o lleva `Domain`, así que solo vale para ese host exacto.
- **`SameSite=None` + `Partitioned` (CHIPS)**: funciona dentro del iframe del Studio, que está en otro dominio, sin depender de las cookies de terceros "clásicas".
- **El contenido** va cifrado y ligado al sitio: la cookie de un sitio no abre otro.

Como cada imagen, CSS y JS del sitio pasa por `verify`, la comprobación de pertenencia al workspace se cachea un minuto. Las rutas `/__d2p/*` van **fuera del grupo `web`** de Laravel (sin sesión ni CSRF), registradas en `bootstrap/app.php` con `then:`.

Para verificar el enrutado (y para encontrar el bug del `{0,62}` que conté en el otro post) levanté un FrankenPHP real con un sitio falso y probé cada caso con `curl`:

```text
preview sin cookie        [401] DENIED
preview con cookie        [200] WORDPRESS SITE
login en el host preview  [200] LARAVEL LOGIN
host de la app            [200] LARAVEL APP
otro sitio con la cookie  [401] DENIED
```

## 7. Desarrollo local: el mismo modelo

No quería que en local se probara una cosa y en producción corriera otra, así que **en desarrollo también se usa Docker**. `php artisan dev` arranca el runner con un comando propio, `app:site-runner`, que lo configura a partir de `config/wordpress.php`:

- Monta carpetas del host en vez de un volumen.
- Publica el puerto de cada sitio **solo en `127.0.0.1`** (`8100 + id`), sin Caddy de por medio.
- La red no es interna, para poder publicar puertos (Docker no publica puertos en redes internas).
- Si la imagen no existe, la construye la primera vez.

Registrarlo en `php artisan dev` es una línea gracias a `DevCommands`:

```php
DevCommands::artisan('app:site-runner', 'sites');
```

## 8. Cómo lo probé

- **Tests unitarios del runner**: comprueban propiedades de seguridad de la especificación del contenedor (usuario sin root, `CapDrop: ALL`, montajes de solo lectura, sin puertos publicados en producción, tareas sin red) y la validación de nombres y argumentos.
- **Tests de Laravel** con `Http::fake()` para el runner: el flujo de provisión, los exports con adjuntos maliciosos (rutas absolutas, `..`, symlinks) y el acceso a las vistas previas (otro sitio, usuario expulsado del workspace, tokens caducados o manipulados).
- **Una prueba de punta a punta contra Docker real**: crear un sitio, sembrar una página y renderizarla, comprobar permisos y red dentro del contenedor, plantar un symlink y un FIFO, exportar tema y sitio, y borrarlo todo.
- **Un "plugin malicioso" de prueba** dentro del contenedor, para ver con mis propios ojos qué bloqueaba cada capa.

Para que los tests nunca toquen un runner real (en local podría estar corriendo con Docker de verdad), `phpunit.xml` apunta el runner a `127.0.0.1:1`.

## Checklist para copiar

Si quieres montar algo parecido, esta es la lista que repasaría antes de abrirlo al público:

- [ ] Contenedor del usuario con `User` sin root, `Env` vacío, `CapDrop: ALL` y `no-new-privileges`.
- [ ] `ReadonlyRootfs`, código montado en solo lectura y escritura solo en las carpetas de datos.
- [ ] Límites de `Memory`, `MemorySwap`, `NanoCpus` y `PidsLimit`.
- [ ] `disable_functions` y `open_basedir` en el servidor PHP, y un router que bloquee base de datos, ocultos y PHP en uploads.
- [ ] El socket de Docker solo en un servicio aparte, con una API de acciones y nombres validados por regex.
- [ ] Rutas que vuelven del sitio validadas como texto **y** con `realpath()`, comprobando `is_link()` antes de resolver.
- [ ] Copias de datos del usuario en un contenedor desechable que borre todo lo que no sea archivo o carpeta.
- [ ] Red interna **más** regla de firewall hacia el host, verificada con una prueba real.
- [ ] Vistas previas detrás de `forward_auth` con cookie `__Host-` ligada al host.
- [ ] Tests que nunca puedan alcanzar un runner real.
