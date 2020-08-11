import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

export async function renderSvg(graph: string): Promise<string> {
  const viz = new Viz({ Module, render });
  return viz.renderString(graph);
}
