param([string]$Serial = "R5GL40NM19K")

$ErrorActionPreference = "Stop"
$health = "http://127.0.0.1:5174/api/compiler/health"
$ready = $false
try {
    $ready = (Invoke-RestMethod -Uri $health -TimeoutSec 2).ok -eq $true
} catch {}

if (-not $ready) {
    $pythonw = "C:\Users\issda\AppData\Local\Programs\Python\Python312\pythonw.exe"
    $launcher = "C:\dev\pc-health\run_headless.py"
    $config = Join-Path $PSScriptRoot "tablet-server.json"
    Start-Process -FilePath $pythonw -ArgumentList @($launcher, "--config", $config) -WindowStyle Hidden | Out-Null
    foreach ($attempt in 1..20) {
        Start-Sleep -Milliseconds 500
        try {
            if ((Invoke-RestMethod -Uri $health -TimeoutSec 2).ok) { $ready = $true; break }
        } catch {}
    }
}

if (-not $ready) { throw "Clay Compiler server did not become healthy. See evidence\tablet-20261016\server.log." }
if ((adb -s $Serial get-state 2>$null) -ne "device") { throw "Tablet $Serial is not connected and authorized." }
adb -s $Serial reverse tcp:5174 tcp:5174 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "ADB could not create the tablet loopback connection." }

$profiles = (Invoke-RestMethod -Uri $health -TimeoutSec 3).profiles
[pscustomobject]@{
    tablet = $Serial
    loopback = "tablet 127.0.0.1:5174 -> PC 127.0.0.1:5174"
    execution = $profiles.execution
    python = $profiles.python
    javascript = $profiles.javascript
    cpp = $profiles.cpp
    java = $profiles.java
    six_tongue = $profiles.'six-tongue'
}
