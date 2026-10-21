import { useState } from "react";
import heroImg from "./assets/hero.png";
import { CanvasView } from "./components/CanvasView.tsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CanvasView />
    </>
  );
}

export default App;
