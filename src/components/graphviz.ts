// This is some hacking to get viz.js to load asynchronously using es modules
export async function renderSvg(graph: string): Promise<string> {
  // @ts-ignore
  const viz = await import(/* webpackIgnore: true */ '/viz.js-2.1.2/viz.es.js');
  // @ts-ignore
  window.Viz = viz.default;
  // @ts-ignore
  await import(/* webpackIgnore: true */ '/viz.js-2.1.2/full.render.es.js');
  // @ts-ignore
  return new Viz().renderString(graph);
}
