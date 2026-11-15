/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), survives a double dispose(), and leaves no survivors across repeated cycles
 * (tests/helpers/memoryLeak.ts). Add sim-specific leak tests below using forceGC().
 *
 * The view nodes link to Properties owned by the model, so those Properties are created once
 * here and outlive every case: a disposed node must unlink itself to be collectible.
 */

import { NumberProperty, Property } from "scenerystack/axon";
import type { BlochVector } from "../src/common/quantum/StateDisplay.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { BlochSphereNode } from "../src/stern-gerlach-screen/view/nodes/BlochSphereNode.js";
import { DirectionSphereNode } from "../src/stern-gerlach-screen/view/nodes/DirectionSphereNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

// Long-lived state that outlives every created node.
const blochProperty = new Property<BlochVector | null>({ x: 0, y: 0, z: 1 });
const thetaProperty = new NumberProperty(Math.PI / 3);
const phiProperty = new NumberProperty(Math.PI / 4);

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "BlochSphereNode", create: () => new BlochSphereNode(blochProperty) },
  { name: "DirectionSphereNode", create: () => new DirectionSphereNode(thetaProperty, phiProperty) },
]);
