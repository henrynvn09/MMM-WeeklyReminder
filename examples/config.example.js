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

    // Optional: Holiday definitions for exclusion
    holidays: [
      // US Federal Holidays (all 11)
      { type: 'fixed', month: 1, day: 1, name: 'New Year\'s Day' },
      { type: 'nthWeekday', month: 1, weekday: 1, nth: 3, name: 'Martin Luther King Jr. Day' },
      { type: 'nthWeekday', month: 2, weekday: 1, nth: 3, name: 'Presidents\' Day' },
      { type: 'nthWeekday', month: 5, weekday: 1, nth: -1, name: 'Memorial Day' },
      { type: 'fixed', month: 6, day: 19, name: 'Juneteenth' },
      { type: 'fixed', month: 7, day: 4, name: 'Independence Day' },
      { type: 'nthWeekday', month: 9, weekday: 1, nth: 1, name: 'Labor Day' },
      { type: 'nthWeekday', month: 10, weekday: 1, nth: 2, name: 'Columbus Day' },
      { type: 'fixed', month: 11, day: 11, name: 'Veterans Day' },
      { type: 'nthWeekday', month: 11, weekday: 4, nth: 4, name: 'Thanksgiving' },
      { type: 'fixed', month: 12, day: 25, name: 'Christmas Day' },

      // Optional: Add custom holidays
      // { type: 'date', date: '2026-07-03', name: 'Independence Day (Observed)' },
      // { type: 'fixed', month: 3, day: 2, name: 'Texas Independence Day' },
    ],

    // Required: Array of reminder objects
    reminders: [
      // Example 1: All-day reminder with holiday exclusion
      {
        name: 'Trash Day',
        message: '🗑️ Remember to take out the trash tonight!',
        showOn: {
          day: 'Tuesday',
          allDay: true
        },
        excludeHolidays: true,  // Don't show if pickup is cancelled
        eventDay: 'Wednesday'   // Actual pickup is Wednesday
      },

      // Example 2: Time window reminder with holiday exclusion (cross-day)
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
        },
        excludeHolidays: true,  // Don't show if cleaning is cancelled
        eventDay: 'Thursday'    // Cleaning happens Thursday
      },

      // Example 3: Same-day time window (no holiday exclusion)
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
        },
        excludeHolidays: true,
        eventDay: 'Saturday'  // Pickup is Saturday morning
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
