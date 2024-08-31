---
postTitle: 'Crea tu primer panel administrativo con FilamentPHP'
datePublished: '06/03/2024'
image:
    url: 'https://www.datocms-assets.com/41779/1717433470-1_qmhn9eusdlveomqcae1sta.webp'
tags: ["php", "laravel", "filamentphp", 'tutorial']

---

## ¿Qué es FilamentPHP?
**FilamentPHP** es un paquete para **Laravel** que sirve para crear paneles administrativos de una manera rápida y sencilla, sin tener que tocar HTML o CSS, este usa el famoso stack conocido como **TALL Stack** el cual está compuesto por **TailwindCSS, AlpineJS, Laravel y Livewire** trae un conjunto de componentes interactivos prediseñados lo cuales son usados para crear nuestros paneles en tiempo récord.

### Requisitos
FilamentPHP para funcionar necesita:

* PHP 8.1+
* Laravel v10.0+
* Livewire v3.0+
* Composer v2.0+


## Primeros pasos 🚀
Para empezar necesitamos crear un proyecto en **Laravel**, el cual crearemos usando el siguiente comando:

```bash
composer create-project laravel/laravel filament-blog  
````

Luego que este comando termine de ejecutarse vamos a conectar el proyecto a una base de datos, para ello vamos a nuestro archivo **.env** y lo editamos con nuestros credenciales de base de datos, una vez listo continuamos con el siguiente paso que sería ejecutar las migraciones

```bash
php artisan migrate
```

## Instalando FilamentPHP
ya listo los pasos anteriores procedemos a instalar **FilamentPHP** para hacer esto tenemos que ejecutar el siguiente comando:

```bash
composer require filament/filament:"^3.2" -W
 
php artisan filament:install --panels
```

Como pueden ver estamos ejecutando dos comandos, el primero instala el paquete de **FilamentPHP** en su última versión y el segundo instala los paneles, cuando lo ejecutamos nos saldrá lo siguiente en consola:

![](https://www.datocms-assets.com/41779/1717434207-1_w1pjd_awjtfvki_fsl2w1q.webp)

En mi caso le dije que no, antes de continuar volvemos a abrir fichero **.env** y agregamos el puerto 8000 en nuestra variable de entorno _APP_URL_ quedando de esta manera:

![](https://www.datocms-assets.com/41779/1717434272-1_wpf9jujycb7qldm7kjv51w.webp)

Lo siguiente que haremos es crear un usuario con **FilamentPHP** usando el comando:

```bash 
php artisan make:filament-user
```

Seguimos los pasos que nos piden

![](https://www.datocms-assets.com/41779/1717434441-1_t4bnmd_awecejodsx9tqcq.webp)

Ya con esto listo podremos entrar a la siguiente URL:

```
http://localhost:8000/admin/login
```

Al entrar en esta URL lo que veremos será el siguiente formulario donde nos loguearemos con los credenciales del usuario que creamos previamente

![](https://www.datocms-assets.com/41779/1717434672-1_xtiflpkdimz3gx0bkesxpq.webp)

Ya dentro veremos este dashboard

![](https://www.datocms-assets.com/41779/1717434810-1_kwhg35qhcstrddm7ntrryg.webp)

Que viene con lo básico como la funcionalidad para el light/dark mode y Logout, como podemos ver en nuestro sidebar no tenemos todavía ningún recurso, para ello en los siguientes pasos iremos creando nuestros recursos para que se vayan agregando en nuestro sidebar.

## Creando nuestro primer recurso
Lo primero que tenemos que hacer es crear las migraciones y modelos, para ello tenemos que ejecutar dos comandos que serían los que les muestro a continuación:

```bash
php artisan make:model Category -m
php artisan make:model Post -m
```


Estos comandos nos crean los modelos y migraciones que vamos a editar, ahora abrimos la migración de **category** que está ubicada en ```database/migrations/xxxx_xx_xx_xxxxxx_create_categories_table.php```

y pegamos este código:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
```

Luego continuamos con la migración de posts ```database/migrations/xxxx_xx_xx_xxxxxx_create_posts_table.php```

agregando este código a la migración

