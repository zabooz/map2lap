@echo off
rem Map2Lap: starts the local generator page (http://localhost:8800) and opens it in the browser.
rem Uses the bundled Python of the release zip, else the development venv, else an installed Python.
cd /d "%~dp0"
if exist "python\python.exe" (
  "python\python.exe" server.py
) else if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" server.py
) else (
  python server.py
)
pause
