---
postTitle: "Tutorial: Como Organizar Código en Filament 🚀 usando Archivos Separados"
datePublished: "01/19/2025"
image:
  url: "/posts/tutorial-como-organizar-codigo-en-filament-usando-archivos-separados.jpg"
tags: ["php", "laravel", "filamentphp", "tutorial"]
---

Hola chicos, en esta ocasión vengo un nuevo tutorial esperando que les sea útil en sus proyecto de Laravel usando Filament, como ya sabemos Filament es una herramienta poderosa para desarrollar paneles de administración en PHP con Laravel. Sin embargo, conforme nuestros recursos crecen, es común que los archivos se tornen largos y difíciles de mantener. Por eso en este tutorial, vamos a aprender cómo organizar mejor los recursos de Filament separando la configuración de componentes, en el ejemplo que usaré será un formulario usando el layout de tabs, pero de igual manera se puede utilizar con las demás maneras de organizar los formularios.

## 1. Problema Común: Archivos muy grandes

Cuando defines formularios complejos con Filament, podrías terminar con archivos grandes que contienen mucho código. Por ejemplo, un recurso que tiene varias tabs con campos y configuraciones puede verse así:

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProfileResource\Pages;
use App\Forms\Components\FilePreview;
use App\Forms\Components\UserLanguage;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\Group;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProfileResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $label = "Perfiles";

    public static function form(Form $form): Form
    {
        $userType = $form->getRecord()->user_type;

        return $form
            ->schema([
                Tabs::make('Tabs')
                    ->tabs([
                        Tabs\Tab::make('Información personal')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Group::make([
                                    Forms\Components\TextInput::make('name')
                                        ->label('Nombre completo del solicitante')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('user_type')
                                        ->label('Tipo de usuario')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('national_id')
                                        ->label('Cédula')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('phone_number')
                                        ->label('Teléfono')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('cell_phone')
                                        ->label('Celular')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('date_of_birth')
                                        ->label('Fecha de nacimiento')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('born_city')
                                        ->label('Ciudad de nacimiento')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('roster_number')
                                        ->label('Número de nomina')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('address')
                                        ->label('Dirección')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('city')
                                        ->label('Ciudad')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('email')
                                        ->label('Correo')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('sex')
                                        ->label('Sexo')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('marital_status')
                                        ->label('Estado civil')
                                        ->disabled(),
                                ])->columns(2),
                            ]),
                        Tabs\Tab::make('Información académica')
                            ->icon('heroicon-o-academic-cap')
                            ->schema([
                                Group::make([
                                    Forms\Components\TextInput::make('institution_name')
                                        ->label('Institución')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('graduation_year')
                                        ->label('Año de graduación')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('paa_av')
                                        ->label('AV')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('paa_ri')
                                        ->label('RI')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('paa_am')
                                        ->label('AM')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('paa_total')
                                        ->label('Total PAA')
                                        ->disabled(),

                                ])->columns(2),
                            ]),
                        Tabs\Tab::make('Datos laborales')
                            ->icon('heroicon-o-briefcase')
                            ->schema([
                                Group::make([
                                    Forms\Components\Checkbox::make('currently_working')
                                        ->label('¿Trabaja actualmente?')
                                        ->columnSpanFull()
                                        ->disabled(),
                                    Forms\Components\TextInput::make('workplace')
                                        ->label('Lugar de trabajo')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('job_title')
                                        ->label('Cargo que ocupa')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('work_phone')
                                        ->label('Teléfono de trabajo')
                                        ->disabled(),
                                    Forms\Components\TextInput::make('work_area')
                                        ->label('Área en la que se desempeña')
                                        ->disabled(),
                                ])->columns(2),
                            ]),
                        Tabs\Tab::make('Idiomas')
                            ->icon('heroicon-o-language')
                            ->schema([
                                Group::make([
                                    UserLanguage::make('user.languages')
                                        ->label('')
                                        ->disabled(),
                                ]),
                            ]),
                        Tabs\Tab::make('Documentos')
                            ->icon('heroicon-o-briefcase')
                            ->schema([
                                Group::make([
                                    FilePreview::make('id_copy')
                                        ->label('Copia de Cédula')
                                        ->disabled(),
                                    FilePreview::make('degree_copy')
                                        ->label('Copia de título de grado')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'bachiller';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('birth_certificate')
                                        ->label('Copia de Acta de nacimiento')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'docente';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('highschool_transcript')
                                        ->label('Copia de récord de notas')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'docente';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('highschool_certificate')
                                        ->label('Copia de certificado de bachiller')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'docente';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('entry_exam')
                                        ->label('Copia de examen de ingreso')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'docente';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('position_certification')
                                        ->label('Certificación de puesto')
                                        ->hidden(function ($record) use ($userType) {
                                            return $userType === 'bachiller';
                                        })
                                        ->disabled()
                                        ->columnSpanFull(),
                                    FilePreview::make('photo_2x2')
                                        ->label('Foto 2x2')
                                        ->disabled()
                                        ->columnSpanFull(),
                                ])
                                    ->relationship('documents'),
                            ]),
                    ])->columns(1),
            ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Correo')
                    ->searchable(),
                Tables\Columns\TextColumn::make('user_type')
                    ->label('Tipo de Usuario')
                    ->searchable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->query(User::query()->whereHas('roles', function (Builder $query) {
                $query->where('name', 'user');
            }));
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProfiles::route('/'),
            'create' => Pages\CreateProfile::route('/create'),
            'edit' => Pages\EditProfile::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getTableQuery(): Builder
    {

        return parent::getEloquentQuery()
            ->whereHas('roles', function (Builder $query) {
                $query->where('name', 'user');
            });
    }
}


