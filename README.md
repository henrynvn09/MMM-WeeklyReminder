# Module: MMM-WeeklyReminder

MMM-WeeklyReminder is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that displays recurring weekly reminders based on day and time schedules. Perfect for trash day, street cleaning, lawn care, and any other weekly recurring tasks you need to remember.

![Example Screenshot](screenshot.png)

## Features

- 🗓️ **Recurring Weekly Schedules** - Set reminders for specific days and times each week
- ⏰ **Flexible Time Windows** - Support for all-day reminders or specific time ranges
- 🌉 **Cross-Day Support** - Time windows can span across days (e.g., Wednesday 6 PM - Thursday 2 PM)
- 📚 **Multiple Reminders** - Display multiple active reminders stacked vertically
- 🎨 **HTML Support** - Use emojis, formatting, and custom HTML in your reminder messages
- 🐛 **Debug Mode** - Built-in debugging for troubleshooting schedules
- 🧪 **Test Mode** - Simulate specific days/times to verify your reminder schedules
- 🚀 **Zero Dependencies** - No external API calls or additional modules required

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/dathbe/MMM-WeeklyReminder
```

No additional dependencies needed!

## Configuration

Add the module to your `~/MagicMirror/config/config.js` file:

```js
{
  module: 'MMM-WeeklyReminder',
  position: 'top_bar',
  config: {
    reminders: [
      {
        name: 'Trash Day',
        message: '🗑️ Remember to take out the trash tonight!',
        showOn: {
          day: 'Tuesday',
          allDay: true
        }
      },
      {
        name: 'Street Cleaning',
        message: '🚧 Move your car for street cleaning',
        showOn: {
          start: {
            day: 'Wednesday',
            time: '18:00'
          },
          end: {
            day: 'Thursday',
            time: '14:00'
          }
        }
      }
    ]
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `updateInterval` | `number` | `60000` | How often to check reminders (in milliseconds). Default is 60 seconds. |
| `animationSpeed` | `number` | `2000` | Speed of transition animations (in milliseconds) when reminders appear/disappear. |
| `timezone` | `string` | `null` | Timezone for schedule calculations. If `null`, uses system timezone. Example: `'America/Los_Angeles'` |
| `reminders` | `Array` | `[]` | Array of reminder objects (see below) |
| `debug` | `boolean` | `false` | Enable debug logging to console for troubleshooting |
| `testMode` | `Object` | `null` | Test mode configuration: `{ day: 'Tuesday', time: '15:30' }` to simulate a specific day/time |

### Reminder Object Structure

Each reminder object has the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique name for the reminder (used for debugging) |
| `message` | `string` | Yes | Message to display (supports HTML) |
| `showOn` | `Object` | Yes | When to show the reminder (see formats below) |

### ShowOn Formats

**All-Day Reminder:**
```js
showOn: {
  day: 'Tuesday',  // Day name
  allDay: true     // Show for entire day (00:00 - 23:59)
}
```

**Time Window Reminder:**
```js
showOn: {
  start: {
    day: 'Wednesday',  // Start day
    time: '18:00'      // Start time (24-hour format HH:MM)
  },
  end: {
    day: 'Thursday',   // End day (can be same or different)
    time: '14:00'      // End time (24-hour format HH:MM)
  }
}
```

**Valid Day Names:** `'Sunday'`, `'Monday'`, `'Tuesday'`, `'Wednesday'`, `'Thursday'`, `'Friday'`, `'Saturday'`

**Time Format:** 24-hour format `'HH:MM'` (e.g., `'09:00'`, `'18:30'`, `'23:45'`)

## Examples

### Trash & Recycling Schedule
```js
reminders: [
  {
    name: 'Trash Day',
    message: '🗑️ Take out trash tonight',
    showOn: { day: 'Tuesday', allDay: true }
  },
  {
    name: 'Recycling Day',
    message: '♻️ Take out recycling tonight',
    showOn: { day: 'Thursday', allDay: true }
  }
]
```

### Lawn Care Reminder
```js
reminders: [
  {
    name: 'Mow Lawn',
    message: '🌱 Don\'t forget to mow the lawn this weekend',
    showOn: {
      start: { day: 'Saturday', time: '08:00' },
      end: { day: 'Saturday', time: '20:00' }
    }
  }
]
```

### Work-from-Home Days
```js
reminders: [
  {
    name: 'WFH Tuesday',
    message: '💼 Working from home today',
    showOn: {
      start: { day: 'Tuesday', time: '06:00' },
      end: { day: 'Tuesday', time: '18:00' }
    }
  }
]
```

### Street Cleaning (Cross-Day Example)
```js
reminders: [
  {
    name: 'Trash Reminder',
    message: '🗑️ <strong>Trash pickup tomorrow!</strong> Take bins to curb',
    showOn: { day: 'Tuesday', allDay: true }
  },
  {
    name: 'Street Cleaning',
    message: '🚧 Street cleaning in progress - car must be moved',
    showOn: {
      start: { day: 'Wednesday', time: '18:00' },
      end: { day: 'Thursday', time: '14:00' }
    }
  }
]
```

## Troubleshooting

### Reminders not showing up

1. **Enable debug mode:**
   ```js
   config: {
     debug: true,
     reminders: [...]
   }
   ```

2. **Check the console/logs:**
   - Open browser console (F12) or check `pm2 logs MagicMirror`
   - Look for validation warnings about your reminder configuration
   - Verify the scheduler is checking at the expected times

3. **Verify time format:**
   - Times must be in 24-hour format: `'18:00'` not `'6:00 PM'`
   - Times must have leading zeros: `'09:00'` not `'9:00'`

4. **Check day names:**
   - Day names must be capitalized: `'Tuesday'` not `'tuesday'`
   - Day names must be full: `'Wednesday'` not `'Wed'`

### Testing your reminders

Use test mode to simulate a specific day and time:

```js
config: {
  testMode: {
    day: 'Tuesday',
    time: '15:30'
  },
  debug: true, // Recommended with testMode
  reminders: [...]
}
```

This will simulate the specified day and time, allowing you to verify your reminder schedules without waiting for the actual day/time.

### Module not updating

- Check `updateInterval` - default is 60 seconds
- Verify the module hasn't been suspended/hidden
- Check for JavaScript errors in console

### Timezone issues

- Explicitly set timezone in config if system timezone is incorrect
- Use standard timezone names (e.g., `'America/New_York'`, `'Europe/London'`)

## Styling

You can customize the appearance by adding rules to `~/MagicMirror/css/custom.css`:

```css
/* Change reminder background */
.MMM-WeeklyReminder .reminder-item {
  background-color: rgba(52, 152, 219, 0.3);
  border-left-color: #3498db;
}

/* Increase spacing between reminders */
.MMM-WeeklyReminder .weekly-reminder-container {
  gap: 15px;
}

/* Different style for specific reminder */
.MMM-WeeklyReminder .reminder-item[data-reminder-name="Trash Day"] {
  border-left-color: #27ae60;
}
```

## Contributing

Issues and pull requests are welcome! Please open a [GitHub issue](https://github.com/dathbe/MMM-WeeklyReminder/issues) for bugs or feature requests.

### Development

```bash
cd ~/MagicMirror/modules/MMM-WeeklyReminder
npm install          # Install dev dependencies
npm run lint         # Run linting
npm run lint:fix     # Fix automatically fixable issues
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Credits

Originally based on [MMM-CustomMessage](https://github.com/jpcaldwell30/MMM-CustomMessage) by jpcaldwell30 and [MMM-CustomText](https://github.com/dathbe/MMM-CustomText) by dathbe.
