---
name: "Cómo domé el caos de los filtros en Laravel"
datePublished: "10/28/2025"
postDescription: "Una forma simple y profesional de manejar múltiples filtros en Laravel sin llenar tus controladores de condiciones repetidas."
image:
  url: "/posts/como-dome-el-caos-de-los-filtros-en-laravel.jpg"
tags: ["Laravel", "Inertia", "Eloquent", "Clean Code", "Backend"]
---

Saludos comunidad, estaba yo, tranquilo, haciendo unos cuantos ajustes a mi proyecto cuando me tope con un controlador que ya estaba empezando a parecerse a un monstruo de Frankenstein. si bien no tenía tantas condiciones para filtrar datos a larga segun se continuara agregando nuevas condiciones de filtro iba a empezar a ser dificil entender qué hacía cada parte del código.

Entonces decidí tomar cartas en el asunto y buscar una forma más elegante de manejar los filtros en Laravel. Aquí les comparto cómo lo hice.

Imaginemos que tenemos el siguiente codigo en nuestro controlador:

```php

// Ejemplo 

public function index(Request $request)
{
      $query = Submission::query();

    if ($request->search) {
        $query->where(function($q) use ($request) {
            $q->whereHas('form', function($q2) use ($request) {
                $q2->where('name', 'like', '%' . $request->search . '%');
            });
            $query->orWhere('content', 'like', '%' . $request->search . '%'); 
        });
    }

    if ($request->form) {
        if ($request->form !== 'all') {
            $query->where('form_id', $request->form);
        }
    }

    if ($request->status) {
        if ($request->status !== 'all') {
            $query->where('status', $request->status);
        }
    }

    if ($request->read) {
        if ($request->read !== 'all') {
            if ($request->read === 'read') {
                $query->where('is_read', true);
            } else if ($request->read === 'unread') {
                $query->where('is_read', false);
            }
        }
    }

    if ($request->starred) {
        if ($request->starred !== 'all') {
            if ($request->starred === 'starred') {
                $query->where('is_starred', true);
            } else if ($request->starred === 'unstarred') {
                $query->where('is_starred', false);
            }
        }
    }

    if ($request->date_from) {
        $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->date_to) {
        $query->whereDate('created_at', '<=', $request->date_to);
    }

    $submissions = $query->with('form:id,name')->get(); 
     // continuara... 
     // XDDDD
```

## Separar responsabilidades

Lo que hare es separar las responsabilidades en tres partes claras:

- El **Request** valida lo que entra.
- El **Scope** aplica la lógica de filtrado.
- El **Controlador** solo orquesta.

Lo primero que hice fue crear  **SubmissionFilters** en **app/Models/Scopes**, donde encapsulé toda la lógica de filtros que vienen del frontend

```php
class SubmissionFilters
{
    public static function apply(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, fn ($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->whereHas('form', fn ($q2) =>
                        $q2->where('name', 'like', "%{$search}%")
                    )
                    ->orWhere('content', 'like', "%{$search}%");
                })
            )
            ->when(($filters['status'] ?? 'all') !== 'all', fn ($q) =>
                $q->where('status', $filters['status'])
            )
            ->when(($filters['read'] ?? 'all') !== 'all', fn ($q) =>
                $filters['read'] === 'read'
                    ? $q->where('is_read', true)
                    : $q->where('is_read', false)
            )
            ->when($filters['date_from'] ?? null, fn ($q, $date) =>
                $q->whereDate('created_at', '>=', $date)
            )
            ->when($filters['date_to'] ?? null, fn ($q, $date) =>
                $q->whereDate('created_at', '<=', $date)
            );
    }
}
```

## Un Request dedicado para validación

En lugar de llenar el controlador de validaciones, creamos un **SubmissionFilterRequest** para mantener las reglas en un solo lugar y evitar datos inválidos.

```php
class SubmissionFilterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'read' => ['nullable', 'in:all,read,unread'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ];
    }

    public function filters(): array
    {
        return $this->only(['search', 'status', 'read', 'date_from', 'date_to']);
    }
}
```

Esta práctica no solo mejora la organización del código, sino que también refuerza la seguridad de la aplicación. Como se menciona en una guía sobre validación en Laravel:

> "La validación de solicitudes en Laravel ayuda a mantener la seguridad y la integridad de los datos, evitando ataques maliciosos y asegurando que solo se procesen datos válidos."
> — *Laravel Request Validation: A Complete Guide on Data Handling, [Medium](https://medium.com/@prevailexcellent/laravel-form-request-validation-a-complete-guide-on-data-handling-1f181a74123f)*

Al centralizar las reglas de validación en una clase dedicada, evitamos la duplicación de código y reducimos el riesgo de errores. Además, esta separación facilita las pruebas unitarias y mejora la mantenibilidad del sistema.


## El controlador reducido a lo esencial

Continuando con el concontrolador al tener todo separado, el controlador finalmente se ve limpio:

```php
public function index(SubmissionFilterRequest $request)
{
    $filters = $request->filters();

    $submissions = Submission::query()
        ->with('form:id,name')
        ->tap(fn ($q) => SubmissionFilters::apply($q, $filters))
        ->orderByDesc('created_at')
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Submissions/Index', [
        'submissions' => $submissions,
        'filters' => $filters,
    ]);
}
```

Y lo mejor es que la misma lógica la puedo usar también en el **show()** o en una **exportación**, sin duplicar una sola línea.

## Resultado

El resultado final es un código más legible y fácil de mantener, lógica de filtros totalmente reutilizable y validaciones centralizadas.
y adicionalmente a eso menos probabilidad de errores cuando agrego nuevos filtros

Y recuerda: con gran poder (de Eloquent) viene una gran responsabilidad (de mantenerlo limpio).
