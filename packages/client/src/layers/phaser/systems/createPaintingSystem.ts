import { defineComponentSystem, getComponentValueStrict } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { createRectangleObjectRegistry } from "../../../utils/phaser";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";
import { Colors } from "../constants";

export function createPaintingSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Position, Painting },
  } = network;

  const {
    scenes: {
      Main: {
        phaserScene,
        maps: {
          Main: { tileWidth, tileHeight },
        },
      },
    },
  } = phaser;

  const cellRegistry = createRectangleObjectRegistry();

  defineComponentSystem(world, Painting, ({ entity, value }) => {
    const state = value[0]?.value;
    if (!state) return console.warn("no grid state");
    const { x: gridX, y: gridY } = getComponentValueStrict(Position, entity);

    const update = () => {
      if (state.length === 0) {
        for (const cellId in cellRegistry.entities[entity]) {
          cellRegistry.get(entity, cellId)?.setAlpha(0);
        }
      } else {
        const lastCell = state[state.length - 1];
        const [inX, inY] = lastCell.split(":").map((x) => parseInt(x));
        const cellId = `${entity}.${inX}:${inY}`;
        let cellObj = cellRegistry.get(entity, cellId);
        if (!cellObj) {
          const color = Colors.Blue;
          const { x, y } = tileCoordToPixelCoord({ x: gridX + inX, y: gridY + inY }, tileWidth, tileHeight);
          cellObj = phaserScene.add.rectangle(x, y, tileWidth, tileHeight, color, 1);
          cellObj.setDepth(1);
          cellRegistry.add(entity, cellId, cellObj);
        }
        cellObj.setAlpha(1);
      }
    };

    setTimeout(update, 0);
  });
}
