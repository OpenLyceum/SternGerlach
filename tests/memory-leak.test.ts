/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), survives a double dispose(), and leaves no survivors across repeated cycles
 * (tests/helpers/memoryLeak.ts). Add sim-specific leak tests below using forceGC().
 *
 * The view nodes link to Properties owned by the model, so those Properties are created once
 * here and outlive every case: a disposed node must unlink itself to be collectible.
 */

import { BooleanProperty, Emitter, NumberProperty, Property } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import type { TColor } from "scenerystack/scenery";
import { SpinSystem } from "../src/common/quantum/SpinSystem.js";
import type { BlochVector } from "../src/common/quantum/StateDisplay.js";
import { TimeModel } from "../src/common/TimeModel.js";
import SternGerlachColors from "../src/SternGerlachColors.js";
import { MODEL_VIEW_SCALE } from "../src/SternGerlachConstants.js";
import { Analyzer } from "../src/stern-gerlach-screen/model/devices/Analyzer.js";
import { Counter } from "../src/stern-gerlach-screen/model/devices/Counter.js";
import { Magnet } from "../src/stern-gerlach-screen/model/devices/Magnet.js";
import { ParticleSource } from "../src/stern-gerlach-screen/model/devices/ParticleSource.js";
import { Wire } from "../src/stern-gerlach-screen/model/Wire.js";
import { AnalyzerNode } from "../src/stern-gerlach-screen/view/nodes/AnalyzerNode.js";
import { BlochSphereNode } from "../src/stern-gerlach-screen/view/nodes/BlochSphereNode.js";
import { CounterNode } from "../src/stern-gerlach-screen/view/nodes/CounterNode.js";
import { DirectionSphereNode } from "../src/stern-gerlach-screen/view/nodes/DirectionSphereNode.js";
import { MagnetNode } from "../src/stern-gerlach-screen/view/nodes/MagnetNode.js";
import { SourceNode } from "../src/stern-gerlach-screen/view/nodes/SourceNode.js";
import { WireNode } from "../src/stern-gerlach-screen/view/nodes/WireNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

// Long-lived state that outlives every created node.
const blochProperty = new Property<BlochVector | null>({ x: 0, y: 0, z: 1 });
const thetaProperty = new NumberProperty(Math.PI / 3);
const phiProperty = new NumberProperty(Math.PI / 4);
const systemProperty = new Property(SpinSystem.SPIN_HALF);
const watchProperty = new BooleanProperty(false);
const analyzerExitEmitter = new Emitter<[Analyzer, number]>({
  parameters: [{ valueType: Analyzer }, { valueType: "number" }],
});
const totalDetectedProperty = new NumberProperty(0);
const expectedValuesVisibleProperty = new BooleanProperty(false);
const deadEndProbabilityProperty = new NumberProperty(0);
const barFillProperty = new Property<TColor>(SternGerlachColors.particleColorProperty);
const analyzer = new Analyzer(new Vector2(0, 0));
const magnet = new Magnet(new Vector2(1, 0));
const counter = new Counter(new Vector2(2, 0));
const source = new ParticleSource(new Vector2(-1, 0));
const wire = new Wire(source, 0, analyzer);
const mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
  Vector2.ZERO,
  new Vector2(0, 0),
  MODEL_VIEW_SCALE,
);

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "BlochSphereNode", create: () => new BlochSphereNode(blochProperty) },
  { name: "DirectionSphereNode", create: () => new DirectionSphereNode(thetaProperty, phiProperty) },
  {
    name: "AnalyzerNode",
    create: () => new AnalyzerNode(analyzer, systemProperty, watchProperty, analyzerExitEmitter),
    keepAlive: () => [analyzer, systemProperty, watchProperty, analyzerExitEmitter],
  },
  {
    name: "CounterNode",
    create: () =>
      new CounterNode(
        counter,
        totalDetectedProperty,
        expectedValuesVisibleProperty,
        deadEndProbabilityProperty,
        barFillProperty,
      ),
    keepAlive: () => [
      counter,
      totalDetectedProperty,
      expectedValuesVisibleProperty,
      deadEndProbabilityProperty,
      barFillProperty,
    ],
  },
  {
    name: "MagnetNode",
    create: () => new MagnetNode(magnet, systemProperty),
    keepAlive: () => [magnet, systemProperty],
  },
  {
    name: "SourceNode",
    create: () => new SourceNode(source, () => undefined),
    keepAlive: () => [source],
  },
  {
    name: "WireNode",
    create: () => new WireNode(wire, systemProperty, mvt),
    keepAlive: () => [wire, systemProperty, mvt, source, analyzer],
  },
]);
