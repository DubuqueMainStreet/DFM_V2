@echo off
REM Copy import files to Downloads folder for easy access
echo Copying import files to Downloads folder...

set "SOURCE=scripts\output"
set "DEST=%USERPROFILE%\Downloads\DFM_Import_Files"

if not exist "%DEST%" mkdir "%DEST%"

copy "%SOURCE%\vendors.csv" "%DEST%\" >nul
copy "%SOURCE%\market_attendance.csv" "%DEST%\" >nul
copy "%SOURCE%\stall_layouts.json" "%DEST%\" >nul
copy "%SOURCE%\pois.json" "%DEST%\" >nul

echo.
echo Files copied successfully!
echo Location: %DEST%
echo.
echo Files ready for upload:
echo   - vendors.csv
echo   - market_attendance.csv
echo   - stall_layouts.json
echo   - pois.json
echo.
pause
