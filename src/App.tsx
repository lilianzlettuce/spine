import { useState } from "react";
import heroImg from "./assets/hero.png";
import { CanvasView } from "./components/CanvasView.tsx";
import { Controls } from "./components/Controls.tsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="app">
        <Controls />
        <main className="stage">
          <CanvasView />
        </main>
      </div>
    </>
  );
}

export default App;
