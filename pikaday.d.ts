/** TypeScript declration to make this usable in other TypeScript based projects */

interface PikadayInterface{
	new (option: any): void;
}

declare var Pikaday: PikadayInterface;
