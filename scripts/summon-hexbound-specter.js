// Summon Hexbound Specter
// Version: 0.2.7
//
// Select the Soul Blade warlock token before running this macro. The macro creates
// a world Actor from the module's Hexbound Specter compendium actor and places an
// unlinked token beside the summoner when a scene is active.

const MODULE_ID = "soul-blade-warlock-patron";
const ACTOR_PACK = "soulblade-actors";
const SPECTER_NAME = "Hexbound Specter";

const summonerToken = canvas.tokens?.controlled?.[0] ?? null;
const summoner = summonerToken?.actor ?? game.user.character;

if (!summoner) {
  ui.notifications.warn("Select a Soul Blade warlock token or assign a character to your user.");
  return;
}

const warlockClass = summoner.items.find(item => {
  const identifier = item.system?.identifier ?? "";
  return item.type === "class" && (identifier === "warlock" || item.name.toLowerCase() === "warlock");
});

const warlockLevel = Number(warlockClass?.system?.levels ?? summoner.system?.classes?.warlock?.levels ?? 0);
if (!warlockLevel) {
  ui.notifications.warn(`Could not determine ${summoner.name}'s Warlock level.`);
  return;
}

const charismaMod = Number(summoner.system?.abilities?.cha?.mod ?? 0);
const proficiency = Number(summoner.system?.attributes?.prof ?? summoner.system?.prof ?? 2);

// Current v0.2.7 tuning: 5 + floor((5 × Warlock Level) / 2).
const specterHp = Math.max(1, 5 + Math.floor((5 * warlockLevel) / 2));
const specterAc = 12 + Math.floor(proficiency / 2);
const lifeDrainDice = warlockLevel >= 14 ? 5 : warlockLevel >= 10 ? 4 : 3;
const lifeDrainAttackBonus = 4 + charismaMod;

const pack = game.packs.get(`${MODULE_ID}.${ACTOR_PACK}`);
if (!pack) {
  ui.notifications.error(`Could not find compendium pack: ${MODULE_ID}.${ACTOR_PACK}`);
  return;
}

let sourceActor = null;
const index = await pack.getIndex({ fields: ["name", "type"] });
const entry = index.find(document => document.name === SPECTER_NAME) ?? index.find(document => /specter/i.test(document.name));
if (entry) sourceActor = await pack.getDocument(entry._id);

if (!sourceActor) {
  ui.notifications.error(`Could not find ${SPECTER_NAME} in ${pack.metadata.label}.`);
  return;
}

const actorData = foundry.utils.deepClone(sourceActor.toObject());
delete actorData._id;
actorData.name = `${summoner.name}'s Hexbound Specter`;
actorData.folder = null;
actorData.ownership = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
actorData.system ??= {};
actorData.system.attributes ??= {};
actorData.system.attributes.hp ??= {};
actorData.system.attributes.hp.value = specterHp;
actorData.system.attributes.hp.max = specterHp;
actorData.system.attributes.ac ??= {};
actorData.system.attributes.ac.value = specterAc;
actorData.system.details ??= {};
actorData.system.details.cr = actorData.system.details.cr ?? 0;
actorData.system.details.source ??= {};
actorData.system.details.source.custom = "Soul Blade Patron";
actorData.prototypeToken ??= {};
actorData.prototypeToken.name = actorData.name;
actorData.prototypeToken.actorLink = false;
actorData.prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;

for (const item of actorData.items ?? []) {
  if (!/life drain/i.test(item.name ?? "")) continue;
  const activities = item.system?.activities ?? {};
  for (const activity of Object.values(activities)) {
    if (activity?.damage?.parts) {
      for (const part of activity.damage.parts) {
        if (typeof part === "object") {
          part.number = lifeDrainDice;
          part.denomination = 6;
          part.bonus = "";
          part.types = ["necrotic"];
        }
      }
    }
    if (activity?.attack) {
      activity.attack.bonus = String(lifeDrainAttackBonus);
    }
    activity.name = `Life Drain (${lifeDrainDice}d6 Necrotic)`;
  }
}

const specter = await Actor.create(actorData, { renderSheet: false });

let placed = false;
if (canvas.ready && canvas.scene && summonerToken) {
  const gridSize = canvas.grid?.size ?? canvas.dimensions?.size ?? 100;
  const tokenData = foundry.utils.deepClone(specter.prototypeToken.toObject());
  tokenData.actorId = specter.id;
  tokenData.actorLink = false;
  tokenData.name = specter.name;
  tokenData.x = summonerToken.document.x + gridSize;
  tokenData.y = summonerToken.document.y;
  tokenData.elevation = summonerToken.document.elevation ?? 0;
  tokenData.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
  await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
  placed = true;
}

await ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ actor: summoner, token: summonerToken?.document }),
  content: `<h2>Hexbound Specter Summoned</h2>
<p><strong>Summoner:</strong> ${summoner.name}</p>
<p><strong>Warlock Level:</strong> ${warlockLevel}</p>
<p><strong>Specter HP:</strong> ${specterHp}</p>
<p><strong>Specter AC:</strong> ${specterAc}</p>
<p><strong>Life Drain:</strong> +${lifeDrainAttackBonus} to hit, ${lifeDrainDice}d6 Necrotic damage</p>
<p>${placed ? "A token was placed beside the summoner." : "A world actor was created. Drag it to the scene when ready."}</p>`
});

ui.notifications.info(`Created ${specter.name} with ${specterHp} HP.`);
