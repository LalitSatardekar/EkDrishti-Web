import { connectToDatabase } from './db.js'
import Log from '../models/Log.js'

/**
 * Log activity in the database.
 * @param {string} user operator username
 * @param {string} action action identifier
 * @param {string} resource affected resource ID or name
 * @param {string} outcome outcome ('success' or 'failure')
 * @param {string} details optional detail string
 */
export async function logActivity(user, action, resource, outcome, details = '', severity = 'INFO', request_id = null, duration = null) {
  try {
    await connectToDatabase()
    await Log.create({
      user: user || 'system',
      action,
      resource: resource || 'N/A',
      outcome,
      details,
      severity,
      request_id,
      duration
    })
  } catch (error) {
    console.error('Audit Logger failed to save entry:', error)
  }
}
