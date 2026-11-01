@echo off
title Smart Agricultural Irrigation and Water Allocation System

if not exist out mkdir out

echo Compiling Java files...
javac -d out src\*.java

if errorlevel 1 (
    echo.
    echo Compilation failed. Make sure JDK 17 is installed.
    pause
    exit /b 1
)

echo.
echo Starting Smart Agricultural Irrigation System...
echo.
java -cp out Main

echo.
pause

