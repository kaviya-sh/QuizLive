@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\apache-maven-%MAVEN_VERSION%
set MAVEN_EXEC=%MAVEN_HOME%\bin\mvn.cmd

if not exist "%MAVEN_EXEC%" (
    echo Downloading Maven %MAVEN_VERSION%...
    mkdir "%USERPROFILE%\.m2\wrapper" 2>nul
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile '%USERPROFILE%\.m2\wrapper\maven.zip'"
    powershell -Command "Expand-Archive -Path '%USERPROFILE%\.m2\wrapper\maven.zip' -DestinationPath '%USERPROFILE%\.m2\wrapper' -Force"
    del "%USERPROFILE%\.m2\wrapper\maven.zip"
    echo Maven installed successfully!
)

"%MAVEN_EXEC%" %*
