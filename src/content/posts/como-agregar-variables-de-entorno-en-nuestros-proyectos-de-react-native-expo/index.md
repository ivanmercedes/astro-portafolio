---

postTitle: 'Como agregar Variables de Entorno en nuestros proyectos de React Native (Expo)'
datePublished: '02/06/2022'
image:
    url: 'https://www.datocms-assets.com/41779/1660827647-expo-react.png'
tags: ["expo", "react native"]
--- 

Hola a todos, hoy quiero compartir y mostrarle como se implementan variables de entorno en react native cuando trabajamos con [Expo](https://expo.dev/), si bien sabemos que es un entorno muy útil que nos ayuda a crear y distribuir nuestras aplicaciones de React Native. Y que ademas a menudo puede eliminar la fricción de usar Xcode y Android studio, ya que nos permite probar nuestras aplicaciones directamente en nuestro teléfono iOS y Android. Pero no todo es color de rosa, algunas de sus desventajas es que ocultan muchas configuraciones y no hay tanta ayuda con el tema de manejo de errores como podemos encontrar en React Native.

## ¿Qué es una variable de entorno?

Una variable de entorno es una variable que le establecemo su valor desde fuera del nuestra aplicacion. Esta variable se componen de un par clave/valor al que se puede acceder simplemente importando la variable desde el archivo de origen de tu aplicación de React Native.

## ¿Por qué usar variables de entorno?

Las variables de entorno pueden ser increíblemente útiles cuando desea almacenar claves de API entre otras cosas, o probar en un servidor de desarrollo local. Por ejemplo, imagina que usas localhost:3000 para conectarste a tu backend local, es mucho más fácil importar una variable de entorno que tenga la url con el puerto que escribir continuamente localhost:3000. Además, cuando finalmente desee desplegar tu aplicación a produccion, solo tiene que cambiar la URL en un solo lugar en lugar de buscar tu URL de host local en toda tu aplicación. Como ocurre con el entorno actual, a la hora de codificar siempre debemos buscar formas de agilizar el proceso de desarrollo. 🙂

## ¿Archivos .env en Expo?

si bien Expo no emplea archivos .env de manera predeterminada. Para que estos archivos .env funcionen tendremos que instalar un plugin de terceros. Si desconfía de instalar cualquier paquete nuevo, puedes utilizar los [Release Channels](https://docs.expo.dev/distribution/release-channels/) integrados de expo.

## Requisitos previos
1. Asegúrese de tener instalada la última versión de Node 16.14.2 LTS o superior.
2. Asegúrate de haber inicializado correctamente la aplicación con la línea de comandos de la CLI de Expo

## Vamos a empezar 🚀
Ahora que tenemos nuestra aplicación configurada, hacemos cd en ella para comenzar

`cd mi-app-react-native`

## Crear nuestro archivo .env
En el directorio raíz/nivel superior de la aplicación, crea un archivo **.env**. Este nuevo archivo debe estar al mismo nivel que el archivo **babel.config.js**. Ahora vamos a crear un par clave/valor. Para nuestros propósitos aquí hagamos una clave de prueba:

`HOLA_MUNDO="Hola, Mundo :U"`

> El nombre de la clave no tiene que estar en mayúsculas, pero es una práctica recomendada.

Recuerde agregar este archivo **.env** en su archivo **.gitignore**. Si no lo haces, corres el riesgo de exponer información confidencial en Github.

## Instalar react-native-dotenv
Este es un complemento de terceros que mencione anteriormente. Este plugin "nos permite inyectar nuestras variables de entorno en proyectos de React Native utilizando dotenv para múltiples entornos".

Para instalarlo con npm usaremos el siguiente comando

`npm i react-native-dotenv`

Después de la instalación, deberemos realizar algunos cambios en el archivo **babel.config.js**. de esta manera:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          sage: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
```

> Observa que el valor moduleName es **"@env"**, por lo que debemos usar ese nombre para importar nuestras variables.

## Vamos a probarlo 👨‍💻

Para obtener nuestra variable de entorno, tendremos que importarlo en cualquier archivo en el que queramos usarlas.

Ejemplo: 

Usando `import { HOLA_MUNDO } from '@env';` extraemos  la variable declarada en el archivo **.env** haciendo desestructuración.

En nuestro componente quedaría de la siguiente forma:

```javascript
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { HOLA_MUNDO } from "@env";

export default function App() {
  retrun(
    <View style={styles.container}>
      <Text>{HOLA_MUNDO}</Text>
      <StatusBar style="auto" />
    </View>,
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
```


y ya con esto podríamos ver nuestra variable de entorno en nuestra app 

<img src="https://www.datocms-assets.com/41779/1648141726-app.jpeg" style="max-width:400px; width:100%; margin-bottom:1rem;" />


Como acabamos de ver, las variables de entorno son una excelente manera de mantener nuestro código mantenible y administrar diferentes claves para diferentes entornos (es decir, producción o desarrollo). Ahora te toca, probar a ti probar, me despido y hasta un próximo post 👋
