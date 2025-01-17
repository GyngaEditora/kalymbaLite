// Import Modules
import { KalymbaActor } from "./actor/actor.js";
import { KalymbaActorSheet } from "./actor/actor-sheet.js";
import { KalymbaItem } from "./item/item.js";
import { KalymbaItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  game.kalymbalite = {
    KalymbaActor,
    KalymbaItem,
    rollItemMacro
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  
  // Define custom Entity classes
  CONFIG.Actor.entityClass = KalymbaActor;
  CONFIG.Item.entityClass = KalymbaItem;
  CONFIG.Actor.documentClass = KalymbaActor;
  CONFIG.Item.documentClass = KalymbaItem;


  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("kalymbaLite", KalymbaActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("kalymbaLite", KalymbaItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
  
  Handlebars.registerHelper('isPickable', function(str) {
	 return (str != "Linhas Iniciais" && str != "Movimento Especial" && str != "Movimento Bônus"); 
  });
  
  Handlebars.registerHelper('eqs', function(s1, s2) {
	 return (s1 == s2); 
  });
  
  Handlebars.registerHelper('concatenate', function(s1, s2) {
	 return (s1 + s2); 
  });
});

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createkalymbaliteMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createPrincessWorldMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.kalymbalite.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "kalymbalite.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}