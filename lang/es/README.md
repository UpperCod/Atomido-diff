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





