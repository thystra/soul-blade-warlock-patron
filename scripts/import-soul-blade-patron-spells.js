// Import Soul Blade Patron Spells
// Imports the optional patron spell list onto the selected token's actor,
// or onto your assigned user character if no token is selected.
//
// This macro imports spell Items by UUID. It does not bundle or redistribute
// paid spell text; the UUIDs must resolve from compendia available in the world.

const actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;

if (!actor) {
  ui.notifications.warn("Select a token or assign a character to your user.");
  return;
}

const spellEntries = [
  {
    level: 3,
    name: "Shield",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplShield0000"
  },
  {
    level: 3,
    name: "Wrathful Smite",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplWrathfulSm"
  },
  {
    level: 3,
    name: "Hex",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplHex0000000"
  },
  {
    level: 3,
    name: "Armor of Agathys",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplArmorofAga"
  },
  {
    level: 5,
    name: "Spirit Shroud",
    uuid: "Compendium.dnd-tashas-cauldron.tcoe-character-options.Item.tcoeSpiritShroud"
  },
  {
    level: 5,
    name: "Conjure Barrage",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplConjureBar"
  },
  {
    level: 7,
    name: "Staggering Smite",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplStaggering"
  },
  {
    level: 7,
    name: "Shadow of Moil",
    uuid: "Compendium.world.ddb-2024-test-ddb-spells.Item.ShadowOfMoil14II"
  },
  {
    level: 9,
    name: "Steel Wind Strike",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplSteelWindS"
  },
  {
    level: 9,
    name: "Hold Monster",
    uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplHoldMonste"
  }
];

const imported = [];
const skipped = [];
const missing = [];
const failed = [];

for (const entry of spellEntries) {
  const alreadyOwned = actor.items.some((item) => item.type === "spell" && item.name === entry.name);
  if (alreadyOwned) {
    skipped.push(entry.name);
    continue;
  }

  try {
    const sourceItem = await fromUuid(entry.uuid);
    if (!sourceItem) {
      missing.push(entry.name);
      continue;
    }

    const itemData = sourceItem.toObject();
    itemData.system ??= {};
    itemData.system.source ??= {};
    itemData.system.source.custom = "Soul Blade Patron";

    await actor.createEmbeddedDocuments("Item", [itemData]);
    imported.push(entry.name);
  } catch (error) {
    console.error(`Soul Blade spell import failed for ${entry.name}`, error);
    failed.push(entry.name);
  }
}

let content = `<h2>Soul Blade Patron Spells</h2>`;
content += `<p><strong>Actor:</strong> ${actor.name}</p>`;

if (imported.length) {
  content += `<p><strong>Imported:</strong> ${imported.join(", ")}</p>`;
}

if (skipped.length) {
  content += `<p><strong>Skipped; already present:</strong> ${skipped.join(", ")}</p>`;
}

if (missing.length) {
  content += `<p><strong>Missing UUIDs or unavailable compendia:</strong> ${missing.join(", ")}</p>`;
}

if (failed.length) {
  content += `<p><strong>Failed:</strong> ${failed.join(", ")}</p>`;
}

if (!imported.length && !skipped.length && !missing.length && !failed.length) {
  content += `<p>No spells were processed.</p>`;
}

await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor }),
  content
});

ui.notifications.info(`Soul Blade spell import complete for ${actor.name}.`);

