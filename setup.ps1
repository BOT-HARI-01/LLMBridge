$HostName = "com.unc.agent"
$ExecutableName = "host.bat"
$ExtSysFolderName = "extSys"


$ExtensionId = Read-Host -Prompt "Enter your Chrome Extension ID (found in chrome://extensions)"

if (-not $ExtensionId) {
    Write-Host "[Error] Extension ID is required!" -ForegroundColor Red
    exit
}


$ExtSysPath = Join-Path $PSScriptRoot $ExtSysFolderName
$BatchFilePath = Join-Path $ExtSysPath $ExecutableName


if (-not (Test-Path $ExtSysPath)) {
    Write-Host "[Error] Could not find folder: $ExtSysFolderName at $ExtSysPath" -ForegroundColor Red
    exit
}

$Manifest = @{
    name = $HostName
    description = "LLM Bridge Native Host"
    path = $BatchFilePath
    type = "stdio"
    allowed_origins = @("chrome-extension://$ExtensionId/")
} | ConvertTo-Json


$ManifestPath = Join-Path $ExtSysPath "$HostName.json"
$Manifest | Out-File -FilePath $ManifestPath -Encoding utf8
Write-Host "[Done]Created manifest at: $ManifestPath" -ForegroundColor Green


$RegistryPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$HostName"

if (-not (Test-Path $RegistryPath)) {
    New-Item -Path $RegistryPath -Force | Out-Null
}

Set-ItemProperty -Path $RegistryPath -Name "(Default)" -Value $ManifestPath
Write-Host "[Done] Registered host in Windows Registry." -ForegroundColor Green
Write-Host "`n[Done] Setup Complete! You can now use the 'Connect' button in the extension." -ForegroundColor Cyan
Pause