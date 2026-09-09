@echo off
setlocal
cd /d "%~dp0"
title Pekahellix OS - Test mobile
cls
echo =============================================
echo       PEKAHELLIX OS - TEST MOBILE V0.3-B.3
echo =============================================
echo.
echo Demarrage du serveur local...
echo.
powershell.exe -NoLogo -NoProfile -Command "$code = Get-Content -LiteralPath '%~dp0SERVEUR_TEST_MOBILE.txt' -Raw; & ([ScriptBlock]::Create($code))"
set ERR=%ERRORLEVEL%
echo.
echo =============================================
if not "%ERR%"=="0" (
  echo Le serveur s'est arrete avec le code %ERR%.
  echo Copiez le message affiche ci-dessus dans ChatGPT.
) else (
  echo Le serveur a ete arrete.
)
echo =============================================
echo.
pause
endlocal
