// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { Coord } from "../types.sol";
import { GridId, TickPredeployAddr, TicksPerCall } from "../constants.sol";
import { Conway } from "../libraries/LibConway.sol";
import { ConwayStateComponent, ID as ConwayStateComponentID } from "../components/ConwayStateComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "../components/DimensionsComponent.sol";
import { CellBitSizeComponent, ID as CellBitSizeComponentID } from "../components/CellBitSizeComponent.sol";

// import "forge-std/console.sol";

uint256 constant ID = uint256(keccak256("conway.system.tick"));

contract TickSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function tickDebug() external {
    execute(abi.encodePacked());
  }

  function tick() external {
    require(msg.sender == TickPredeployAddr, "TickSystem: only tick predeploy can call tick()");
    execute(abi.encodePacked());
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 entity = GridId;
    // Get components
    DimensionsComponent dimensionsComponent = DimensionsComponent(getAddressById(components, DimensionsComponentID));
    CellBitSizeComponent cellBitSizeComponent = CellBitSizeComponent(
      getAddressById(components, CellBitSizeComponentID)
    );
    ConwayStateComponent conwayComponent = ConwayStateComponent(getAddressById(components, ConwayStateComponentID));
    // Get values
    Coord memory dimensions = dimensionsComponent.getValue(entity);
    uint256 cellBitSize = cellBitSizeComponent.getValue(entity);
    bytes memory state = conwayComponent.getValue(entity);
    // Update state with new cells
    // for (uint256 ii = 0; ii < newCells.length; ii++) {
    //   bytes1 n = newCells[ii];
    //   if (n == 0) {
    //     continue;
    //   }
    //   bytes1 b = state[ii];
    //   if (b == 0) {
    //     state[ii] = n;
    //     continue;
    //   }
    //   for (uint256 jj = 0; jj < 8 / cellBitSize; jj++) {
    //     uint256 offset = jj * cellBitSize;
    //     bytes1 mask = bytes1(uint8(2**cellBitSize - 1)) << (8 - offset - cellBitSize);
    //     bytes1 sn = n & mask;
    //     if (sn == 0) {
    //       continue;
    //     }
    //     b = (b & ~mask) | sn;
    //   }
    //   state[ii] = b;
    // }
    // Execute steps setting state every time
    for (uint256 ii = 0; ii < TicksPerCall; ii++) {
      state = Conway.step(uint256(int256(dimensions.x)), uint256(int256(dimensions.y)), cellBitSize, state);
      conwayComponent.setValue(entity, state);
    }
  }
}
