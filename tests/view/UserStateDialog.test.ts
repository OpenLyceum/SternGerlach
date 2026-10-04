/**
 * UserStateDialog construction regression.
 *
 * The ket-row labels are rewritten from the chosen basis and system. When they were bound to a
 * derived (read-only) PatternStringProperty, that rewrite tripped the "targetProperty must be
 * settable" assertion and the dialog — built at startup — failed with assertions enabled (the
 * dev build). Assertions are off in the shared test setup, so this file enables them.
 */

import { enableAssert } from "scenerystack/assert";
import { Property } from "scenerystack/axon";
import { Text } from "scenerystack/scenery";
import { describe, expect, it } from "vitest";
import { AnalyzerType } from "../../src/common/quantum/AnalyzerType.js";
import { OperatorTable } from "../../src/common/quantum/OperatorTable.js";
import { SpinSystem } from "../../src/common/quantum/SpinSystem.js";
import { UserStateModel } from "../../src/stern-gerlach-screen/model/UserStateModel.js";
import { UserStateDialog } from "../../src/stern-gerlach-screen/view/dialogs/UserStateDialog.js";
import { installSimStub } from "./simStub.js";

installSimStub();
enableAssert();

/** Every Text string under the dialog, for asserting on the ket-row labels. */
function textStrings(dialog: UserStateDialog): string[] {
  return dialog
    .getLeafTrails()
    .map((trail) => trail.lastNode())
    .filter((node): node is Text => node instanceof Text)
    .map((text) => text.string);
}

describe("UserStateDialog", () => {
  it("builds under assertions and relabels ket rows when the basis or system changes", () => {
    const userState = new UserStateModel();
    const systemProperty = new Property(SpinSystem.SPIN_HALF);
    const dialog = new UserStateDialog(userState, systemProperty, new OperatorTable());
    expect(textStrings(dialog)).toContain("|+z⟩");

    userState.basisProperty.value = AnalyzerType.X;
    expect(textStrings(dialog)).toEqual(expect.arrayContaining(["|+x⟩", "|−x⟩"]));

    systemProperty.value = SpinSystem.SPIN_ONE;
    expect(textStrings(dialog)).toEqual(expect.arrayContaining(["|+1⟩", "|0⟩", "|−1⟩"]));
  });
});
