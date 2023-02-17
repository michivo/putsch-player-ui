export interface PlayerQuestStage {
    playerId: string,
    name: string,
    triggerType: string,
    triggerIds: string[],
    nonTriggerIds: string[],
    text: string,
    backupTimeSeconds: number,
    backupTextId: string,
}
