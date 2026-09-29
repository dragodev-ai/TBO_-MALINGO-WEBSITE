Add-Type -AssemblyName System.Drawing

$clientsDir = "D:\website\CLIENTS"
$logosDir = Join-Path $clientsDir "logos"

function CropImage($sourceFile, $destFile, $x, $y, $width, $height) {
    $src = [System.Drawing.Bitmap]::FromFile($sourceFile)
    if ($x -lt 0) { $x = 0 }
    if ($y -lt 0) { $y = 0 }
    if ($x + $width -gt $src.Width) { $width = $src.Width - $x }
    if ($y + $height -gt $src.Height) { $height = $src.Height - $y }
    
    $rect = New-Object System.Drawing.Rectangle($x, $y, $width, $height)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $g.DrawImage($src, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $dest.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Created: $destFile ($width x $height)"
}

# Accurate Page 18 Crops with optimal bounds
CropImage "$clientsDir\page_18.png" "$logosDir\paytm.png" 850 440 215 85
CropImage "$clientsDir\page_18.png" "$logosDir\mufin.png" 1115 440 250 85
CropImage "$clientsDir\page_18.png" "$logosDir\amway.png" 1375 440 220 85

CropImage "$clientsDir\page_18.png" "$logosDir\teledu.png" 845 550 140 135
CropImage "$clientsDir\page_18.png" "$logosDir\bca.png" 1025 555 160 125
CropImage "$clientsDir\page_18.png" "$logosDir\krishaj.png" 1215 550 135 135
CropImage "$clientsDir\page_18.png" "$logosDir\bsdu.png" 1380 555 300 120

CropImage "$clientsDir\page_18.png" "$logosDir\uomo.png" 855 690 130 125
CropImage "$clientsDir\page_18.png" "$logosDir\rajesh.png" 1015 690 190 125
CropImage "$clientsDir\page_18.png" "$logosDir\neofit.png" 1225 715 250 75
CropImage "$clientsDir\page_18.png" "$logosDir\spectra.png" 1480 705 215 95

# Clean Malee logo from Page 11 white tile
CropImage "$clientsDir\page_11.png" "$logosDir\malee_clean.png" 985 825 210 95

# Clean Jovees logo from Page 16 right box
CropImage "$clientsDir\page_16.png" "$logosDir\jovees_logo.png" 940 320 200 150

# Clean Chougan logo from Page 15
CropImage "$clientsDir\page_15.png" "$logosDir\california_nuts_logo.png" 150 345 350 150

# Clean Pulp XO logo from Page 16
CropImage "$clientsDir\page_16.png" "$logosDir\pulp_xo_logo.png" 785 320 180 85

# Clean Dyazo logo from Page 17
CropImage "$clientsDir\page_17.png" "$logosDir\dyazo_logo.png" 365 445 75 35

Write-Host "All fine crops done!"
