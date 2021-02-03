import { useState } from "react";
import "./App.css";
import { useInitCanvas } from "./utils/hooks";

const triangleVertices = [
  0.0,
  0.5,
  1.0,
  1.0,
  0.0,

  -0.5,
  -0.5,
  1.0,
  0.0,
  1.0,

  0.5,
  -0.5,
  0.0,
  1.0,
  1.0,
];

function App() {
  const [shapeVertices, setShapeVertices] = useState(triangleVertices);
  const [activeVertex, setActiveVertex] = useState(0);
  useInitCanvas(shapeVertices);

  const handleColor = (activeVertex, value) => {
    setShapeVertices();
  };

  return (
    <div className="row">
      <div className="col-8">
        <canvas id="glCanvas"></canvas>
      </div>
      <div className="col-4">
        <select onChange={(e) => setActiveVertex(e.target.value)}>
          {[0, 1, 2].map((id) => (
            <option value={id} key={id}>
              Vertex {id + 1}
            </option>
          ))}
        </select>
        <label>Pick color</label>
        <input
          type="color"
          onChange={(e) => handleColor(activeVertex, e.target.value)}
        />

        {/* <label>Vertex</label>
        <input type="file" />

        <label>Fragment</label>
        <input type="file" /> */}
      </div>
    </div>
  );
}

export default App;
