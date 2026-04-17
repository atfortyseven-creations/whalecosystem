@echo off
echo ===================================================
echo     WHALE ALERT NETWORK - BACKUP SYSTEM
echo ===================================================
echo.
echo Iniciando proceso de respaldo de grado institucional...
echo Empaquetando la version V6 (AppKit EVM Security Fix)
echo.

set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_NAME=WhaleEcosystem_Backup_V6_Secured_%TIMESTAMP%.zip

echo Ejecutando compresion de toda la infraestructura. Puede tardar un momento...

tar.exe -a -c -f %BACKUP_NAME% --exclude="node_modules" --exclude=".next" --exclude=".git" *

echo.
echo ===================================================
echo  COPIA DE SEGURIDAD COMPLETADA CON EXITO
echo ===================================================
echo.
echo Archivo seguro generado: %BACKUP_NAME%
echo El ecosistema Sovereign y las correcciones de AppKit estan a salvo.
echo.
pause
