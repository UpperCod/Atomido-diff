# atomico-diff

es un pequeño algoritmo de diff creado para utilizar dentro de web-components

## pragma h

```js
import {h,diff} from "atomico-diff";

let div = document.createELement("div");

diff(
   false,
   div,
   <host class="my-class">
)
```

## Uso de ramas de estado

El proceso de diff de Atomico, para evitar conflicto entre componentes, posee una definición de estado a base de ramas, definida por el padre del mismo componente. con esto se busca mantener independientes entre el estado del mismo componente y el estado del componente generado por el padre.

La ventaja de esto es que evita el conflicto de las propiedades re-escritas y eliminación de eventos.

