$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot 'dist'
if (-not (Test-Path $root)) {
  Write-Host 'No existe la carpeta dist.'
  Write-Host 'Ejecuta primero: npm run build'
  Read-Host 'Pulsa Enter para cerrar'
  exit 1
}

$port = 4173
$prefix = "http://127.0.0.1:$port/"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$rootFullPath = [System.IO.Path]::GetFullPath($root).TrimEnd('\')

function Get-ContentType {
  param([string]$FilePath)

  switch ([System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.js' { 'application/javascript; charset=utf-8' }
    '.css' { 'text/css; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.svg' { 'image/svg+xml' }
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.webp' { 'image/webp' }
    '.avif' { 'image/avif' }
    '.mp4' { 'video/mp4' }
    '.ttf' { 'font/ttf' }
    default { 'application/octet-stream' }
  }
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$ContentType,
    [byte[]]$Body
  )

  $statusText = switch ($StatusCode) {
    200 { 'OK' }
    404 { 'Not Found' }
    500 { 'Internal Server Error' }
    default { 'OK' }
  }

  $header = @(
    "HTTP/1.1 $StatusCode $statusText"
    "Content-Type: $ContentType"
    "Content-Length: $($Body.Length)"
    'Connection: close'
    ''
    ''
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
  $Stream.Flush()
}

function Resolve-RequestFile {
  param([string]$RequestPath)

  $normalized = [System.Uri]::UnescapeDataString($RequestPath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($normalized)) {
    $normalized = 'index.html'
  } elseif ($normalized.EndsWith('/')) {
    $normalized = $normalized.TrimEnd('/') + '/index.html'
  }

  $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $normalized))
  $insideRoot = $candidate.StartsWith($rootFullPath + '\', [System.StringComparison]::OrdinalIgnoreCase) -or $candidate -eq $rootFullPath
  if (-not $insideRoot) {
    return $null
  }

  if (Test-Path $candidate -PathType Leaf) {
    return $candidate
  }

  if ([string]::IsNullOrWhiteSpace([System.IO.Path]::GetExtension($normalized))) {
    return (Join-Path $root 'index.html')
  }

  return $null
}

try {
  $listener.Start()
  Start-Process $prefix
  Write-Host "Sirviendo $root en $prefix"
  Write-Host 'Pulsa Ctrl+C para detener el servidor.'

  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      try {
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8, $true, 1024, $true)
        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
          continue
        }

        while ($true) {
          $headerLine = $reader.ReadLine()
          if ([string]::IsNullOrEmpty($headerLine)) {
            break
          }
        }

        $parts = $requestLine.Split(' ')
        $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
        $filePath = Resolve-RequestFile -RequestPath $requestPath

        if ($null -ne $filePath) {
          $body = [System.IO.File]::ReadAllBytes($filePath)
          Send-Response -Stream $stream -StatusCode 200 -ContentType (Get-ContentType -FilePath $filePath) -Body $body
        } else {
          $body = [System.Text.Encoding]::UTF8.GetBytes('404')
          Send-Response -Stream $stream -StatusCode 404 -ContentType 'text/plain; charset=utf-8' -Body $body
        }
      } catch {
        $message = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
        if ($stream -and $stream.CanWrite) {
          Send-Response -Stream $stream -StatusCode 500 -ContentType 'text/plain; charset=utf-8' -Body $message
        }
        Write-Host $_.Exception.Message
      }
    }
    finally {
      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
