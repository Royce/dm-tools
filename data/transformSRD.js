const fs = require("fs").promises;
const _ = require("lodash");

const monsters = require("./5e-SRD-Monsters.json");
const spells = require("./5e-SRD-Spells.json");

const outDir = "./api/srd";

writeAll();

async function writeAll() {
  await writeMonsters();
  await writeSpells();
}

async function writeSpells() {
  const spell_index = _.map(spells, ({ index, name }) => index);

  await fs.mkdir(outDir + "/spell", { recursive: true });

  await fs.writeFile(
    outDir + "/spell/index.json",
    JSON.stringify(spell_index, null, 2)
  );

  await Promise.all(
    _.map(spells, (s) =>
      fs.writeFile(
        outDir + "/spell/" + s.index + ".json",
        JSON.stringify(s, null, 2)
      )
    )
  );
}

async function writeMonsters() {
  const monster_index = _.map(monsters, ({ index, name }) => index);

  await fs.mkdir(outDir + "/monster", { recursive: true });

  await fs.writeFile(
    outDir + "/monster/index.json",
    JSON.stringify(monster_index, null, 2)
  );

  await Promise.all(
    _.map(monsters, (m) =>
      fs.writeFile(
        outDir + "/monster/" + m.index + ".json",
        JSON.stringify(m, null, 2)
      )
    )
  );
}
