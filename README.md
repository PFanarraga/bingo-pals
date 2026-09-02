# Bingo Pals

# 🎱 BINGO 75 ONLINE

# PROMPT MAESTRO DE DESARROLLO CON IA

# MVP v1.0



Quiero que actúes como un equipo completo de desarrollo de software compuesto por:



- Arquitecto de software

- Desarrollador Frontend

- Desarrollador Backend

- Especialista en bases de datos

- Especialista en aplicaciones PWA

- Especialista en tiempo real

- Diseñador UI/UX Mobile First

- QA / Tester

- Especialista en seguridad

- Especialista en despliegue



Tu objetivo es construir completamente una aplicación web PWA llamada:



BINGO 75 ONLINE



La aplicación será un Bingo clásico de 75 bolas para jugar online entre amigos.



IMPORTANTE:



No quiero que agregues funcionalidades que no estén especificadas en este documento.



No quiero sobreingeniería.



No quiero crear funciones innecesarias.



Primero debemos conseguir un MVP completamente funcional, estable y fácil de usar.



==================================================

1. OBJETIVO

==================================================



Crear un Bingo online que permita:



1. Crear una sala.

2. Generar un código de sala.

3. Permitir que muchas personas entren a la misma sala.

4. El anfitrión también participa como jugador.

5. Cada jugador puede utilizar entre 1 y 3 cartones.

6. Los cartones pueden seleccionarse o generarse al azar.

7. El anfitrión inicia la partida.

8. El anfitrión saca las bolas.

9. Todos los jugadores reciben las bolas en tiempo real.

10. Los jugadores marcan manualmente sus números.

11. Se muestran las últimas 3 bolas.

12. Se pueden consultar las 75 bolas.

13. Los jugadores pueden cantar BINGO.

14. El servidor valida el Bingo.

15. El anfitrión puede verificar el Bingo.

16. Puede haber varios ganadores.

17. Si existen varios ganadores, el premio se divide.

18. La partida termina.

19. Se puede iniciar una nueva partida.



==================================================

2. REGLAS DEL BINGO

==================================================



Bingo clásico de 75 bolas.



B = 1-15

I = 16-30

N = 31-45

G = 46-60

O = 61-75



Cada cartón:



5 columnas

5 filas



Centro:



FREE



Ejemplo:



B    I    N    G    O



4   18   32   49   67

7   21   35   52   69

9   24  FREE  55   71

13  27   40   58   73

15  30   44   60   75



Los números de cada columna deben ser únicos.



==================================================

3. MARCADO MANUAL

==================================================



MUY IMPORTANTE:



El sistema NO debe marcar automáticamente los números.



Cuando una bola sale:



El jugador debe buscarla y tocarla manualmente.



Ejemplo:



Sale:



B 12



El jugador debe tocar manualmente el 12 de su cartón.



Si el jugador olvida marcar un número, el sistema NO debe marcarlo automáticamente.



El centro FREE comienza marcado.



==================================================

4. JUGADORES

==================================================



No habrá registro.



No habrá contraseña.



No habrá perfiles.



Para entrar:



Nombre

+

Código de sala



Cada jugador puede tener:



1 cartón

2 cartones

3 cartones



Máximo:



3 cartones.



==================================================

5. ANFITRIÓN

==================================================



El anfitrión crea la sala.



El anfitrión también juega.



Por lo tanto, el anfitrión debe tener:



- Nombre

- 1-3 cartones

- Marcado manual

- Botón BINGO



Pero además tendrá controles especiales:



- Crear sala

- Iniciar partida

- Sacar bola

- Pausar

- Continuar

- Ver jugadores

- Verificar Bingo

- Finalizar partida

- Nueva partida



Los jugadores normales NO podrán sacar bolas.



==================================================

6. SALA

==================================================



Cuando el anfitrión crea una sala:



El servidor debe generar un código único.



Ejemplo:



A7K92



La sala inicialmente estará:



WAITING



Mientras esté WAITING:



- Los jugadores pueden entrar.

- Los jugadores pueden seleccionar sus cartones.

