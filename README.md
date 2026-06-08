# SAII-TP3-Laprida Registro de Alumnos

Este es un servidor backend ligero construido con Node.js y Express. Sirve una interfaz web para el registro de alumnos y guarda los datos en la memoria del servidor. Utiliza cookies para identificar a cada usuario de forma única, asegurando que cada persona vea solo sus propios datos, incluso al recargar la página.

# actividad1

Hacer doble click en el archivo html o hacer click derecho en visual studio, y abrir con live server.

# Servidor Local - actividad2

## Requisitos previos

Tener instalado node.js en tu computadora.

## Como iniciar el proyecto

1. Abrir la terminal:
   Ubicá tu terminal o consola de comandos dentro de la carpeta del proyecto.

2. *Instalar las dependencias:
   Ejecutá los siguientes comandos para crear el archivo de configuración y descargar los módulos necesarios (`express` y `uuid`):

   npm init -y
   npm install express uuid

3. Ejecutá el servidor:
   node server.js

## Acceder a la pagina 

Abrí el navegador web e ingresá a: http://localhost:3000

Si se quiere acceder desde otra computadora, mientras el servidor esta corriendo y en la misma red:


Averiguá la IP local de tu computadora ejecutando ipconfig en la terminal de Windows y buscando la Dirección IPv4.

En el navegador del otro dispositivo, ingresá: http://<TU_IP_LOCAL>:3000 (ejemplo: http://192.168.1.15:3000).
