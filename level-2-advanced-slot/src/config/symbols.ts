import lemon from "../assets/symbols/lemon.png";
import cherry from "../assets/symbols/cherry.png";
import apple from "../assets/symbols/apple.png";
import diamond from "../assets/symbols/diamond.png";
import seven from "../assets/symbols/seven.png";

export interface SymbolConfig {

    id: string;

    image: string;

    weight: number;

}

export const SYMBOLS: SymbolConfig[] = [

     {
        id: "lemon",
        image: lemon,
        weight: 40
    },

    {
        id: "cherry",
        image: cherry,
        weight: 30
    },

    {
        id: "apple",
        image: apple,
        weight: 20
    },

    {
        id: "diamond",
        image: diamond,
        weight: 8
    },

    {
        id: "seven",
        image: seven,
        weight: 2
    }

];