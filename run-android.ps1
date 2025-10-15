# Script para ejecutar la app en Android con JAVA_HOME correcto
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "JAVA_HOME configurado a: $env:JAVA_HOME" -ForegroundColor Green
Write-Host "Verificando Java..." -ForegroundColor Yellow
& java -version

Write-Host "`nEjecutando npx expo run:android..." -ForegroundColor Yellow
& npx expo run:android
