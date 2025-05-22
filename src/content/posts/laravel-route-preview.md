---
name: " Laravel Route Preview: Visualiza tus rutas directamente en VS Code"
datePublished: "06/22/2025"
postDescription: "Laravel Route Preview es una extensión para Visual Studio Code que permite visualizar de forma rápida y clara todas las rutas definidas en un proyecto Laravel, directamente desde el editor."
image:
  url: "/posts/laravel-route-preview.png"
tags: ["visual studio code", "laravel", "extension"]
---

Como desarrollador Laravel, he ejecutado el comando:

```bash
php artisan route:list
```

más veces de las que puedo contar.

Es una herramienta esencial para revisar rutas, middlewares y controladores rápidamente.
Pero siempre sentí que había una forma más práctica de hacerlo, sin tener que ir a la terminal una y otra vez.

Por eso decidí crear Laravel Route Preview, una extensión gratuita para Visual Studio Code que permite visualizar todas las rutas de tu proyecto Laravel directamente desde el editor.

Mi objetivo con esta herramienta es agilizar el flujo de trabajo diario y hacer más cómodo el desarrollo con Laravel.

## 🚀 ¿Qué hace Laravel Route Preview?

Con esta extensión puedes:

- 🧭 Ver todas tus rutas en una tabla interactiva dentro de VSCode.
- 🧪 Filtrar rutas por método HTTP (GET, POST, PUT, etc.).
- 🔍 Hacer clic en una ruta y abrir directamente el controlador y método correspondiente.
- 🧵 Evitar repetir **_php artisan route:list_** cada vez que haces un cambio.

Todo esto con una interfaz clara, minimalista y sin salir del entorno de desarrollo.

## Captura de pantalla

![Laravel Route Preview](https://raw.githubusercontent.com/ivanmercedes/laravel-route-preview/main/assets/preview.png)

La tabla incluye columnas para:

- Método HTTP
- URI
- Acción del controlador
- Middleware

Además, puedes filtrar con un clic

## ⚙️ Cómo instalarla

1. Abre Visual Studio Code.
2. Ve a la sección de extensiones (Ctrl+Shift+X).
3. Busca: **Laravel Route Preview**
4. Haz clic en instalar.

También puedes instalarla desde [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=IvanMercedes.laravel-route-preview)

## Cómo usarla

1. Abre tu proyecto Laravel en VS Code.
2. Presiona **Ctrl+Shift+P** y escribe: **Laravel: Preview Routes**
3. ¡Listo! Verás una tabla interactiva con todas las rutas de tu app.

## 💡 ¿Por qué esta extensión?

Porque aunque php artisan route:list es útil, constantemente abrir la terminal para ejecutarlo es molesto.
Esta extensión ahorra tiempo y te da una vista más clara de la arquitectura de tus rutas.

> "_Simple but powerful idea. Bringing Artisan commands without repeating yourself again and again._"
> — [Ricardo Vargas](https://ricardovargas.me/es/)

## 📦 Requisitos

- Laravel 8 o superior.
- Tener PHP disponible en tu sistema (php en la terminal).
- Tener abierto un proyecto Laravel en VSCode.

## 🤝 Contribuye o apóyala

Puedes apoyar esta extensión:

- Dándole ⭐ en GitHub.
- Dejando un review en el Marketplace.
- Compartiendo con otros desarrolladores Laravel.

Repositorio: [https://github.com/ivanmercedes/laravel-route-preview](https://github.com/ivanmercedes/laravel-route-preview)

## 📝 Conclusión

**Laravel Route Preview** convierte un comando repetitivo en una herramienta visual y útil dentro de VSCode. Si trabajas frecuentemente con Laravel, esta extensión puede ahorrarte muchos pasos y hacer tu flujo de trabajo más fluido.
