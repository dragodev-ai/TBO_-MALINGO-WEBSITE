Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null


$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
})[0]

function AwaitTask($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    return $netTask.Result
}

function AwaitAction($WinRtAction) {
    $asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' 
    })[0]
    $netTask = $asTask.Invoke($null, @($WinRtAction))
    $netTask.Wait(-1) | Out-Null
}

$pdfPath = [System.IO.Path]::GetFullPath(".\Malingo Portfolio 2026.pdf")
$outputDir = [System.IO.Path]::GetFullPath(".\CLIENTS")
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }

$file = AwaitTask ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)) ([Windows.Storage.StorageFile])
$doc = AwaitTask ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])

Write-Host "PDF Pages Count: $($doc.PageCount)"

for ($i = 0; $i -lt $doc.PageCount; $i++) {
    $pageNum = $i + 1
    $page = $doc.GetPage($i)
    
    $pngPath = Join-Path $outputDir "page_$pageNum.png"
    $storageFile = AwaitTask ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($outputDir)) ([Windows.Storage.StorageFolder])
    $destFile = AwaitTask ($storageFile.CreateFileAsync("page_$pageNum.png", [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
    
    $stream = AwaitTask ($destFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)) ([Windows.Storage.Streams.IRandomAccessStream])
    
    $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $renderOptions.DestinationWidth = [uint32]1920
    
    AwaitAction ($page.RenderToStreamAsync($stream, $renderOptions))
    $stream.Dispose()
    Write-Host "Rendered Page $pageNum -> page_$pageNum.png"
}
Write-Host "All pages successfully rendered!"
