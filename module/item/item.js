/**	
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class KalymbaItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    //const itemData = this.data;
    //const actorData = this.actor ? this.actor.data : {};
    //const data = itemData.data;

	//console.log(this);
	//Make sure itens are able to receive sub-itens
	
  }
}
