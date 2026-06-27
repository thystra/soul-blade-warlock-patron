// Summon Hexbound Specter
// Version: 0.1.5
//
// Usage:
//   Select the Hexblade's token on an active scene and run this macro.
//   It imports/creates a world actor from the module compendium, scales the copy,
//   and places a token one grid space to the right of the summoner.

const summonerToken = canvas.tokens?.controlled?.[0];
const summoner = summonerToken?.actor ?? game.user.character;

if (!summoner) {
  ui.notifications.warn("Select the Hexblade token or assign a character to your user.");
  return;
}

const sourceUuid = "Compendium.dnd-5-5-hexblade-warlock.hexblade-actors.Actor.hxbSpecterActor1";
const source = await fromUuid(sourceUuid);
if (!source) {
  ui.notifications.error(`Could not find Hexbound Specter actor: ${sourceUuid}`);
  return;
}

const warlockClass = summoner.items.find(i => i.type === "class" && (i.system?.identifier === "warlock" || i.name.toLowerCase() === "warlock"));
const warlockLevel = Number(warlockClass?.system?.levels ?? summoner.system?.classes?.warlock?.levels ?? 0);
const prof = Number(summoner.system?.attributes?.prof ?? summoner.system?.prof ?? 2);
const chaMod = Number(summoner.system?.abilities?.cha?.mod ?? 0);
const ac = 12 + Math.floor(prof / 2);
const hp = 10 + (5 * Math.max(warlockLevel, 1));
const damageDice = warlockLevel >= 14 ? "5d6" : warlockLevel >= 10 ? "4d6" : "3d6";
const damageNumber = warlockLevel >= 14 ? 5 : warlockLevel >= 10 ? 4 : 3;
const attackBonus = 4 + chaMod;

// Convert a desired modifier to a score. Used so @abilities.cha.mod roughly matches the summoner.
const chaScore = Math.max(1, Math.min(30, 10 + (2 * chaMod)));

const data = source.toObject();
data._id = foundry.utils.randomID();
data.name = `${summoner.name}'s Hexbound Specter`;

foundry.utils.setProperty(data, "system.attributes.ac.flat", ac);
foundry.utils.setProperty(data, "system.attributes.hp.value", hp);
foundry.utils.setProperty(data, "system.attributes.hp.max", hp);
foundry.utils.setProperty(data, "system.attributes.prof", prof);
foundry.utils.setProperty(data, "system.abilities.cha.value", chaScore);
foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.summoner", summoner.uuid);
foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.warlockLevel", warlockLevel);
foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.attackBonus", attackBonus);
foundry.utils.setProperty(data, "flags.dnd-5-5-hexblade-warlock.damageDice", damageDice);

// Tune Life Drain activities on the copied actor.
for (const item of data.items ?? []) {
  if (item.name !== "Life Drain") continue;
  const activities = item.system?.activities ?? {};
  for (const activity of Object.values(activities)) {
    if (activity.type !== "attack") continue;
    foundry.utils.setProperty(activity, "attack.flat", true);
    foundry.utils.setProperty(activity, "attack.ability", "");
    foundry.utils.setProperty(activity, "attack.bonus", String(attackBonus));
  }
  const activeId = damageNumber === 5 ? "hxbLD5d6" : damageNumber === 4 ? "hxbLD4d6" : "hxbLD3d6";
  for (const [id, activity] of Object.entries(activities)) {
    foundry.utils.setProperty(activity, "visibility.level.min", id === activeId ? null : 99);
  }
}

const createdActor = await Actor.create(data, { renderSheet: false });

if (!canvas.scene || !summonerToken) {
  ui.notifications.info(`Created actor ${createdActor.name}. Drag it to the scene when ready.`);
} else {
  const grid = canvas.grid?.size ?? 100;
  const tokenData = createdActor.prototypeToken.toObject();
  tokenData.actorId = createdActor.id;
  tokenData.actorLink = false;
  tokenData.name = createdActor.name;
  tokenData.x = summonerToken.document.x + grid;
  tokenData.y = summonerToken.document.y;
  tokenData.disposition = summonerToken.document.disposition;
  tokenData.bar1 = { attribute: "attributes.hp" };
  await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
  ui.notifications.info(`Summoned ${createdActor.name}: AC ${ac}, HP ${hp}, Life Drain +${attackBonus} / ${damageDice} necrotic.`);
}

ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor: summoner }),
  content: `<h2>Hexbound Specter Summoned</h2>
  <p><strong>AC:</strong> ${ac}</p>
  <p><strong>HP:</strong> ${hp}</p>
  <p><strong>Life Drain:</strong> +${attackBonus} to hit, ${damageDice} Necrotic damage.</p>
  <p><em>Command behavior remains as written in the Hexbound Specter feature.</em></p>`
});
