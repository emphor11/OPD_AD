import storage from './storage';

const QUEUE_KEY = 'carequeue_offline_actions';

export const offlineQueue = {
  // Add an action to the offline queue
  async enqueue(action) {
    try {
      const currentQueue = (await storage.getCache(QUEUE_KEY)) || [];
      const item = {
        ...action,
        id: `offline-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
      };
      currentQueue.push(item);
      await storage.setCache(QUEUE_KEY, currentQueue);
      console.log(`[OfflineQueue] Enqueued action (${action.type}). Total: ${currentQueue.length}`);
      return item;
    } catch (err) {
      console.error('[OfflineQueue Error] Enqueue failed:', err);
    }
  },

  // Get all pending actions
  async getQueue() {
    try {
      return (await storage.getCache(QUEUE_KEY)) || [];
    } catch (err) {
      return [];
    }
  },

  // Clear the offline queue
  async clearQueue() {
    await storage.removeCache(QUEUE_KEY);
  },

  // Process all queued offline actions when internet is restored
  async processQueue(apiClient) {
    try {
      const queue = (await storage.getCache(QUEUE_KEY)) || [];
      if (queue.length === 0) return { processed: 0 };

      console.log(`[OfflineQueue] Internet restored! Replaying ${queue.length} pending actions...`);
      let processedCount = 0;

      for (const item of queue) {
        try {
          if (item.type === 'message' && item.admissionId && item.text) {
            await apiClient.post(`/messages/${item.admissionId}`, { text: item.text });
            processedCount++;
          }
        } catch (postErr) {
          console.warn(`[OfflineQueue] Failed to replay action ${item.id}:`, postErr.message);
        }
      }

      // Empty the queue once replayed
      await storage.removeCache(QUEUE_KEY);
      console.log(`[OfflineQueue] Finished replaying ${processedCount} actions.`);
      return { processed: processedCount };
    } catch (err) {
      console.error('[OfflineQueue Error] Process queue failed:', err);
      return { processed: 0 };
    }
  },
};

export default offlineQueue;
