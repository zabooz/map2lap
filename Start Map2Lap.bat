@echo off
rem Map2Lap: starts the local generator page (http://localhost:8800) and opens it in the browser.
rem Uses the bundled Python of the release zip, else the development venv, else an installed Python.
rem An update the page downloaded (update\Map2Lap, then update\ready: src\app\updater.py) goes in here, while no Python
rem holds the files: the server ends with exit code 75 for it, and this starts it again (without a new browser tab).
rem Each folder of the new release replaces the old one; settings.json, cache and out aren't in it and stay. This file
rem comes last, in one line with the jump back: cmd reads a running batch file as it goes, the line is already read.
cd /d "%~dp0"
set ARGS=
:run
if exist "update\ready" (
  echo Installing the update ...
  rem Short retries cover transient scanner locks; a persistent lock must stop the update visibly.
  for /d %%D in ("update\Map2Lap\*") do (
    robocopy "%%D" "%%~nxD" /MIR /R:5 /W:2 /NJH /NJS /NFL /NDL /NP
    if errorlevel 8 goto update_failed
  )
  for %%F in ("update\Map2Lap\*") do if /i not "%%~nxF"=="Start Map2Lap.bat" (
    copy /y "%%F" . >nul
    if errorlevel 1 goto update_failed
  )
  copy /y "update\Map2Lap\Start Map2Lap.bat" "%~nx0" >nul & if errorlevel 1 (goto update_failed) else (del "update\ready" & rmdir /s /q "update" & goto run)
)
if exist "python\python.exe" (
  "python\python.exe" src\server.py %ARGS%
) else if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" src\server.py %ARGS%
) else (
  python src\server.py %ARGS%
)
if "%errorlevel%"=="75" (set "ARGS=--no-browser" & goto run)
pause
exit /b
:update_failed
echo Update failed. Close other Map2Lap windows and programs using its files, then start Map2Lap again to retry.
echo The downloaded update has been kept. Map2Lap will not start until the update succeeds.
pause
exit /b 1
