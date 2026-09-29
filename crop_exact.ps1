Add-Type -AssemblyName System.Drawing

$clientsDir = "D:\website\CLIENTS"
$logosDir = Join-Path $clientsDir "logos"
$b = [System.Drawing.Bitmap]::FromFile("$clientsDir\page_18.png")

function CropExact($name, $x1, $y1, $x2, $y2, $padding = 8) {
    $minY = 9999; $maxY = -1; $minX = 9999; $maxX = -1
    for ($x = $x1; $x -lt $x2; $x++) {
        for ($y = $y1; $y -lt $y2; $y++) {
            $p = $b.GetPixel($x, $y)
            if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
            }
        }
    }
    if ($minX -eq 9999) { Write-Host "Not found: $name"; return }

    $cropX = [Math]::Max($x1, $minX - $padding)
    $cropY = [Math]::Max($y1, $minY - $padding)
    $cropW = [Math]::Min($x2 - $cropX, ($maxX - $cropX) + $padding)
    $cropH = [Math]::Min($y2 - $cropY, ($maxY - $cropY) + $padding)

    $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $dest = New-Object System.Drawing.Bitmap($cropW, $cropH)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
    $g.DrawImage($b, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)

    $destPath = Join-Path $logosDir "$name.png"
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $dest.Dispose()
    Write-Host "Exact cropped $name - $cropW x $cropH"
}

CropExact "paytm" 840 480 1080 565
CropExact "mufin" 1090 480 1365 565
CropExact "amway" 1375 480 1620 565

CropExact "teledu" 830 580 985 710
CropExact "bca" 1010 580 1190 715
CropExact "krishaj" 1210 580 1365 715
CropExact "bsdu" 1375 580 1700 715

CropExact "uomo" 830 720 990 840
CropExact "rajesh" 1005 720 1210 840
CropExact "neofit" 1215 720 1465 840
CropExact "spectra" 1465 720 1720 840

$b.Dispose()
Write-Host "All 11 page 18 logos perfectly cropped!"
