---
title: "Tu agencia no tiene un problema de legacy: tiene un problema si sigue creando legacy"
name: "Tu agencia no tiene un problema de legacy: tiene un problema si sigue creando legacy"
slug: "agencia-software-legacy-deuda-tecnica"
datePublished: "08/11/2026"
postDescription: "Reutilizar tecnología legacy puede acelerar el desarrollo, pero también convertir decisiones antiguas en deuda técnica para proyectos nuevos. Analizamos cuándo reutilizar código deja de ser una ventaja."
tags: ["legacy", "deuda técnica", "software engineering", "agencias de software", "arquitectura de software"]
---

Hace un tiempo comencé a cuestionarme una práctica que puede ser bastante común en agencias de desarrollo: **¿hasta qué punto estamos reutilizando código por eficiencia y en qué momento simplemente estamos creando deuda técnica por comodidad?**

Imaginemos este escenario. Hace años desarrollaste un sistema utilizando CodeIgniter y PHP 7. El proyecto funciona, tiene autenticación, usuarios, permisos, panel administrativo y prácticamente todos los CRUD que normalmente necesitas. Llega un cliente nuevo con requerimientos relativamente parecidos, así que parece lógico hacer una copia:

```text
proyecto-cliente-anterior/
        ↓
      copiar
        ↓
  cambiar diseño
        ↓
  modificar CRUD
        ↓
  nuevo proyecto
```

Probablemente acabas de ahorrar semanas de desarrollo. El problema es que también acabas de convertir decisiones tecnológicas tomadas hace años en decisiones arquitectónicas de un proyecto que está comenzando hoy. Cuando esto se convierte en la forma habitual de trabajar de una agencia, el problema deja de ser únicamente técnico y se convierte en un problema organizacional.

## Legacy no significa automáticamente malo

Primero hay que hacer una distinción importante: tener software legacy no es necesariamente una mala práctica. Una empresa puede tener una aplicación desarrollada hace diez años que procesa millones de pesos, tiene cientos de usuarios y cumple perfectamente su función. Reescribirla simplemente porque existe una tecnología más moderna podría incluso ser una pésima decisión.

El problema aparece cuando utilizamos ese mismo argumento para proyectos nuevos. Hay una diferencia enorme entre decir:

> "Tenemos que mantener este sistema porque migrarlo actualmente no justifica el costo y el riesgo."

y decir:

> "Voy a utilizar esta tecnología para el nuevo proyecto porque ya tengo casi todo hecho."

La primera puede ser una decisión empresarial perfectamente racional. La segunda merece, como mínimo, una evaluación mucho más seria.

## El proyecto puede nacer con deuda técnica

Normalmente pensamos en la deuda técnica como algo que aparece con el tiempo: comenzamos un proyecto limpio y poco a poco acumulamos decisiones rápidas, dependencias, workarounds y código difícil de mantener. Pero también podemos introducir deuda técnica desde el primer commit.

Supongamos que nuestra agencia conserva una aplicación construida originalmente para PHP 7 y seguimos utilizándola como base para nuevos proyectos. PHP 7.4 terminó oficialmente su ciclo de vida en noviembre de 2022, mientras que la documentación actual de CodeIgniter indica que PHP 8.2 o superior es requerido por la versión actual del framework y recomienda actualizar cuando se utilizan versiones inferiores.

Esto significa que nuestra "ventaja" inicial tiene un costo oculto. Ahorramos tiempo porque tenemos código construido, pero el nuevo proyecto puede comenzar dependiendo de un runtime que ya terminó su ciclo de soporte.


## "Funciona" no significa "está mantenido"

Este probablemente sea uno de los errores más fáciles de cometer. El sistema abre, los formularios funcionan, los registros se guardan y los clientes pueden iniciar sesión. Entonces pensamos:

> ¿Para qué tocarlo?

Porque funcionalidad y mantenibilidad son problemas diferentes. OWASP incluye explícitamente los **componentes vulnerables y desactualizados** dentro de su Top 10 de riesgos de seguridad para aplicaciones. Entre las situaciones que identifica se encuentra utilizar software vulnerable, sin soporte o desactualizado, incluyendo frameworks, librerías, runtimes, servidores y otros componentes.

OWASP también recomienda mantener un inventario de versiones, monitorear vulnerabilidades y disponer de un proceso continuo de actualización y aplicación de parches. Es decir, mantener actualizado el stack no debería ser un evento extraordinario que ocurre cuando algo deja de funcionar, sino que debería formar parte del mantenimiento normal del software.

## Los CMS muestran perfectamente este problema

Esto también ocurre cuando una agencia se acostumbra a una determinada versión de un CMS. Supongamos que conocemos perfectamente Joomla 3: tenemos nuestros componentes, nuestros módulos y nuestros templates; sabemos exactamente dónde está cada cosa y podemos construir una página muy rápidamente. Entonces aparece la tentación:

> "Vamos a seguir utilizando Joomla 3 porque conocemos mejor esa versión."