- El anfitrión puede ver cuántos jugadores hay.

- El anfitrión puede iniciar la partida.



Cuando el anfitrión pulse:



INICIAR JUEGO



La sala pasa a:



PLAYING



==================================================

7. LÍMITE DE JUGADORES

==================================================



Preparar el sistema para un límite inicial grande:



500 jugadores por sala.



El límite debe poder modificarse posteriormente mediante configuración.



No diseñar la aplicación suponiendo que solamente existirán 10 o 20 jugadores.



==================================================

8. PANTALLA DE INICIO

==================================================



Crear una interfaz Mobile First.



Debe contener:



BINGO 75



Campo:



Tu nombre



Campo:



Código de sala



Selector:



1 cartón

2 cartones

3 cartones



Botones:



ELEGIR CARTÓN



CARTONES AL AZAR



También debe existir:



CREAR SALA



La interfaz debe ser sencilla.



No agregar login.



==================================================

9. CREAR SALA

==================================================



Al pulsar:



CREAR SALA



Crear una sala y convertir al usuario en anfitrión.



Mostrar:



Código de sala



Cantidad de jugadores



Lista de jugadores



Botón:



INICIAR JUEGO



El anfitrión debe poder compartir el código.



==================================================

10. SALA DE ESPERA

==================================================



Mostrar:



🎱 BINGO 75



Sala: A7K92



Jugadores: 25



Lista de jugadores.



El anfitrión verá:



INICIAR JUEGO



Los jugadores normales verán:



Esperando al anfitrión...



==================================================

11. SELECCIÓN DE CARTONES

==================================================



El usuario podrá elegir:



1

2

3



cartones.



Debe existir:



ELEGIR CARTÓN



y:



CARTONES AL AZAR



Si utiliza AL AZAR:



Los cartones deben generarse en el servidor.



No confiar en la generación del cliente.



==================================================

12. PANTALLA DE JUEGO

==================================================



Esta es la pantalla principal.



Debe ser Mobile First.



La pantalla debe contener:



ARRIBA:



Código de sala.



Estado de conexión.



Control de sonido.



Últimas 3 bolas.



Botón para consultar todas las bolas.



CENTRO:



Cartón actual.



ABAJO:



Indicador de cartón.



Botón BINGO.



==================================================

13. ÚLTIMAS 3 BOLAS

==================================================



Mostrar únicamente las últimas 3 bolas.



Ejemplo:



B 12

G 53

O 71



Cuando salga:



I 24



debe quedar:



G 53

O 71

I 24



La bola más antigua desaparece.



==================================================

14. TODAS LAS BOLAS

==================================================



Crear un botón:



75



Al pulsarlo debe abrirse un modal.



NO debe cambiar de página.



NO debe cerrar el cartón.



El modal debe mostrar las 75 bolas.



Organizarlas por:



B

I

N

G

O



Las bolas que ya salieron deben tener un estilo/color diferente.



Las que todavía no salieron deben conservar el estilo normal.



Debe poder cerrarse fácilmente.



==================================================

15. MULTIPLES CARTONES

==================================================



Si el jugador tiene:



1 cartón:



Mostrar 1.



Si tiene:



2 cartones:



Mostrar 2 mediante desplazamiento horizontal.



Si tiene:



3 cartones:



Mostrar 3 mediante desplazamiento horizontal.



No mostrar los tres cartones uno debajo de otro.



Debe poder deslizarse:



← →



Ejemplo:



CARTÓN 1 / 3



● ○ ○



==================================================

16. BOTÓN BINGO

==================================================



Mostrar:



¡BINGO!



en la parte inferior.



El botón debe estar inicialmente desactivado.



El cliente puede detectar condiciones que permitan habilitarlo.



PERO:



La validación definitiva siempre debe realizarse en el servidor.



Nunca confiar en el cliente.



==================================================

17. VALIDACIÓN DEL BINGO

==================================================



Cuando el jugador pulse BINGO:



Enviar al servidor:



- player_id

- room_id

- game_id

- card_id

- estado de marcado

- timestamp



El servidor debe comprobar:



