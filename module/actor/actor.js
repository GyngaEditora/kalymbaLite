/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class KalymbaActor extends Actor {

	/**
	* Augment the basic actor data with additional dynamic data.
	*/
	prepareData() {
		super.prepareData();

		const data = this.system;

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.
		console.log(this);
		
		this.prepareCharData(data)
		if(data.type == "actor"){
			this.prepareActorData();
		}
	}
	
	prepareCharData(data){
		let armorDef = 0;
		//Compute Defense
		let items = this.items.entries();
		for (let a of items){
			let armor = a[1];
			let aData = armor.system;
			if(armor.type == "armadura"){
				console.log(armor)
				armorDef = armorDef + Number(aData.protecao);
			}
		}
				
		let attrs = data.atributos;
		for (let a in attrs){
			let attr = attrs[a];
			attr.total = attr.base + attr.bonus;
		}
				
		let skills = data.pericias;
		for (let ss in skills){
			let skillSet = skills[ss];
			for(let s in skillSet){
				let skill = skillSet[s];
				skill.total = skill.nivel + skill.bonus;
			}
		}
		
		data.pontosDeVida.max = 15 + attrs.vigor.total * 3;
		data.pontosDeVida.total = data.pontosDeVida.max + data.pontosDeVida.modificador;
		data.poderMagico = attrs.intelecto.total + attrs.ginga.total + attrs.ori.total;
		data.axe.max = attrs.ori.total * 3;
		
	}

}