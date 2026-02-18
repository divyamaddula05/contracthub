Try {
  $ErrorActionPreference = 'Stop'

  $samplePath = 'c:\Users\Divya Maddula\contracthub\backend\uploads\e2e-sample.pdf'
  'Sample PDF content for ContractHub E2E test' | Out-File -Encoding ascii -FilePath $samplePath
  Write-Host "Sample PDF created: $samplePath"

  Write-Host 'Logging in as admin...'
  $adminBody = @{ email='admin@test.com'; password='password123' } | ConvertTo-Json
  $adminResp = Invoke-RestMethod -Uri 'https://contracthub-api.onrender.com/api/auth/login' -Method Post -ContentType 'application/json' -Body $adminBody
  $adminToken = $adminResp.token
  if (-not $adminToken) { throw 'Admin login failed (no token)' }
  Write-Host 'Admin token obtained'

  $headers = @{ Authorization = "Bearer $adminToken" }

  Write-Host 'Creating contract...'
  $contractBody = @{ title='E2E Test Contract' } | ConvertTo-Json
  $contract = Invoke-RestMethod -Uri 'https://contracthub-api.onrender.com/api/contracts' -Method Post -ContentType 'application/json' -Body $contractBody -Headers $headers
  if (-not $contract._id) { throw 'Contract creation failed' }
  Write-Host "Contract created: $($contract._id)"

  Write-Host 'Uploading sample PDF using curl...'
  # Use curl.exe to perform multipart upload (PowerShell's -Form may not be available)
  $uploadRaw = & curl.exe -s -H ("Authorization: Bearer {0}" -f $adminToken) -F ("file=@{0}" -f $samplePath) ("https://contracthub-api.onrender.com/api/contracts/{0}/upload" -f $contract._id)
  try { $uploadResp = $uploadRaw | ConvertFrom-Json } catch { $uploadResp = $uploadRaw }
  Write-Host 'Upload response:'
  Write-Host $uploadRaw

  Write-Host 'Fetching versions...'
  $versions = Invoke-RestMethod -Uri ("https://contracthub-api.onrender.com/api/contracts/{0}/versions" -f $contract._id) -Method Get -Headers $headers
  Write-Host ($versions | ConvertTo-Json -Depth 5)
  $versionId = $versions[0]._id
  Write-Host "Version ID: $versionId"

  Write-Host 'Logging in as client...'
  $clientBody = @{ email='client@test.com'; password='password123' } | ConvertTo-Json
  $clientResp = Invoke-RestMethod -Uri 'https://contracthub-api.onrender.com/api/auth/login' -Method Post -ContentType 'application/json' -Body $clientBody
  $clientToken = $clientResp.token
  if (-not $clientToken) { throw 'Client login failed (no token)' }
  $clientHeaders = @{ Authorization = "Bearer $clientToken" }

  Write-Host 'Client approving version...'
  $approveResp = Invoke-RestMethod -Uri ("/api/contracts/{0}/versions/{1}/approve" -f $contract._id, $versionId) -Method Put -Headers $clientHeaders
  Write-Host "Approve response: $($approveResp | ConvertTo-Json -Depth 3)"

  Write-Host 'Fetching audit logs (admin)...'
  $logs = Invoke-RestMethod -Uri ("https://contracthub-api.onrender.com/api/contracts/{0}/logs" -f $contract._id) -Method Get -Headers $headers
  Write-Host ($logs | ConvertTo-Json -Depth 5)

  Write-Host 'E2E test completed successfully.'
} Catch {
  Write-Host 'E2E test failed:' $_.ToString()
  exit 1
} Finally {
  Write-Host 'Script finished.'
}
