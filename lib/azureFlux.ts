export interface AzureFluxOptions {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: string;
  responseFormat?: "url" | "b64_json";
}

function mapStyle(style?: string): "natural" | "vivid" {
  if (!style) return "natural";
  const normalized = style.toLowerCase();
  if (normalized === "natural" || normalized === "vivid") {
    return normalized as "natural" | "vivid";
  }

  // Technical/precision-focused styles tend to render best with the more neutral "natural" profile.
  const naturalStyles = new Set(["technical", "schematic", "blueprint", "minimal", "cad", "architecture"]);
  return naturalStyles.has(normalized) ? "natural" : "vivid";
}

export async function callAzureFluxImage(opts: AzureFluxOptions): Promise<{ primaryUrl?: string; pngUrl?: string; svgUrl?: string; b64Json?: string }> {
  const endpoint = process.env.AZURE_FLUX_11_PRO_ENDPOINT || process.env.AZURE_FLUX_KONTEXT_PRO_ENDPOINT;
  const apiKey = process.env.AZURE_FLUX_11_PRO_API_KEY || process.env.AZURE_FLUX_KONTEXT_PRO_API_KEY || process.env.AZURE_FLUX_API_KEY;
  if (!endpoint || !apiKey) {
    throw new Error("Azure Flux endpoint or API key not configured");
  }

  const responseFormat = opts.responseFormat === "b64_json" ? "b64_json" : "url";
  const style = mapStyle(opts.style);

  const body: any = {
    prompt: opts.prompt,
    width: opts.width || 1024,
    height: opts.height || 1024,
    quality: opts.quality || "hd",
    response_format: responseFormat,
    style,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Azure Flux request failed: ${res.status} ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  // expected structure per PRD: data[0].url for generated image
  const primaryUrl = Array.isArray(data?.data) && data.data[0]?.url ? data.data[0].url : data?.url || undefined;
  const b64Json = Array.isArray(data?.data) && data.data[0]?.b64_json ? data.data[0].b64_json : data?.b64_json;

  // If provider returned multiple formats, try to extract svg/png locations
  let pngUrl: string | undefined;
  let svgUrl: string | undefined;
  if (Array.isArray(data?.data)) {
    data.data.forEach((item: any) => {
      if (!item || !item.url) return;
      const url: string = item.url;
      if (url.endsWith(".svg")) svgUrl = url;
      else if (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg")) pngUrl = url;
      else {
        // unknown, assign to primary if primary not set
        if (!pngUrl) pngUrl = url;
      }
    });
  }

  // If Flux only returns a single URL, treat it as PNG by default.
  if (!pngUrl && typeof primaryUrl === "string") {
    pngUrl = primaryUrl;
  }

  return { primaryUrl, pngUrl, svgUrl, b64Json };
}
