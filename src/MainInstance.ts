import { Game } from "./Game";

export var GameInstance: Game | null = null;
export function createGameInstance() {
    GameInstance = new Game();
}