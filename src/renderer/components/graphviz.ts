// This is some hacking to get viz.js to load asynchronously using es modules
export async function renderSvg(graph: string): Promise<string> {
  // @ts-ignore
  const viz = await import('viz.js/viz.es.js');
  // @ts-ignore
  window.Viz = viz.default;
  // @ts-ignore
  await import('viz.js/full.render.js');
  // @ts-ignore
  return new Viz().renderString(graph);
}