- El jugador pertenece a la sala.

- El cartón pertenece al jugador.

- El cartón pertenece a esa partida.

- Los números necesarios realmente salieron.

- Se cumple la condición de Bingo.

- La partida sigue activa.



Resultado:



VALID



o



INVALID



==================================================

18. ANFITRIÓN Y VERIFICACIÓN

==================================================



Cuando un jugador cante Bingo:



El anfitrión debe recibir una notificación.



Ejemplo:



PEDRO HA CANTADO BINGO



Botón:



VERIFICAR BINGO



El anfitrión podrá abrir la solicitud.



El servidor realizará la validación.



==================================================

19. BINGO FALSO

==================================================



Si el Bingo es incorrecto:



Mostrar:



BINGO NO VÁLIDO



La partida continúa.



Debe poder reproducirse el audio correspondiente.



==================================================

20. BINGO VÁLIDO

==================================================



Si es válido:



Mostrar:



BINGO CONFIRMADO



La partida termina.



==================================================

21. VARIOS GANADORES

==================================================



MUY IMPORTANTE:



No utilizar una regla de:



"El primero que presiona BINGO gana".



Puede haber varios ganadores.



Ejemplo:



Pedro → Bingo válido

Juan → Bingo válido

María → Bingo válido



Resultado:



3 ganadores.



Todos reciben el premio correspondiente.



==================================================

22. PREMIO

==================================================



El sistema debe permitir registrar un premio para la partida.



Ejemplo:



Premio:



S/ 300



3 ganadores:



Pedro

Juan

María



Resultado:



Pedro: S/ 100

Juan: S/ 100

María: S/ 100



El MVP NO realizará pagos.



Solamente calculará y mostrará la división.



==================================================

23. CONCURRENCIA

==================================================



El sistema debe soportar que varios jugadores canten Bingo prácticamente al mismo tiempo.



El servidor debe registrar las reclamaciones.



No determinar el ganador únicamente por la velocidad del botón.



Todos los Bingos válidos de la jugada ganadora deben considerarse.



==================================================

24. SACAR BOLA

==================================================



Solamente el anfitrión puede sacar bolas.



Al pulsar:



SACAR BOLA



El servidor debe:



1. Seleccionar una bola que todavía no haya salido.

2. Registrar la bola.

3. Actualizar el estado de la partida.

4. Enviar la bola a todos los jugadores.

5. Actualizar las últimas 3 bolas.

6. Permitir la reproducción del audio.



El cliente NO decide qué bola sale.



==================================================

25. NO REPETIR BOLAS

==================================================



Una bola solamente puede salir una vez.



Ejemplo:



B 12



No puede volver a aparecer:



B 12



en la misma partida.



Máximo:



75 bolas.



==================================================

26. PAUSAR

==================================================



El anfitrión puede:



PAUSAR



Cuando está pausada:



- No se pueden sacar bolas.

- Los jugadores pueden revisar sus cartones.

- El estado debe sincronizarse.



Después:



CONTINUAR



==================================================

27. AUDIO

==================================================



Los audios ya están preparados.



Se utilizarán:



B.mp3

I.mp3

N.mp3

G.mp3

O.mp3



y:



01.mp3

02.mp3

03.mp3

...

75.mp3



Cuando salga:



B 12



Reproducir:



B.mp3



Pausa controlada por el programa.



Después:



12.mp3



No depender del silencio interno de los archivos.



==================================================

28. COMENTARIOS

==================================================



Existirán comentarios:



- Aleatorios

- Contextuales

- Inicio

- Bingo

- Bingo falso

- Ganador

- Final



NO reproducir comentarios después de cada bola.



Debe existir un sistema que controle su frecuencia.



No repetir comentarios consecutivamente.



==================================================

29. LISTA DE JUGADORES

==================================================



El anfitrión podrá abrir:



JUGADORES



Mostrar:



Nombre

Estado de conexión



Ejemplo:



Pedro

🟢 Conectado



Juan

🟢 Conectado



María

🔴 Desconectado



La lista debe actualizarse en tiempo real.



