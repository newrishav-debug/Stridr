/**
 * File: src/services/LogService.ts
 * Purpose: Handles logging of application events and errors to a local file.
 * Created: 2026-01-15
 * Author: AI Assistant
 */

import * as FileSystem from 'expo-file-system/legacy';

const LOG_FILE_URI = FileSystem.documentDirectory + 'app_logs.txt';
const MAX_LOG_SIZE = 500 * 1024; // 500KB

class LogService {
    /**
     * Appends a message to the log file.
     * @param level - The severity level (INFO, WARN, ERROR)
     * @param message - The main log message
     * @param data - Optional extra data to log
     */
    async log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
        const timestamp = new Date().toISOString();
        let logEntry = `[${timestamp}] [${level}] ${message}`;

        if (data) {
            try {
                const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
                logEntry += ` - ${dataString}`;
            } catch (e) {
                logEntry += ` - [Data Serialization Error]`;
            }
        }
        logEntry += '\n';

        try {
            // Check file size and rotate if necessary (simple deletion for now)
            const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_URI);
            if (fileInfo.exists && fileInfo.size > MAX_LOG_SIZE) {
                // If log is too big, delete it and start fresh (simplest rotation)
                // In a production app, you might want to rename it to .bak
                await FileSystem.deleteAsync(LOG_FILE_URI);
                logEntry = `[${timestamp}] [INFO] Log rotated\n` + logEntry;
            }

            if (!fileInfo.exists) {
                await FileSystem.writeAsStringAsync(LOG_FILE_URI, logEntry);
            } else {
                // Using append mode if supported, unfortunately expo-file-system writeAsStringAsync
                // doesn't support append directly in the options for all platforms comfortably in earlier versions,
                // BUT current expo-file-system documentation says generic writeAsStringAsync overwrites.
                // We should use read -> append -> write or a native append if available.
                // Actually, expo-file-system DOES NOT have a simple "append" method for string.
                // We have to read and write back, which is slow for logs.
                // HOWEVER, assuming low frequency logs for this app (user actions, errors), it might be okay.
                // A better approach for frequent logging is usually a native module or just keeping recent logs in memory
                // and flushing occasionally.

                // Let's optimize: Read existing content only if we are crashing? No, we need persistent logs.
                // Let's try to just append by reading previous. 
                // WARNING: Reading 500KB string every log is bad. 
                // Alternative: Use multiple small files?

                // Correction: `FileSystem.writeAsStringAsync` does not support append.
                // BUT we can use `StorageAccessFramework`? No, too complex.

                // For this request, maybe we should keep a "session log" in memory and write it to file periodically or on error?
                // Or just accept the performance hit for now as it's a requested feature.
                // Wait, checked docs: there is no direct append.
                // We will use a simple in-memory buffer and flush to file every N logs or on app background?
                // Or just keep the last N logs in memory array and write them all when "Report" is clicked?
                // The user wants "report crash with logs". If the app crashes, memory logs are lost unless we wrote them.

                // Let's look for a better way. 
                // Actually, we can just read the file, append, and write. `readAsStringAsync` + `writeAsStringAsync`.
                // It's not atomic and slow, but functional for a prototype.

                const currentContent = await FileSystem.readAsStringAsync(LOG_FILE_URI).catch(() => '');
                await FileSystem.writeAsStringAsync(LOG_FILE_URI, currentContent + logEntry);
            }

            // Also log to console for development
            console.log(`[LogService] ${level}: ${message}`, data || '');

        } catch (error) {
            console.error('Failed to write log:', error);
        }
    }

    async info(message: string, data?: any) {
        return this.log('INFO', message, data);
    }

    async warn(message: string, data?: any) {
        return this.log('WARN', message, data);
    }

    async error(message: string, error?: any) {
        // Extract useful info from Error object
        let errorData = error;
        if (error instanceof Error) {
            errorData = {
                message: error.message,
                stack: error.stack,
            };
        }
        return this.log('ERROR', message, errorData);
    }

    /**
     * Returns the URI of the log file.
     */
    getLogFileUri() {
        return LOG_FILE_URI;
    }

    /**
     * Reads the log file content.
     */
    async getLogContent() {
        try {
            const info = await FileSystem.getInfoAsync(LOG_FILE_URI);
            if (!info.exists) return '';
            return await FileSystem.readAsStringAsync(LOG_FILE_URI);
        } catch (error) {
            console.error('Failed to read logs:', error);
            return '';
        }
    }

    /**
     * Deletes the log file.
     */
    async clearLogs() {
        try {
            await FileSystem.deleteAsync(LOG_FILE_URI, { idempotent: true });
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
}

export const logger = new LogService();
