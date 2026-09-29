Add-Type -AssemblyName System.Drawing

$clientsDir = "D:\website\CLIENTS"
$logosDir = Join-Path $clientsDir "logos"
$showcaseDir = Join-Path $clientsDir "showcase"

if (-not (Test-Path $logosDir)) { New-Item -ItemType Directory -Path $logosDir | Out-Null }
if (-not (Test-Path $showcaseDir)) { New-Item -ItemType Directory -Path $showcaseDir | Out-Null }

function CropImage($sourceFile, $destFile, $x, $y, $width, $height) {
    $src = [System.Drawing.Bitmap]::FromFile($sourceFile)
    
    # Boundary clamps
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

# 1. Logos from Individual Pages
CropImage "$clientsDir\page_5.png" "$logosDir\paytm_large.png" 90 120 370 120
CropImage "$clientsDir\page_6.png" "$logosDir\mufin_large.png" 90 100 400 135
CropImage "$clientsDir\page_7.png" "$logosDir\intrend_large.png" 90 85 320 145
CropImage "$clientsDir\page_8.png" "$logosDir\colourvalley_large.png" 90 100 340 125
CropImage "$clientsDir\page_9.png" "$logosDir\starfox_large.png" 90 110 390 120
CropImage "$clientsDir\page_11.png" "$logosDir\malee_large.png" 760 300 370 240
CropImage "$clientsDir\page_13.png" "$logosDir\lytage_large.png" 690 240 520 280

# 2. Logos from Page 18 Grid (1920x1080)
CropImage "$clientsDir\page_18.png" "$logosDir\paytm.png" 850 455 225 80
CropImage "$clientsDir\page_18.png" "$logosDir\mufin.png" 1115 455 245 80
CropImage "$clientsDir\page_18.png" "$logosDir\amway.png" 1380 455 235 80
CropImage "$clientsDir\page_18.png" "$logosDir\teledu.png" 845 550 140 135
CropImage "$clientsDir\page_18.png" "$logosDir\bca.png" 1015 560 170 120
CropImage "$clientsDir\page_18.png" "$logosDir\krishaj.png" 1215 550 135 135
CropImage "$clientsDir\page_18.png" "$logosDir\bsdu.png" 1385 555 295 125
CropImage "$clientsDir\page_18.png" "$logosDir\uomo.png" 855 690 125 120
CropImage "$clientsDir\page_18.png" "$logosDir\rajesh.png" 1015 690 185 120
CropImage "$clientsDir\page_18.png" "$logosDir\neofit.png" 1225 710 245 75
CropImage "$clientsDir\page_18.png" "$logosDir\spectra.png" 1485 700 205 95

# 3. Product & Packaging Showcases from Pages 15, 16, 17
CropImage "$clientsDir\page_15.png" "$showcaseDir\california_nuts.png" 45 225 585 520
CropImage "$clientsDir\page_15.png" "$showcaseDir\go_desi.png" 665 225 585 520
CropImage "$clientsDir\page_15.png" "$showcaseDir\mithai_magic.png" 1280 225 590 520

CropImage "$clientsDir\page_16.png" "$showcaseDir\veg_house.png" 45 225 585 520
CropImage "$clientsDir\page_16.png" "$showcaseDir\jovees.png" 665 225 585 520
CropImage "$clientsDir\page_16.png" "$showcaseDir\pulp_xo.png" 1280 225 590 520

CropImage "$clientsDir\page_17.png" "$showcaseDir\bharat_certis.png" 45 225 585 520
CropImage "$clientsDir\page_17.png" "$showcaseDir\dyazo.png" 665 225 585 520
CropImage "$clientsDir\page_17.png" "$showcaseDir\incase.png" 1280 225 590 520

# 4. Campaign Mockups from Pages 5, 6, 7, 8, 9, 11, 12, 13
CropImage "$clientsDir\page_5.png" "$showcaseDir\paytm_campaign.png" 780 120 1060 760
CropImage "$clientsDir\page_6.png" "$showcaseDir\mufin_campaign.png" 780 100 1060 840
CropImage "$clientsDir\page_7.png" "$showcaseDir\intrend_campaign.png" 780 100 1060 840
CropImage "$clientsDir\page_8.png" "$showcaseDir\colourvalley_campaign.png" 780 100 1060 840
CropImage "$clientsDir\page_9.png" "$showcaseDir\starfox_campaign.png" 780 100 1060 840
CropImage "$clientsDir\page_11.png" "$showcaseDir\malee_campaign.png" 90 380 570 540
CropImage "$clientsDir\page_12.png" "$showcaseDir\starfox_outdoor.png" 1280 220 540 700

Write-Host "All company logos and showcase visuals extracted successfully!"