==================================================

30. CONEXIÓN

==================================================



Mostrar estado:



🟢 Conectado



Si existe pérdida:



🔴 Reconectando...



La partida debe mantenerse en el servidor.



Si el jugador se reconecta:



Debe recuperar:



- Sala

- Cartones

- Bolas salidas

- Estado de partida

- Estado necesario para continuar jugando



==================================================

31. ESTADOS DE SALA

==================================================



Utilizar:



WAITING

PLAYING

PAUSED

FINISHED



==================================================

32. NUEVA PARTIDA

==================================================



Después de finalizar:



NUEVA PARTIDA



Debe permitir reutilizar la misma sala.



La nueva partida debe:



- Reiniciar las bolas.

- Reiniciar el estado.

- Crear nuevos cartones o permitir seleccionar nuevamente.

- Mantener el código de sala.



==================================================

33. BASE DE DATOS

==================================================



Crear una estructura clara.



ROOMS:



id

code

host_player_id

status

created_at

started_at

finished_at



PLAYERS:



id

room_id

name

is_host

connected

created_at



CARDS:



id

player_id

game_id

card_number

numbers

created_at



GAMES:



id

room_id

status

drawn_balls

current_ball

prize

started_at

finished_at



BINGO_CLAIMS:



id

game_id

player_id

card_id

status

created_at



WINNERS:



id

game_id

player_id

card_id

prize_share



Puedes modificar esta estructura si existe una solución técnicamente mejor, pero debes explicar primero por qué.



==================================================

34. SEGURIDAD

==================================================



El servidor debe ser la autoridad.



Nunca confiar en:



- Estado enviado por el cliente.

- Cartones enviados por el cliente.

- Bolas seleccionadas por el cliente.

- Resultado de Bingo calculado solamente en JavaScript.



El cliente solamente solicita acciones.



El servidor decide.



==================================================

35. TECNOLOGÍA

==================================================



Usar preferentemente:



Frontend:



React

TypeScript

Vite



PWA:



Vite PWA Plugin



Backend / Base de datos:



Supabase



Base de datos:



PostgreSQL



Tiempo real:



Supabase Realtime



Hosting:



Cloudflare Pages



Desarrollo:



VS Code



Si propones cambiar alguna tecnología, explica claramente la razón antes de hacerlo.



==================================================

36. DISEÑO

==================================================



Diseño:



Mobile First.



Debe funcionar perfectamente en:



360px

375px

390px

414px



La interfaz debe ser:



- Moderna

- Simple

- Clara

- Rápida

- Táctil

- Fácil de entender



No llenar la pantalla con botones.



El cartón debe ser el elemento principal.



El usuario debe poder jugar cómodamente con una sola mano.



==================================================

37. PÁGINAS

==================================================



Crear únicamente:



1. INICIO

2. SALA DE ESPERA

3. JUEGO

4. RESULTADO



No crear páginas innecesarias.



Los elementos secundarios deben utilizar modales, paneles o overlays.



==================================================

38. RESPONSABILIDAD DEL ANFITRIÓN

==================================================



El anfitrión debe poder:



CREAR SALA

INICIAR JUEGO

SACAR BOLA

PAUSAR

CONTINUAR

VER JUGADORES

VERIFICAR BINGO

FINALIZAR

NUEVA PARTIDA



Y simultáneamente:



JUGAR

MARCAR

CANTAR BINGO



==================================================

39. RESPONSABILIDAD DEL JUGADOR

==================================================



El jugador puede:



ENTRAR

ELEGIR CARTONES

USAR CARTONES AL AZAR

JUGAR

MARCAR MANUALMENTE

VER BOLAS

CANTAR BINGO



No puede sacar bolas.



==================================================

40. FUNCIONES EXCLUIDAS DEL MVP

==================================================



NO implementar:



Login

Contraseñas

Perfiles

Chat

Amigos

Ranking

Tienda

Publicidad

Suscripciones

Pagos

Estadísticas avanzadas

Torneos

Historial de usuarios

Marcado automático

Funciones sociales innecesarias



==================================================