```

Aunque funcional, este enfoque puede dificultar el mantenimiento a medida que siga creciendo. ¿Qué pasó si necesitás modificar un campo o agregar uno nuevo? Ahí es donde entra la separación de lógica.

---

## 2. Solución: Dividir en Archivos Reutilizables

### Crear Archivos de Configuración de Tabs

En lugar de definir todo el esquema dentro del recurso principal, podemos crear archivos separados para cada tab.

#### Ejemplo:

Vamos a crear un directorio para nuestros componentes en esta ruta:

```
app/Filament/Components/Tabs/
```

Dentro de este directorio, crea un archivo para cada tab. Por ejemplo, para la tab de "Documentos":

**`app/Forms/Components/Tabs/DocumentsTab.php`**

```php
<?php

namespace App\Forms\Components\Tabs;

use App\Forms\Components\FilePreview;
use Filament\Forms\Components\Group;
use Filament\Forms\Components\Tabs;

class DocumentsTab
{
    public static function get($userType): Tabs\Tab
    {
        return Tabs\Tab::make('Documentos')
            ->icon('heroicon-o-briefcase')
            ->schema([
                Group::make([
                    FilePreview::make('id_copy')
                        ->label('Copia de Cédula')
                        ->disabled(),
                    FilePreview::make('degree_copy')
                        ->label('Copia de título de grado')
                        ->hidden(fn($record) => $userType === 'docente')
                        ->disabled(),
                    // Más campos...
                ]),
            ]);
    }
}
```

haremos esto con todos los tabs que tengamos en nuestro recurso.

### Usar las tabs en el Recurso

Ahora puedes llamar a estas tabs en tu recurso principal para mantener el archivo limpio y organizado.

#### Ejemplo:

**`app/Filament/Resources/ProfileResource.php`**

```php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProfileResource\Pages;
use App\Forms\Components\Tabs\DocumentsTab;
use Filament\Forms;
use Filament\Forms\Components\Tabs;
use Filament\Resources\Resource;

class ProfileResource extends Resource
{
    public static function form(Form $form): Form
    {
        $userType = $form->getRecord()->user_type;

        return $form->schema([
            Tabs::make('Tabs')
                ->tabs([
                    DocumentsTab::get($userType),
                    // Otras tabs...
                ]),
        ]);
    }
}
```

## 3. Ventajas de Este Enfoque

1. **Legibilidad Mejorada:** Cada tab está encapsulada en un archivo separado, facilitando la lectura y modificación del código.
2. **Reutilización:** Puedes reutilizar tabs en diferentes recursos.
3. **Mantenimiento Fácil:** Es más sencillo localizar y actualizar campos específicos sin navegar por un archivo extenso.

## 4. Conclusión

Organizar tus recursos de Filament usando archivos separados es una práctica que mejora la mantenibilidad y la escalabilidad de tus proyectos. Implementar este enfoque asegura que puedas manejar formularios y recursos complejos sin perder claridad ni control.

¡Prueba esta técnica en tu próximo proyecto y experimenta la diferencia 🚀!
