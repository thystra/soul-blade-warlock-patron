// Apply Hexed Steel to Pact Weapon
// Adds or removes a duplicate weapon attack activity with the correct Hexed Steel damage.
// Select the Soul Blade token or assign the Soul Blade actor as your user character.

const actor = canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;

if (!actor) {
  ui.notifications.warn("Select a Soul Blade token or assign a character to your user.");
  return;
}

const warlockClass = actor.items.find((item) => {
  if (item.type !== "class") return false;
  const identifier = item.system?.identifier ?? "";
  return identifier === "warlock" || item.name.toLowerCase() === "warlock";
});

const warlockLevel = Number(warlockClass?.system?.levels ?? actor.system?.classes?.warlock?.levels ?? 0);

if (warlockLevel < 6) {
  ui.notifications.warn("Hexed Steel is available at Warlock level 6.");
  return;
}

const die = warlockLevel >= 14 ? "d12" : warlockLevel >= 10 ? "d8" : "d6";
const dieNumber = die === "d12" ? 12 : die === "d8" ? 8 : 6;

const weapons = actor.items.filter((item) => item.type === "weapon");

if (!weapons.length) {
  ui.notifications.warn(`${actor.name} has no weapon items.`);
  return;
}

const preferred = weapons.find((weapon) => /pact|longsword|long sword/i.test(weapon.name)) ?? weapons[0];
const options = weapons.map((weapon) => {
  const selected = weapon.id === preferred.id ? "selected" : "";
  return `<option value="${weapon.id}" ${selected}>${weapon.name}</option>`;
}).join("");

const content = `
<form>
  <div class="form-group">
    <label>Pact Weapon</label>
    <select name="weaponId">${options}</select>
  </div>
  <p>This adds a duplicate attack activity to the selected weapon with <strong>+1${die} Necrotic</strong> Hexed Steel damage.</p>
  <p>Older Hexed Steel duplicate attacks on the selected weapon are removed before the new one is added.</p>
</form>`;

function getActivityCollection(weapon) {
  return foundry.utils.deepClone(weapon.system?.activities ?? {});
}

function activityEntries(activities) {
  if (Array.isArray(activities)) {
    return activities.map((activity, index) => [activity._id ?? String(index), activity]);
  }
  return Object.entries(activities);
}

function setActivity(activities, id, activity) {
  if (Array.isArray(activities)) {
    const index = activities.findIndex((entry) => entry._id === id);
    if (index >= 0) activities[index] = activity;
    else activities.push(activity);
  } else {
    activities[id] = activity;
  }
}

function deleteActivity(activities, id) {
  if (Array.isArray(activities)) {
    const index = activities.findIndex((entry) => entry._id === id);
    if (index >= 0) activities.splice(index, 1);
  } else {
    delete activities[id];
  }
}

function isHexedSteelActivity(activity) {
  const name = String(activity?.name ?? "");
  const flavor = String(activity?.description?.chatFlavor ?? "");
  return name.includes("Hexed Steel") || flavor.includes("Hexed Steel");
}

async function removeHexedSteelActivities(weapon) {
  const activities = getActivityCollection(weapon);
  let removed = 0;

  for (const [id, activity] of activityEntries(activities)) {
    if (isHexedSteelActivity(activity)) {
      deleteActivity(activities, id);
      removed += 1;
    }
  }

  if (removed > 0) {
    await weapon.update({ "system.activities": activities });
  }

  return removed;
}

async function applyHexedSteel(weapon) {
  const activities = getActivityCollection(weapon);

  const attackEntries = activityEntries(activities).filter(([id, activity]) => {
    return activity?.type === "attack" && !isHexedSteelActivity(activity);
  });

  if (!attackEntries.length) {
    ui.notifications.warn(`${weapon.name} has no attack activities to duplicate.`);
    return;
  }

  for (const [id, activity] of activityEntries(activities)) {
    if (isHexedSteelActivity(activity)) deleteActivity(activities, id);
  }

  const [baseId, baseActivity] = attackEntries[0];
  const clone = foundry.utils.deepClone(baseActivity);
  const newId = foundry.utils.randomID(16);

  clone._id = newId;
  clone.name = `${baseActivity.name || weapon.name} + Hexed Steel (1${die})`;
  clone.sort = Number(baseActivity.sort ?? 0) + 1;
  clone.description = clone.description ?? {};
  clone.description.chatFlavor = `${baseActivity.description?.chatFlavor ?? ""} Hexed Steel: once per turn, add 1${die} Necrotic damage on a qualifying melee weapon hit while the target is inside your Hex Aura.`.trim();

  clone.damage = clone.damage ?? {};
  clone.damage.parts = clone.damage.parts ?? [];
  clone.damage.parts.push({
    number: 1,
    denomination: dieNumber,
    bonus: "",
    types: ["necrotic"],
    custom: {
      enabled: false,
      formula: ""
    },
    scaling: {
      mode: "",
      number: null,
      formula: ""
    }
  });

  setActivity(activities, newId, clone);
  await weapon.update({ "system.activities": activities });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<h2>Hexed Steel Applied</h2>
<p><strong>Actor:</strong> ${actor.name}</p>
<p><strong>Weapon:</strong> ${weapon.name}</p>
<p><strong>Added attack:</strong> ${clone.name}</p>
<p>The player can now choose either the normal attack or the Hexed Steel attack from the weapon item.</p>`
  });

  ui.notifications.info(`Added Hexed Steel attack to ${weapon.name}.`);
}

new Dialog({
  title: "Apply Hexed Steel to Pact Weapon",
  content,
  buttons: {
    apply: {
      label: "Apply",
      icon: '<i class="fas fa-wand-magic-sparkles"></i>',
      callback: async (html) => {
        const weaponId = html.find('[name="weaponId"]').val();
        const weapon = actor.items.get(weaponId);
        if (!weapon) {
          ui.notifications.warn("Could not find selected weapon.");
          return;
        }
        await applyHexedSteel(weapon);
      }
    },
    remove: {
      label: "Remove Existing",
      icon: '<i class="fas fa-trash"></i>',
      callback: async (html) => {
        const weaponId = html.find('[name="weaponId"]').val();
        const weapon = actor.items.get(weaponId);
        if (!weapon) {
          ui.notifications.warn("Could not find selected weapon.");
          return;
        }
        const removed = await removeHexedSteelActivities(weapon);
        ui.notifications.info(`Removed ${removed} Hexed Steel attack(s) from ${weapon.name}.`);
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "apply"
}).render(true);

