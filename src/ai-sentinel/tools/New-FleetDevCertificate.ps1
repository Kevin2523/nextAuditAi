param(
    [string]$CertPath = ".\certs\fleet.crt",
    [string]$KeyPath = ".\certs\fleet.key"
)

$ErrorActionPreference = "Stop"

function New-DerLength {
    param([int]$Length)

    if ($Length -lt 128) {
        return ,([byte[]]@($Length))
    }

    $bytes = New-Object System.Collections.Generic.List[byte]
    $value = $Length
    while ($value -gt 0) {
        $bytes.Insert(0, [byte]($value -band 0xff))
        $value = $value -shr 8
    }

    return ,([byte[]](@(0x80 -bor $bytes.Count) + $bytes.ToArray()))
}

function New-DerInteger {
    param([byte[]]$Value)

    $offset = 0
    while (($offset -lt ($Value.Length - 1)) -and ($Value[$offset] -eq 0)) {
        $offset++
    }

    $trimmed = $Value[$offset..($Value.Length - 1)]
    if (($trimmed[0] -band 0x80) -ne 0) {
        $trimmed = [byte[]](@(0) + $trimmed)
    }

    return ,([byte[]](@(0x02) + [byte[]](New-DerLength $trimmed.Length) + $trimmed))
}

function New-DerSequence {
    param([byte[]]$Content)

    return ,([byte[]](@(0x30) + [byte[]](New-DerLength $Content.Length) + $Content))
}

function ConvertTo-RsaPrivateKeyPem {
    param([System.Security.Cryptography.RSAParameters]$Parameters)

    $parts = New-Object System.Collections.Generic.List[byte]
    $parts.AddRange([byte[]](New-DerInteger ([byte[]]@(0))))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.Modulus))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.Exponent))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.D))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.P))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.Q))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.DP))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.DQ))
    $parts.AddRange([byte[]](New-DerInteger $Parameters.InverseQ))

    $der = New-DerSequence $parts.ToArray()
    $base64 = [Convert]::ToBase64String($der, "InsertLineBreaks")
    return "-----BEGIN RSA PRIVATE KEY-----`n$base64`n-----END RSA PRIVATE KEY-----`n"
}

$rsa = [System.Security.Cryptography.RSA]::Create(2048)
$request = [System.Security.Cryptography.X509Certificates.CertificateRequest]::new(
    "CN=fleet.local",
    $rsa,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
)

$san = [System.Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new()
$san.AddDnsName("fleet.local")
$san.AddDnsName("localhost")
$san.AddIpAddress([System.Net.IPAddress]::Parse("127.0.0.1"))

$request.CertificateExtensions.Add($san.Build())
$request.CertificateExtensions.Add(
    [System.Security.Cryptography.X509Certificates.X509BasicConstraintsExtension]::new($false, $false, 0, $true)
)
$request.CertificateExtensions.Add(
    [System.Security.Cryptography.X509Certificates.X509KeyUsageExtension]::new(
        [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature -bor
            [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyEncipherment,
        $true
    )
)

$certificate = $request.CreateSelfSigned(
    [datetimeoffset]::Now.AddDays(-1),
    [datetimeoffset]::Now.AddYears(1)
)

$certBase64 = [Convert]::ToBase64String(
    $certificate.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert),
    "InsertLineBreaks"
)
$certPem = "-----BEGIN CERTIFICATE-----`n$certBase64`n-----END CERTIFICATE-----`n"
$keyPem = ConvertTo-RsaPrivateKeyPem $rsa.ExportParameters($true)

Set-Content -Path $CertPath -Value $certPem -NoNewline -Encoding ascii
Set-Content -Path $KeyPath -Value $keyPem -NoNewline -Encoding ascii

Write-Host "Generated Fleet dev certificate:"
Write-Host "  Cert: $CertPath"
Write-Host "  Key:  $KeyPath"
