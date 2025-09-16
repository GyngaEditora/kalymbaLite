/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class KalymbaActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["kalymbaLite", "sheet", "actor"],
      template: "systems/kalymbaLite/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  
  async getData(options) {
    const data = await super.getData(options);
    data.notas = await TextEditor.enrichHTML(this.object.system.notas, {async: true});
    return data;
  }

  /* -------------------------------------------- */

  /** @override /
  getData() {
    const data = super.getData();

    return data;
  }
  //**/

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
	
	//Create Craft
    html.find('.create-craft').click(this._onCreateCraft.bind(this));

    // Rollable abilities.
    html.find('.skill-rollable').click(this._onSkillRoll.bind(this));
    html.find('.item-rollable').click(this._onItemRoll.bind(this));
    html.find('.item-equip').click(this._onEquip.bind(this));
	
	// Items
	html.find('.item-create').click(this._onItemCreate.bind(this));
	html.find('.item-edit').click(this._onItemEdit.bind(this));
	html.find('.item-delete').click(this._onItemDelete.bind(this));
  }

	/**
	* Handle clickable rolls.
	* @param {Event} event   The originating click event
	* @private
	*/
	_onSkillRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let skillValue = element.getAttribute("skill");
		let supAttr = element.getAttribute("attr");
	
		let type = -1;

		new Dialog({
			title: "Adicione os Bonus",
			content: `
			 <form>
			  <div>
			   <div>
				<label>Bonus:</label>
				<input type="text" name="bonus"/>
				<label>Vantagens:</label>
				<input type="number" name="vantagens" value="0"/>
				<label>Desvantagens:</label>
				<input type="number" name="desvantagens" value="0"/>
			   </div>
			  </div>
			 </form>
			 `,
			buttons: {
				normal : {
					icon: '<i class="fas fa-check"></i>',
					label: "Rola",
					callback: () => type = 1
				},
				no : {
					icon: '<i class="fas fa-times"></i>',
					label: "Não Rola",
					callback: () => type = -1
				}
			},
			default: "no",
			close: html => {
				let dices = 2;
				let plus = html.find('[name=vantagens]')[0].value;
				let minus = html.find('[name=desvantagens]')[0].value;
				let diceModifier = plus - minus;
				let diceRoll = "2d6";
				
				if(diceModifier > 0){
					dices = dices + diceModifier;
					diceRoll = dices + "d6kh2";
				} else if (diceModifier < 0){
					dices = dices - diceModifier;
					diceRoll = dices + "d6kl2";
				}
				
				if(type > -1){
					let bonus = html.find('[name=bonus]')[0].value;
					let formulae = diceRoll + " + " + skillValue + " + @atributos." + supAttr + ".total";
					
					if(bonus != null && bonus != ""){
						formulae = formulae + " + " + bonus;
					}
					
					this.displayRoll(formulae, "Rolando perícia " + element.innerHTML)
				}
			}
		}).render(true);
	}
	
	_onEquip(event) {
		const element = event.currentTarget;
		const dataset = element.dataset;
		let item_id = element.getAttribute("item_id");
		
		let item = this.actor.items.get(item_id);
		console.log(item);
		let iData = item.system;
		
		if (item.type == "arma" || item.type == "armadura"){
			item.update({"system.equipada": !iData.equipada});
		}
	}
  /* -------------------------------------------- */

	/**
	* Handle clickable rolls.
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let attr = element.getAttribute("roll");
	
		let confirmed = false;

		new Dialog({
			title: "Adicione os Bonus",
			content: `
			 <form>
			  <div>
			   <div>
				<label>Bonus:</label>
				<input type="text" name="bonus"/>
			   </div>
			 </form>
			 `,
			buttons: {
				yes : {
					icon: '<i class="fas fa-check"></i>',
					label: "Rola",
					callback: () => confirmed = true
				},
				no : {
					icon: '<i class="fas fa-times"></i>',
					label: "Não Rola",
					callback: () => confirmed = false
				}
			},
			default: "no",
			close: html => {
				if(confirmed){	
					let bonus = html.find('[name=bonus]')[0].value;

					let formulae = attr;
						
					if(bonus != null && bonus != ""){
						formulae = formulae + " + " + bonus;
					}
					
					this.displayRoll(formulae, "Rolando dano de: " + element.innerHTML)
				}
			}
		}).render(true);
	}
	
	async displayRoll(formulae, label){
		let roll = new Roll(formulae, this.actor.system);
		console.log(formulae);
		//await roll.roll({"async": false});
		await roll.evaluate();
		if(roll.terms[0].total == 12){
			label = label + "<br />\n" +
				"<span style=\"font-size: 24px; font-style: bold; color:blue;\">ACERTO CRÍTICO</span>"
		}
		if(roll.terms[0].total == 2){
			label = label + "<br />\n" +
				"<span style=\"font-size: 24px; font-style: bold; color:red;\">ERRO CRÍTICO</span>"
		}
		roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: label
		});
	}
  
	/**
	* Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemCreate(event) {
		//event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let type = element.getAttribute("type");
		
		const itemData = {
			"name": type,
			"type": type
		};
		Item.create(itemData, {parent: this.actor});
	}
	
	_onItemEdit(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.actor.items.get(item_id);
		item.sheet.render(true);
	}
	
	_onItemDelete(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.actor.items.get(item_id);
		item.delete();
	}
	
	async _onCreateCraft(event) {
		//event.preventDefault();
		let confirmed = false;
		let formContent = "<form>" +
			"<div>" +
				"<div style=\"padding-bottom: 20px\">" +
					"<label>Nome:</label>" +
					"<input type=\"text\" name=\"attrName\" id=\"attrName\">" +
				"</div>" +
				"<div style=\"padding-bottom: 20px\">" +
					"<label>Atributo:</label>" +
					"<select id=\"attr\" name=\"attr\">" +
						"<option value=\"forca\">" + game.i18n.localize("atributos.abreviado.forca") + "</option>" +
						"<option value=\"agilidade\">" + game.i18n.localize("atributos.abreviado.agilidade") + "</option>" +
						"<option value=\"vigor\">" + game.i18n.localize("atributos.abreviado.vigor") + "</option>" +
						"<option value=\"intelecto\">" + game.i18n.localize("atributos.abreviado.intelecto") + "</option>" +
						"<option value=\"ginga\">" + game.i18n.localize("atributos.abreviado.ginga") + "</option>" +
						"<option value=\"ori\">" + game.i18n.localize("atributos.abreviado.ori") + "</option>" +
					"</select>" +
				"</div>" +
			"</div>" +
		"</form>";
		
		new Dialog({
			title: "Criando Ofício",
			content: formContent,
			buttons: {
				one: {
					icon: '<i class="fas fa-check"></i>',
					label: "Vai!",
					callback: () => confirmed = true
				},
				two: {
					icon: '<i class="fas fa-times"></i>',
					label: "Não vai",
					callback: () => confirmed = false
				}
			},
			default: "Cancel",
			close: html => {
				if (confirmed) {
					let attrName = html.find('[name=attrName]')[0].value;
					let attr = html.find('[name=attr]')[0].value;
					let actorData = this.actor.system;
					let fullAttrName = "system.pericias.oficios" + attrName;
					actorData.pericias.oficios[attrName] = {
						"nivel": 0,
						"bonus": 0,
						"atributo": attr
					};
					
					this.actor.update(
						{
							 "system.pericias": actorData.pericias
						}
					)
				}
			}
		}).render(true);	  
	}

}
