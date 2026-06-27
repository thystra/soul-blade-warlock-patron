// Import Hexblade Patron Spells
// Version: 0.1.5
//
// Usage:
//   1. Select the Hexblade actor's token, or assign the actor as your user character.
//   2. The macro imports spells by UUID when the compendium exists.
//   3. Missing compendia/spells are skipped and reported.
//   4. Imported spells are marked "always prepared" when the system data supports that field.

const actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
if (!actor) {
  ui.notifications.warn("Select a Hexblade token or assign a character to your user.");
  return;
}

const spells = [
  { name: "Shield", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplShield0000", optional: false },
  { name: "Wrathful Smite", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplWrathfulSm", optional: false },
  { name: "Hex", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplHex0000000", optional: false },
  { name: "Armor of Agathys", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplArmorofAga", optional: false },
  { name: "Spirit Shroud", uuid: "Compendium.dnd-tashas-cauldron.tcoe-character-options.Item.tcoeSpiritShroud", optional: false },
  { name: "Conjure Barrage", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplConjureBar", optional: false },
  { name: "Staggering Smite", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplStaggering", optional: false },
  { name: "Shadow of Moil", uuid: "Compendium.world.ddb-2024-test-ddb-spells.Item.ShadowOfMoil14II", optional: false },
  { name: "Steel Wind Strike", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplSteelWindS", optional: false },
  { name: "Hold Monster", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplHoldMonste", optional: false },
  // Playtest extra; not part of the approved v0.1.5 patron table.
  { name: "Mirror Image", uuid: "Compendium.dnd-players-handbook.spells.Item.phbsplMirrorImag", optional: true }
];

const existing = new Set(actor.items.map(i => i.name.toLowerCase()));
const toCreate = [];
const missing = [];
const skipped = [];

for (const entry of spells) {
  if (existing.has(entry.name.toLowerCase())) {
    skipped.push(entry.name);
    continue;
  }

  let doc = null;
  try {
    doc = await fromUuid(entry.uuid);
  } catch (err) {
    console.warn(`Hexblade spell import failed for ${entry.name}`, entry.uuid, err);
  }

  if (!doc) {
    missing.push(entry.name);
    continue;
  }

  const data = doc.toObject();
  data._id = foundry.utils.randomID();
  foundry.utils.setProperty(data, "system.preparation.mode", "always");
  foundry.utils.setProperty(data, "system.preparation.prepared", true);
  foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.patronSpell", true);
  foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.sourceUuid", entry.uuid);
  toCreate.push(data);
}

if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);

let msg = `<h2>Hexblade Patron Spell Import</h2><p><strong>Actor:</strong> ${actor.name}</p>`;
if (toCreate.length) msg += `<p><strong>Imported:</strong> ${toCreate.map(s => s.name).join(", ")}</p>`;
if (skipped.length) msg += `<p><strong>Already present:</strong> ${skipped.join(", ")}</p>`;
if (missing.length) msg += `<p><strong>Missing UUIDs/compendia:</strong> ${missing.join(", ")}</p>`;
ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: msg });
ui.notifications.info(`Hexblade spell import complete: ${toCreate.length} imported, ${missing.length} missing.`);
