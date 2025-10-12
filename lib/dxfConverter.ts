// Minimal SVG -> DXF placeholder converter
export async function svgToDxf(svg: string): Promise<string> {
  // Real conversion would use makerjs or a dedicated library.
  // Here we return a very small DXF-like stub so UI can download a .dxf file.
  const header = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
  const footer = "0\nENDSEC\n0\nEOF\n";
  const body = `0\nTEXT\n8\n0\n10\n0\n20\n0\n40\n1\n1\n${svg.slice(0,200).replace(/\n/g, ' ')}\n`;
  return header + body + footer;
}
