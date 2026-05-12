---
title: "Acabo de descubrir una librería de Python que debí usar hace años ( Tenacity )"
name: "Acabo de descubrir una librería de Python que debí usar hace años ( Tenacity )"
datePublished: "05/11/2026"
postDescription: "Descubrí Tenacity, una librería de Python que permite manejar retries de forma elegante y hacer aplicaciones mucho más resistentes a fallos temporales."
tags: ["python", "backend", "api", "software engineering", "devtools"]
---

Hoy mientras jugaba un poco con langchain descubrí una librería de Python que honestamente me sorprendió bastante: <a href="https://tenacity.readthedocs.io/en/latest/" target="_blank">Tenacity</a>. Es una librería que permite manejar retries de forma elegante, y me pareció tan útil que quería compartirla con ustedes.

Y sí… probablemente muchos ya la conocen, pero yo duré demasiado tiempo haciendo retries manuales cada vez que una API fallaba.

Literalmente hacía cosas así:

```python
for i in range(3):
    try:
        response = api_call()
        break
    except Exception:
        time.sleep(2)
```
XD un poco de drama asi, pero con Tenacity, esto se vuelve algo así:

```python
from tenacity import retry, stop_after_attempt, wait_fixed

@retry(
    stop=stop_after_attempt(3),
    wait=wait_fixed(2)
)
def get_data():
    return api_call()
```

O sea:

* primer retry → espera 4 segundos
* segundo → 8 segundos
* tercero → máximo 10 segundos

ciertamente es una chuleria, pero lo que más me gusta es que es súper configurable. Puedes definir diferentes estrategias de retry, como <a href="https://docs.cloud.google.com/memorystore/docs/redis/exponential-backoff" target="_blank">exponencial backoff</a>, o incluso hacer retries solo para ciertos tipos de excepciones.

<!-- note about exponential backoff -->

> Exponencial backoff es una estrategia de retry donde el tiempo de espera entre intentos aumenta exponencialmente. Por ejemplo, podrías esperar 1 segundo después del primer fallo, luego 2 segundos después del segundo fallo, luego 4 segundos después del tercero, y así sucesivamente. Esto ayuda a reducir la carga en el sistema y aumenta las probabilidades de éxito en intentos posteriores, especialmente en situaciones donde el fallo es causado por una sobrecarga temporal del sistema.

Aqui dejo un enlace con más información sobre Exponencial backoff: <a href="https://docs.cloud.google.com/memorystore/docs/redis/exponential-backoff" target="_blank">exponencial backoff</a>

Esta librería es perfecta para esos momentos donde el problema realmente no era el código.

A veces solo pasó esto:

* rate limiting temporal
* un timeout momentáneo
* un microcorte de red
* una sobrecarga pasajera del servidor

Y en lugar de fallar, un retry inteligente hace que todo siga funcionando como si nada hubiera pasado.

El usuario ni se entera de que se degrano to (se dañó parcialmente, se puso inestable o empezó a fallar por momentos) :v


## Casos donde esto es extremadamente útil

Ahora hablemo los caso en donde se puede usar esta grasa para hacer que tu aplicación sea mucho más robusta.

Algunos ejemplos:

* APIs externas
* scraping
* workers
* colas
* microservicios
* automatizaciones
* integraciones de pago
* aplicaciones con IA
* consquitar el mundo okno

## Algo interesante que aprendí

Muchos sistemas no fallan porque estén “mal programados”.

Fallan porque no manejan correctamente errores temporales como:

* timeouts
* rate limiting
* microcortes
* sobrecargas momentáneas

Y honestamente, Tenacity hace que agregar resiliencia al código sea absurdamente simple.

## Conclusión

Son de esas pequeñas librerías que te hacen sentir:

> “ok… ahora mi software se comporta más profesional”.

Definitivamente una herramienta que después de conocerla empiezas a querer usar en casi todos tus proyectos backend.