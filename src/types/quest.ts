export interface PlayerQuestStage {
    playerId: string,
    name: string,
    triggerType: string,
    triggerIds: string[],
    text: string,
    backupTimeSeconds: number,
    backupTextId: string,
    stageIndex: number,
    questId: string,
}