```php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');
            $table->unsignedBigInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories');
            $table->string('title');
            $table->text('body');
            $table->string('image');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
```
¡Listo!!! Ahora vamos a continuar con las relaciones de nuestras migraciones en los modelos 🙌, pero antes vamos a correr nuestras nuevas migraciones con el comando:

```bash 
php artisan migrate
```

Ahora sí vamos a empezar editando **app/Models/Category.php**

y pegamos este código:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     *  Get all of the posts for the Category
     *
     *  @return BelongsTo<int, Post>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

En la relación que estamos estableciendo, se especifica que una categoría contendrá varios posts mediante el uso del método **hasMany** (tiene muchos). En otras palabras, estamos haciendo una relación de uno a muchos.

Ahora seguiremos con el modelo ***app/Models/Post.php*** donde también haremos varias relaciones

```php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Get the category that owns the Post
     *
     * @return BelongsTo<int, Category>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the user that owns the Post
     *
     * @return BelongsTo<int, User>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

En este modelo hemos agregado dos relaciones, para ellos hemos usado el método **BelongsTo** (Pertenece a) para indicar que cada post va a pertenecer a una categoría y a un usuario.

Antes de continuar podemos ver que en ambos modelos el atributo, protected _$guarded = [];_ esto lo que hace es ayudar a que podamos hacer acciones masivas, editar o añadir campos masivos con **FilamentPHP**

Ahora para terminar con los modelos vamos a agregar un nuevo método en nuestro modelo de **User** ***app/Models/Post.php*** de esta manera

```php
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all of the posts for the User
     *
     * @return HasMany<int, Post>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

Lo que hicimos fue agregar el método **posts** usando otra vez el método de eloquent **hasMany** (tiene muchos) para indicar que un usuario tendrá muchos posts.

## La magia de FilamentPHP🪄
Ahora se viene lo chido 😎 vamos a crear nuestro primer CRUD usando FilamentPHP y su magia al momento de crear recursos vamos a usar el comando:

```bash
php artisan make:filament-resource --generate
````

Al momento de ejecutarlo en nuestra consola nos saldrá como en la imagen de abajo donde vamos a escribir **Category** luego presionamos enter

![](https://www.datocms-assets.com/41779/1717436383-1_rg9exthrxeqwtp3z-0b1vw.webp)

Esto nos va a generar un nuevo recurso cuando volvemos a nuestro dashboard y actualizamos, podemos ver que ahora nos sale category en el sidebar

![](https://www.datocms-assets.com/41779/1717436421-1_tbxdq4pql1fospmtksyosa.webp)

Y si le damos clic tenemos las lo siguiente

![](https://www.datocms-assets.com/41779/1717437227-1_d9t1h3erhu6zbgb2ryxldg.webp)

Tenemos una tabla que por el momento está vacía y vamos a **new category*
tenemos el formulario para insertar categorías

![](https://www.datocms-assets.com/41779/1717437269-1_ewrl80zkxrbdtk9gwmeixw.webp)


Si insertamos una categoría y volvemos a nuestro listado podemos ver el registro.

![](https://www.datocms-assets.com/41779/1717437538-1_siwhw8sac0kmnddqpgpfmg.webp)

Ahora haremos lo mismo para crear el recurso post nuevamente usando el comando que utilizamos para crear el de category

```bash
php artisan make:filament-resource Post --generate
```

Como pueden ver esta es otra manera de usar el comando agregando directamente el modelo del cual queremos generar el recurso y como paso anteriormente con **category** nos generó un CRUD para el recurso de post donde podemos seleccionar un usuario, una categoría, agregar un título, el cuerpo del post y subir una imagen.

![](https://www.datocms-assets.com/41779/1717437608-1_siwhw8sac0kmnddqpgpfmg.webp)


Como podrán ver hemos creado dos **CRUD** en un tiempo récord con toda su funcionalidad, gracias a **FilamentePHP** que nos ayuda a crear estos paneles administrativos de una manera rápida, este post solo es una introducción básica, a lo que es este paquete más adelante seguiremos agregando cositas a este mismo proyecto el cual le dejaré el enlace de GitHub aquí debajo, dicho eso nos vemos en un próximo post 👨‍💻

Repo del proyecto: <a target="_blank" href="https://github.com/ivanmercedes/tutorial-filamente-blog">tutorial-filamente-blog</a>