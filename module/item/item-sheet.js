/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

import { KalymbaItem } from "./item.js";
export class KalymbaItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["kalymbaLite", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/kalymbaLite/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();
    data.Descricao = await TextEditor.enrichHTML(this.object.system.Descricao, {async: true});
	
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Roll handlers, click handlers, etc. would go here.
	
		// Items
		html.find('.item-create').click(this._onItemCreate.bind(this));
		html.find('.item-edit').click(this._onItemEdit.bind(this));
		html.find('.item-delete').click(this._onItemDelete.bind(this));
		
		//console.log(html.find('.items-list'));
		//html.find('.items-list').mouseup(this._onMouseUp.bind(this));
		//html.find('.items-list').on("drop", this._onMouseUp.bind(this));
	}
  
	/**
	* Handle creating a new Owned Item for the item using initial data defined in the HTML dataset
	* @param {Event} event   The originating click event
	* @private
	*/
	async _onItemCreate(event) {
		//event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let type = element.getAttribute("type");
		
		const itemData = {
			"name": type,
			"type": type,
		};
		
		let item = await KalymbaItem.create(itemData);
	}
	
	/** @override */
	async _onDropItemCreate(itemData) {
		let item = await KalymbaItem.create(itemData);
	}
	
	_onItemEdit(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.item.system.movimentos[item_id];
		if(item != null){
			item.sheet.render(true);
		}
	}	
	
	async _onItemDelete(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.item.system.movimentos[item_id];
		
		if(item != null){
			item.delete();
		}
	}
}
