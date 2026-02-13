$ErrorActionPreference = 'Stop'

$admin = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{ email='admin@test.com'; password='password123' })
$token = $admin.token
Write-Host "Admin token length: $($token.Length)"

$contracts = Invoke-RestMethod -Uri 'http://localhost:5000/api/contracts' -Method Get -Headers @{ Authorization = "Bearer $token" }
Write-Host "Contracts count: $($contracts.Count)"
if ($contracts.Count -eq 0) { Write-Host 'No contracts to delete'; exit 0 }

$id = $contracts[0]._id
Write-Host "Deleting contract: $id"
$del = Invoke-RestMethod -Uri ("http://localhost:5000/api/contracts/{0}" -f $id) -Method Delete -Headers @{ Authorization = "Bearer $token" }
Write-Host 'Delete response:' ($del | ConvertTo-Json)
