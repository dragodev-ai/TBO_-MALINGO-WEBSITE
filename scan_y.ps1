Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("D:\website\CLIENTS\page_18.png")

function ScanCol($colName, $x) {
    global:b
    Write-Host "`nScanning $colName at X=$x"
    $inObject = $false
    $start = 0
    for ($y = 400; $y -lt 850; $y++) {
        $p = $b.GetPixel($x, $y)
        $isDark = ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240)
        if ($isDark -and -not $inObject) {
            $inObject = $true
            $start = $y
        } elseif (-not $isDark -and $inObject) {
            $inObject = $false
            Write-Host "  Object from Y=$start to Y=$($y-1) (Height = $($y - $start))"
        }
    }
}

ScanCol "Column 1 (Paytm, Teledu, Uomo)" 900
ScanCol "Column 2 (Mufin, BCA, Rajesh)" 1100
ScanCol "Column 3 (Krishaj, Neofit)" 1260
ScanCol "Column 4 (Amway, BSDU, Spectra)" 1450

$b.Dispose()
