Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile((Resolve-Path '.\CLIENTS\logos\paytm_large.png').Path)
Write-Host "Pixel 5,5: $($b.GetPixel(5,5))"
Write-Host "Pixel center: $($b.GetPixel(185, 60))"
$b.Dispose()

$b2 = [System.Drawing.Bitmap]::FromFile((Resolve-Path '.\CLIENTS\logos\paytm.png').Path)
Write-Host "paytm.png Pixel 5,5: $($b2.GetPixel(5,5))"
$b2.Dispose()

$b3 = [System.Drawing.Bitmap]::FromFile((Resolve-Path '.\CLIENTS\logos\mufin_large.png').Path)
Write-Host "mufin_large.png Pixel 5,5: $($b3.GetPixel(5,5))"
$b3.Dispose()
