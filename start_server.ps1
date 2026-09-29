param([int]$Port = 3000)

$code = @"
using System;
using System.IO;
using System.Net;

public class TinyServer {
    public static void Start(string rootDir, int port) {
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add("http://localhost:" + port + "/");
        listener.Start();
        Console.WriteLine("SERVER_ONLINE_AT http://localhost:" + port + "/");
        while (true) {
            try {
                HttpListenerContext ctx = listener.GetContext();
                System.Threading.ThreadPool.QueueUserWorkItem((state) => {
                    HttpListenerContext c = (HttpListenerContext)state;
                    try {
                        string rawPath = Uri.UnescapeDataString(c.Request.Url.LocalPath.TrimStart('/'));
                        if (string.IsNullOrEmpty(rawPath)) rawPath = "malingo.html";
                        string fullPath = Path.Combine(rootDir, rawPath.Replace('/', Path.DirectorySeparatorChar));
                        
                        if (File.Exists(fullPath)) {
                            byte[] buffer = File.ReadAllBytes(fullPath);
                            string ext = Path.GetExtension(fullPath).ToLowerInvariant();
                            string ct = "application/octet-stream";
                            if (ext == ".html") ct = "text/html; charset=utf-8";
                            else if (ext == ".css") ct = "text/css; charset=utf-8";
                            else if (ext == ".js") ct = "application/javascript; charset=utf-8";
                            else if (ext == ".png") ct = "image/png";
                            else if (ext == ".jpg" || ext == ".jpeg") ct = "image/jpeg";
                            else if (ext == ".svg") ct = "image/svg+xml";
                            else if (ext == ".pdf") ct = "application/pdf";
                            else if (ext == ".json") ct = "application/json; charset=utf-8";

                            c.Response.ContentType = ct;
                            c.Response.ContentLength64 = buffer.Length;
                            c.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                            c.Response.StatusCode = 200;

                            if (!c.Request.HttpMethod.Equals("HEAD", StringComparison.OrdinalIgnoreCase)) {
                                c.Response.OutputStream.Write(buffer, 0, buffer.Length);
                            }
                            c.Response.OutputStream.Close();
                        } else {
                            c.Response.StatusCode = 404;
                            c.Response.Close();
                        }
                    } catch {
                        try { c.Response.Abort(); } catch {}
                    }
                }, ctx);
            } catch {
                break;
            }
        }
    }
}
"@

Add-Type -TypeDefinition $code -Language CSharp
[TinyServer]::Start($PSScriptRoot, $Port)
