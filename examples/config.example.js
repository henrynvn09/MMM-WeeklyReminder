// Example configuration for MMM-WeeklyReminder
// Copy this to your ~/MagicMirror/config/config.js modules array

{
  module: 'MMM-WeeklyReminder',
  position: 'top_bar', // Can be any valid position
  config: {
    // Optional: How often to check (in milliseconds)
    updateInterval: 60 * 1000, // Every 60 seconds

    // Optional: Animation speed for transitions
    animationSpeed: 2 * 1000, // 2 seconds

    // Optional: Explicitly set timezone (null = system default)
    timezone: null, // e.g., 'America/Los_Angeles', 'Europe/London'

    // Optional: Enable debug logging
    debug: false,

    // Optional: Test mode for simulating specific day/time
    // testMode: { day: 'Tuesday', time: '15:30' },

    // Required: Array of reminder objects
    reminders: [
      // Example 1: All-day reminder
      {
        name: 'Trash Day',
        message: '🗑️ Remember to take out the trash tonight!',
        showOn: {
          day: 'Tuesday',
          allDay: true
        }
      },

      // Example 2: Time window reminder (cross-day)
      {
        name: 'Street Cleaning',
        message: '🚧 Move your car for street cleaning',
        showOn: {
          start: {
            day: 'Wednesday',
            time: '18:00' // 6:00 PM
          },
          end: {
            day: 'Thursday',
            time: '14:00' // 2:00 PM
          }
        }
      },

      // Example 3: Same-day time window
      {
        name: 'Lawn Care',
        message: '🌱 Good time to mow the lawn',
        showOn: {
          start: {
            day: 'Saturday',
            time: '08:00'
          },
          end: {
            day: 'Saturday',
            time: '12:00'
          }
        }
      },

      // Example 4: HTML formatting in message
      {
        name: 'Recycling',
        message: '<strong>♻️ Recycling Day!</strong><br/>Don\'t forget the bins',
        showOn: {
          day: 'Friday',
          allDay: true
        }
      },

      // Example 5: Morning reminder
      {
        name: 'Morning Gym',
        message: '💪 Time for your morning workout!',
        showOn: {
          start: {
            day: 'Monday',
            time: '06:00'
          },
          end: {
            day: 'Monday',
            time: '09:00'
          }
        }
      }
    ]
  }
}
