// server/utils/push.ts
export const sendPush = async (playerId: any, payload: any) => {
  // 1. récupérer le joueur → player.notificationSubs
  // 2. parcourir les subs → webpush.sendNotification(...)
  // Pour l'instant on log simplement :
  console.log(`📤 push to ${playerId}:`, payload.title)
}

