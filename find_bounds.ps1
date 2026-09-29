Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("D:\website\CLIENTS\page_18.png")
$minY = 1080
$maxY = 0
$minX = 1920
$maxX = 0

for ($x = 1350; $x -lt 1650; $x++) {
    for ($y = 400; $y -lt 550; $y++) {
        $p = $b.GetPixel($x, $y)
        if ($p.R -lt 240 -or $p.G -lt 240 -or $p.B -lt 240) {
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
}
Write-Host "Amway exact bounds: X=$minX to $maxX (W=$($maxX - $minX)), Y=$minY to $maxY (H=$($maxY - $minY))"
$b.Dispose()
