import React, { useEffect, useState } from 'react';

import styles from './GraphvizGraph.module.css';

async function lazyGraphViz(graph: string): Promise<string> {
  return (await import('./graphviz')).renderSvg(graph);
}

export function GraphvizGraph({ graph }: { graph: string }) {
  const [result, setResult] = useState<
    | { type: 'success'; svg: string }
    | { type: 'error'; error: Error }
    | undefined
  >(undefined);

  useEffect(() => {
    let active = true;
    setResult(undefined);
    console.log('Rendering graph:', graph);
    lazyGraphViz(graph)
      .then((result) => {
        if (active) {
          setResult({ type: 'success', svg: result });
        }
      })
      .catch((error) => {
        if (active) {
          setResult({ type: 'error', error });
          console.error(`Error rendering graph`, error);
        }
      });
    return () => {
      active = false;
    };
  }, [graph]);
  if (result) {
    if (result.type === 'success') {
      return (
        <div className={styles.root}>
          <div dangerouslySetInnerHTML={{ __html: result.svg }} />
        </div>
      );
    }
    return (
      <div className={styles.root}>
        Error generating schema diagram: {result.error.toString()}
      </div>
    );
  }
  return (
    <div className={styles.root}>
      Generating fancy schema diagram with viz.js…
    </div>
  );
}
