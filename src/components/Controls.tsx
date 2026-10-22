import { ARCHETYPE_NAMES, type ArchetypeName } from "../core/archetypes";
import { useStore } from "../state/store";
import { exportPng } from "./exportPng";

export function Controls() {
  const { archetype, seed, light, showJoints, scene, drawMode } = useStore();
  const {
    setArchetype,
    setSeed,
    regenerate,
    setLight,
    setShowJoints,
    setDrawMode,
  } = useStore.getState();

  return (
    <aside className="controls">
      <h1>Spine / Vine Tool</h1>

      <label>
        Archetype
        <select
          value={archetype}
          onChange={(e) => setArchetype(e.target.value as ArchetypeName)}
        >
          {ARCHETYPE_NAMES.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>

      <label>
        Seed
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value) || 0)}
        />
      </label>

      <label>
        Draw Mode
        <select value={drawMode} onChange={(e) => setDrawMode(e.target.value)}>
          <option value="auto">Auto</option>
          <option value="draw">Draw</option>
        </select>
      </label>

      <button onClick={regenerate}>Regenerate</button>

      <label>
        Light angle
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={light}
          onChange={(e) => setLight(Number(e.target.value))}
        />
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={showJoints}
          onChange={(e) => setShowJoints(e.target.checked)}
        />
        Show attachment points
      </label>

      <button onClick={() => exportPng(scene, light)}>Export PNG</button>

      <p className="hint">
        {scene.curves.length} curves · seed {scene.seed}
      </p>
    </aside>
  );
}