Pero actualmente la propia documentación de Joomla coloca 3.x dentro de las versiones anteriores que **ya no son mantenidas**, mientras que Joomla 6.1 aparece como la versión estable actual.

El problema no es Joomla. El problema es convertir nuestro conocimiento de una versión determinada en un requisito tecnológico para todos los proyectos futuros.

Algo parecido ocurre con WordPress. WordPress mantiene una compatibilidad hacia atrás considerable, pero eso no significa que recomiende ejecutar nuestros proyectos sobre cualquier runtime antiguo que todavía consiga funcionar. Su documentación para hosting recomienda actualmente PHP 8.3 o superior para producción y señala explícitamente que algunas versiones anteriores de PHP se mantienen por compatibilidad aunque ya hayan alcanzado su End of Life.


**Compatibilidad no significa recomendación.**

Esa diferencia es extremadamente importante.

## La comodidad del desarrollador termina convirtiéndose en una restricción del cliente

Aquí es donde creo que el problema deja de ser puramente técnico. Imaginemos que un cliente contrata nuestra agencia en 2026 para desarrollar un sistema completamente nuevo y nosotros decidimos utilizar una versión antigua de un framework simplemente porque tenemos un proyecto anterior que podemos reutilizar.

¿Para quién estamos optimizando realmente? Probablemente para nosotros. Nos permite entregar más rápido, reduce las horas iniciales de desarrollo y el equipo ya conoce el código. Desde el punto de vista de la agencia, a corto plazo parece una decisión bastante conveniente.

El problema es que el cliente recibe un software cuya vida tecnológica comenzó varios años antes que su propio proyecto. Cuando llegue el momento de actualizar PHP, cambiar de hosting, instalar una dependencia moderna o incorporar desarrolladores externos, alguien tendrá que asumir el costo de esa decisión. Y normalmente será el cliente.


## Reutilizar código no es el problema

Aquí tampoco deberíamos ir al extremo contrario. Una agencia que comienza absolutamente todo desde cero probablemente también está haciendo algo mal. La reutilización es una ventaja competitiva enorme: si después de desarrollar veinte sistemas administrativos todavía necesitamos implementar autenticación, permisos, uploads, auditoría y configuraciones desde cero en el proyecto número veintiuno, tenemos otro problema.

La pregunta correcta no es:

> ¿Debemos reutilizar?

La pregunta es:

> **¿Qué debemos reutilizar?**

Copiar aplicaciones completas indefinidamente puede provocar que cada nuevo proyecto termine heredando las decisiones técnicas del anterior:

```text
Proyecto 2019
    ↓
Proyecto 2020
    ↓
Proyecto 2022
    ↓
Proyecto 2024
    ↓
Proyecto 2026
```

Cada generación hereda decisiones, dependencias y limitaciones de la anterior. Una alternativa más sostenible sería extraer de esos proyectos aquello que realmente representa conocimiento reusable:

```text
Proyectos anteriores
        ↓
identificar patrones
        ↓
extraer componentes
        ↓
paquetes
        ↓
módulos
        ↓
starter kits
        ↓
actualización continua
        ↓
proyectos nuevos
```

De esta forma seguimos obteniendo la ventaja de tener "gran parte del trabajo hecho", pero en lugar de reutilizar indefinidamente una aplicación completa, reutilizamos las piezas y el conocimiento que realmente aportan valor. Así dejamos de depender de que un proyecto creado hace años continúe siendo la base tecnológica de todo lo que construimos en el futuro.


## El verdadero activo de una agencia no debería ser un ZIP de un proyecto viejo

Durante mucho tiempo una agencia puede acumular una carpeta parecida a esta:

```text id="x4epkh"
proyecto-base-final/
proyecto-base-final-2/
proyecto-base-nuevo/
proyecto-base-nuevo-final/
proyecto-base-2024/
```

Detrás de la broma existe un problema arquitectónico real: el conocimiento de la empresa termina almacenado accidentalmente dentro de proyectos de clientes anteriores. Una agencia más madura debería convertir ese conocimiento en infraestructura propia que pueda mantener, actualizar y reutilizar independientemente de cualquier proyecto.

Por ejemplo:

```text id="bl51vr"
agency-starter/
├── authentication
├── users
├── permissions
├── media
├── audit
├── notifications
├── settings
├── admin
├── seo
└── testing
```

Ese starter puede evolucionar con la agencia. Cuando cambia PHP, se actualiza; cuando cambia el framework, se prueba; cuando aparece una vulnerabilidad, se parchea; y cuando encontramos una mejor forma de resolver un problema, los proyectos futuros pueden beneficiarse de esa mejora. De esta manera, años de experiencia dejan de estar atrapados dentro de proyectos antiguos y se convierten en un activo tecnológico mantenible.

## Existe otro costo que normalmente no vemos: el conocimiento del equipo

Si todos nuestros proyectos nuevos utilizan la misma tecnología antigua, nuestro equipo también deja de tener motivos para evolucionar. Con el tiempo puede aparecer un círculo peligroso:

```text id="kt08w5"
Tenemos código antiguo
        ↓
somos productivos con él
        ↓
lo utilizamos en proyectos nuevos
        ↓
el equipo trabaja principalmente con él
        ↓
el equipo conoce todavía mejor el stack antiguo
        ↓
migrar parece cada vez más costoso
        ↓
seguimos utilizándolo
```

Después de varios años podemos terminar diciendo:

> "No podemos actualizar porque tenemos demasiado código viejo."

Pero ahí está precisamente la contradicción: tenemos demasiado código viejo porque durante años utilizamos ese mismo argumento para seguir produciendo más. Mientras más proyectos nuevos construimos sobre ese stack, más conocimiento acumula el equipo alrededor de él y más costoso parece abandonarlo. Lo que inicialmente era una decisión por comodidad termina convirtiéndose en una dependencia organizacional.

## Actualizar tampoco significa perseguir cada tecnología nueva

Existe un extremo contrario que tampoco considero saludable. Modernizar no significa migrar nuestros proyectos cada vez que aparece un nuevo framework de JavaScript ni utilizar la última versión de una tecnología el mismo día de su lanzamiento.

PHP, por ejemplo, publica guías oficiales de migración donde documenta nuevas características, funcionalidades obsoletas y cambios incompatibles entre versiones, precisamente porque una actualización importante requiere planificación y pruebas.


Una estrategia tecnológica responsable no consiste en utilizar siempre lo más nuevo, sino en utilizar tecnología **estable, soportada, mantenida, suficientemente conocida por el equipo, adecuada para el problema y con una estrategia razonable de actualización**.

Hay una enorme diferencia entre utilizar tecnología **stable** y mantener tecnología **legacy simplemente porque nos resulta cómoda**.


## Legacy debería ser una excepción consciente

Mi regla para una agencia sería bastante sencilla. Si hablamos de un proyecto existente, mantener tecnología legacy puede ser una decisión perfectamente válida cuando migrarlo no tiene sentido económico, siempre que conozcamos y mitiguemos los riesgos:

```text id="cq15h6"
¿Es un proyecto existente?
        ↓
Sí
        ↓
¿Migrarlo tiene sentido económicamente?
        ↓
No
        ↓
Mantener legacy + mitigar riesgos
```

La situación cambia cuando hablamos de un proyecto nuevo. En ese caso, el punto de partida debería ser un stack estable, con versiones soportadas, dependencias mantenidas y una estrategia que permita actualizar el proyecto con el tiempo:

```text id="rqr5xz"
Proyecto nuevo
        ↓
Stack estable
        ↓
Versiones soportadas
        ↓
Starter actualizado
        ↓
Dependencias mantenidas
        ↓
Plan de actualización
```

Eso no significa que nunca exista una razón válida para utilizar una tecnología antigua. Significa que **"porque ya tenemos el código hecho" no debería ser suficiente por sí solo para tomar una decisión arquitectónica**.

## La deuda técnica puede convertirse en deuda empresarial

Este es probablemente el punto más importante. Cuando un único proyecto tiene tecnología legacy, tenemos un problema de deuda técnica; pero cuando todos los proyectos nuevos de una agencia comienzan reutilizando la misma tecnología legacy, empezamos a tener algo más serio: **deuda técnica organizacional**.

Nuestra capacidad para desarrollar, vender, contratar, actualizar y mantener software comienza a depender de decisiones que tomamos hace muchos años. Y cuanto más software construimos sobre esas decisiones, más costosa parece la salida. Lo que comenzó como una forma de ahorrar unas semanas de desarrollo puede terminar condicionando la dirección tecnológica de toda la agencia.

Por eso modernizar una agencia no significa necesariamente reescribir todos los proyectos existentes. Muchas veces significa algo mucho más sencillo: **dejar de crear nuevos proyectos legacy**. Podemos mantener lo que todavía tiene sentido mantener, migrar cuando exista una justificación, extraer el conocimiento reusable de nuestros proyectos anteriores y convertirlo en herramientas internas modernas que puedan evolucionar junto con la agencia.

El objetivo no debería ser olvidar todo lo que construimos durante años, sino evitar que cada nuevo proyecto nazca condicionado por decisiones técnicas tomadas para un sistema desarrollado hace cinco o diez años.

Porque reutilizar nuestra experiencia es una ventaja competitiva. **Reutilizar indefinidamente nuestra deuda técnica no lo es.**


## Fuentes técnicas

* [OWASP A06: componentes vulnerables y desactualizados](https://owasp.org/Top10/2021/es/A06_2021-Vulnerable_and_Outdated_Components/)
* [requisitos oficiales de CodeIgniter 4](https://codeigniter.com/user_guide/intro/requirements.html)
* [guía oficial de migración PHP 7.4 → 8.0](https://www.php.net/manual/en/migration80.php)
* [versiones oficiales de Joomla](https://manual.joomla.org/versions/)
* [recomendaciones de PHP para WordPress](https://make.wordpress.org/hosting/handbook/server-environment/)
