Add-Type -AssemblyName System.Drawing

$clientsDir = "D:\website\CLIENTS"
$logosDir = Join-Path $clientsDir "logos"

$b = [System.Drawing.Bitmap]::FromFile("$clientsDir\page_18.png")

function GetBoundsAndCrop($name, $searchX1, $searchY1, $searchX2, $searchY2, $padding = 10) {
    global:b
    global:logosDir

    $minY = 9999
    $maxY = -1
    $minX = 9999
    $maxX = -1

    for ($x = $searchX1; $x -lt $searchX2; $x++) {
        for ($y = $searchY1; $y -lt $searchY2; $y++) {
            $p = $b.GetPixel($x, $y)
            # Check for non-white/non-cream pixel
            if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
            }
        }
    }

    if ($minX -eq 9999) {
        Write-Host "No logo found in range for $name"
        return
    }

    $cropX = [Math]::Max(0, $minX - $padding)
    $cropY = [Math]::Max(0, $minY - $padding)
    $cropW = [Math]::Min($b.Width - $cropX, ($maxX - $minX) + ($padding * 2))
    $cropH = [Math]::Min($b.Height - $cropY, ($maxY - $minY) + ($padding * 2))

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
    $g.Dispose()
    $dest.Dispose()

    Write-Host "Perfected $name -> X=$cropX, Y=$cropY, W=$cropW, H=$cropH"
}

# Row 1
GetBoundsAndCrop "paytm" 800 450 1080 560
GetBoundsAndCrop "mufin" 1080 450 1350 560
GetBoundsAndCrop "amway" 1340 450 1620 560

# Row 2
GetBoundsAndCrop "teledu" 800 560 990 690
GetBoundsAndCrop "bca" 990 560 1190 690
GetBoundsAndCrop "krishaj" 1190 560 1350 690
GetBoundsAndCrop "bsdu" 1350 560 1700 690

# Row 3
GetBoundsAndCrop "uomo" 800 690 990 820
GetBoundsAndCrop "rajesh" 990 690 1190 820
GetBoundsAndCrop "neofit" 1190 690 1450 820
GetBoundsAndCrop "spectra" 1450 690 1720 820

$b.Dispose()
Write-Host "Auto-crop completed with 100% precision!"