41. METODOLOGÍA DE DESARROLLO

==================================================



NO intentes escribir todo el proyecto de una sola vez.



Trabaja por fases.



FASE 1:

Crear estructura del proyecto.



FASE 2:

Diseñar interfaz Mobile First.



FASE 3:

Crear base de datos.



FASE 4:

Crear salas.



FASE 5:

Crear jugadores.



FASE 6:

Crear cartones.



FASE 7:

Crear sistema de Bingo.



FASE 8:

Crear sistema de bolas.



FASE 9:

Crear sincronización en tiempo real.



FASE 10:

Crear audio.



FASE 11:

Crear validación de Bingo.



FASE 12:

Crear múltiples ganadores y división del premio.



FASE 13:

Crear reconexión.



FASE 14:

Pruebas.



FASE 15:

Optimización.



FASE 16:

Preparar despliegue.



==================================================

42. REGLA PARA LA IA

==================================================



Antes de modificar código:



1. Analiza la estructura existente.

2. Comprende cómo funciona.

3. No sobrescribas código funcional innecesariamente.

4. No elimines funcionalidades existentes sin autorización.

5. Mantén el proyecto organizado.

6. Mantén componentes pequeños y reutilizables.

7. Evita duplicación.

8. Utiliza nombres claros.

9. Añade comentarios solamente cuando realmente sean necesarios.

10. Mantén la aplicación preparada para crecer.



==================================================

43. REGLA DE TRABAJO

==================================================



Después de completar cada fase:



1. Ejecuta las pruebas correspondientes.

2. Comprueba errores de compilación.

3. Comprueba errores de TypeScript.

4. Comprueba errores de consola.

5. Comprueba que las funcionalidades anteriores sigan funcionando.

6. Explica qué se hizo.

7. Indica qué archivos se modificaron.

8. Indica cómo probarlo.



NO avances automáticamente a una fase nueva si la fase anterior tiene errores críticos.



==================================================

44. NO INVENTAR

==================================================



Si existe una decisión técnica que no está definida:



NO inventes una solución compleja.



Elige la solución más sencilla que cumpla el objetivo.



Si la decisión cambia significativamente la arquitectura:



DETENTE Y EXPLICA LA DECISIÓN ANTES DE IMPLEMENTARLA.



==================================================

45. PRIORIDAD

==================================================



La prioridad absoluta es:



1. FUNCIONALIDAD

2. ESTABILIDAD

3. SINCRONIZACIÓN

4. SEGURIDAD

5. EXPERIENCIA MÓVIL

6. DISEÑO

7. OPTIMIZACIÓN



No sacrificar estabilidad por agregar funciones.



==================================================

46. RESULTADO FINAL ESPERADO

==================================================



Quiero po

der:



1. Abrir el PWA desde un teléfono.

2. Crear una sala.

3. Compartir el código.

4. Hacer que varias personas entren.

5. Elegir cartones.

6. Iniciar la partida.

7. Sacar bolas.

8. Escuchar los audios.

9. Ver las últimas 3 bolas.

10. Consultar las 75 bolas.

11. Marcar manualmente.

12. Jugar con hasta 3 cartones.

13. Cantar Bingo.

14. Validar Bingo.

15. Tener varios ganadores.

16. Dividir el premio.

17. Finalizar la partida.

18. Crear una nueva partida.



Todo debe funcionar en tiempo real.



==================================================

47. INSTRUCCIÓN INICIAL

==================================================



NO empieces todavía a crear todas las funcionalidades.



Primero:



1. Analiza este blueprint.

2. Propón la arquitectura técnica concreta.

3. Propón la estructura de carpetas.

4. Propón el esquema de base de datos.

5. Propón las dependencias necesarias.

6. Propón las variables de entorno necesarias.

7. Indica qué herramientas necesito instalar.

8. Indica los riesgos técnicos principales.

9. Divide el desarrollo en tareas pequeñas.

10. Espera mi confirmación antes de comenzar la implementación.



No agregues funcionalidades

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d46a9bc0-6d4e-4ff2-b3eb-6b2a21135002).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
