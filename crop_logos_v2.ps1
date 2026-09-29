Add-Type -AssemblyName System.Drawing

$clientsDir = "D:\website\CLIENTS"
$logosDir = Join-Path $clientsDir "logos"
$showcaseDir = Join-Path $clientsDir "showcase"

if (-not (Test-Path $logosDir)) { New-Item -ItemType Directory -Path $logosDir | Out-Null }
if (-not (Test-Path $showcaseDir)) { New-Item -ItemType Directory -Path $showcaseDir | Out-Null }

function CropImage($sourceFile, $destFile, $x, $y, $width, $height) {
    if (-not (Test-Path $sourceFile)) {
        Write-Host "File not found: $sourceFile"
        return
    }
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

# 1. Master Brand Logos with generous clean padding
# Paytm
CropImage "$clientsDir\page_5.png" "$logosDir\paytm_large.png" 80 110 390 140

# Mufin Green Finance
CropImage "$clientsDir\page_6.png" "$logosDir\mufin_large.png" 85 90 410 150

# Intrend Colours (include top quotes & bottom subtitle)
CropImage "$clientsDir\page_7.png" "$logosDir\intrend_large.png" 70 65 350 170

# Colour Valley India
CropImage "$clientsDir\page_8.png" "$logosDir\colourvalley_large.png" 80 90 360 145

# Starfox Fashion (include full "No-Compromise Fashion")
CropImage "$clientsDir\page_9.png" "$logosDir\starfox_large.png" 80 100 410 150

# Malee Gardening (clean white tile logo from Page 11)
CropImage "$clientsDir\page_11.png" "$logosDir\malee_clean.png" 930 765 290 170
# Also Malee logo centered on dark
CropImage "$clientsDir\page_11.png" "$logosDir\malee_large.png" 760 300 370 240

# Lytage (clean branding from Page 13)
CropImage "$clientsDir\page_13.png" "$logosDir\lytage_large.png" 680 230 540 290

# 2. Logos from Page 18 Grid (1920x1080)
CropImage "$clientsDir\page_18.png" "$logosDir\paytm.png" 845 450 235 90
CropImage "$clientsDir\page_18.png" "$logosDir\mufin.png" 1110 450 260 90
CropImage "$clientsDir\page_18.png" "$logosDir\amway.png" 1375 450 245 90
CropImage "$clientsDir\page_18.png" "$logosDir\teledu.png" 840 545 150 140
CropImage "$clientsDir\page_18.png" "$logosDir\bca.png" 1010 550 180 130
CropImage "$clientsDir\page_18.png" "$logosDir\krishaj.png" 1210 545 145 140
CropImage "$clientsDir\page_18.png" "$logosDir\bsdu.png" 1380 550 305 130
CropImage "$clientsDir\page_18.png" "$logosDir\uomo.png" 850 685 135 130
CropImage "$clientsDir\page_18.png" "$logosDir\rajesh.png" 1010 685 195 130
CropImage "$clientsDir\page_18.png" "$logosDir\neofit.png" 1220 705 255 85
CropImage "$clientsDir\page_18.png" "$logosDir\spectra.png" 1480 695 215 105

# 3. Dedicated Brand Badges from Packaging Pages 15, 16, 17
# Go Desi Logo badge from box
CropImage "$clientsDir\page_15.png" "$logosDir\go_desi_logo.png" 790 325 330 140
# California Nuts / Chougan Logo badge
CropImage "$clientsDir\page_15.png" "$logosDir\california_nuts_logo.png" 160 340 350 160
# Mithai Magic Logo badge
CropImage "$clientsDir\page_15.png" "$logosDir\mithai_magic_logo.png" 1460 360 270 120

# Jovees Logo badge from bottle & box
CropImage "$clientsDir\page_16.png" "$logosDir\jovees_logo.png" 780 320 350 150
# Pulp XO Logo badge from pouch
CropImage "$clientsDir\page_16.png" "$logosDir\pulp_xo_logo.png" 1420 320 310 240
# Veg House Logo badge
CropImage "$clientsDir\page_16.png" "$logosDir\veg_house_logo.png" 185 410 305 200

# Bharat Certis Logo from page 17 box
CropImage "$clientsDir\page_17.png" "$logosDir\bharat_certis_logo.png" 110 280 450 130
# Dyazo Logo from keyboard box
CropImage "$clientsDir\page_17.png" "$logosDir\dyazo_logo.png" 365 440 280 120

Write-Host "All logo crops completed successfully!"
