const express = require('express')
const app = express()
const axios = require('axios')
const PORT = process.env.PORT || 9000
require('dotenv').config()

const {google} = require('googleapis');

const calendar = google.calendar({
  version: 'v3',
  auth: 'AIzaSyAGi6WHQlYL6RSQNgpXxtZzqsBU2BFBtIg'
})

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUR_CLIENT_ID,
    process.env.YOUR_CLIENT_SECRET,
    process.env.YOUR_REDIRECT_URL
  );

const people = google.people({ version: 'v1', auth: oauth2Client });




let REFRESH_TOKEN = '1//0gch2kfOrE_s7CgYIARAAGBASNwF-L9Ir7WDclt_84IW6Re73UvovudCzj1WgMVOVwEqdu0hswHtA0SjHzvl0uI5L3eOU2DjTaoc'

app.get('/', (req, res) => res.send('it is working now'))

app.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        scope: "https://www.googleapis.com/auth/calendar"
      });
      res.redirect(url)
})

app.get("/google/redirect", async (req, res) => {
  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);

  console.log('GET TOKEN HERE', tokens.refresh_token)
  oauth2Client.setCredentials({refresh_token:tokens.refresh_token});
//   oauth2Client.setCredentials({refresh_token: tokens.refresh_token});
  res.send({
    message:"You are logged In"
  })
});

app.get('/event', async (req, res) => {// Refresh the access token if needed
    oauth2Client.setCredentials({refresh_token:REFRESH_TOKEN});
    var event = {
        'summary': 'Meeting with saurav',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
          'dateTime': '2024-01-28T09:00:00-07:00',
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'dateTime': '2024-01-29T17:00:00-07:00',
          'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
          'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
          {'email': 'lpage@example.com'},
          {'email': 'sbrin@example.com'},
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
          ],
        },
      };
      
      calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.htmlLink);
      });
});

app.get('/list', async (req, res) => {
    oauth2Client.setCredentials({refresh_token:REFRESH_TOKEN});

try {
    const response = await calendar.events.list({
        calendarId: 'primary', // Use the appropriate calendar ID
        timeMin: new Date().toISOString(),
        maxResults: 10, // Adjust the number of events you want to retrieve
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response;
      res.send(events)
      console.log('Events:', events);
} catch (error) {
    
}
})







app.listen(PORT, () => {
    console.log('App is started at PORT', PORT)
})