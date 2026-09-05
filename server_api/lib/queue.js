import { logActivity } from './log.js'

/**
 * Stateless Background Job Queue Abstraction
 * Asynchronously processes non-blocking tasks. Easily pluggable to Redis/BullMQ.
 */
export async function enqueue(jobName, payload, processFn) {
  console.log(`[Queue] Enqueued Job: "${jobName}" at ${new Date().toISOString()}`)
  
  // Non-blocking background worker trigger
  setTimeout(async () => {
    try {
      console.log(`[Queue] Processing Job: "${jobName}"...`)
      const startTime = Date.now()
      
      await processFn(payload)
      
      const elapsed = Date.now() - startTime
      console.log(`[Queue] Job completed successfully: "${jobName}" in ${elapsed}ms`)
      
      // Log successful task outcome in system activity timeline
      await logActivity(
        'system-queue', 
        'job-success', 
        jobName, 
        'success', 
        `Job execution completed in ${elapsed}ms. Payload: ${JSON.stringify(payload).substring(0, 120)}`
      )
    } catch (err) {
      console.error(`[Queue] Job execution failed for "${jobName}":`, err)
      
      // Log failed task error
      await logActivity(
        'system-queue', 
        'job-failure', 
        jobName, 
        'failure', 
        `Error: ${err.message || 'Unknown queue error'}`
      )
    }
  }, 0)
}
