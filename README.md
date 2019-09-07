# Setup

The project consists of 2 separate node packages. These are the `front-end` and `back-end` folder

### 1) Prerequisites
- You must have node installed on your system
- You must have a MongoDB server running on your system on the default port (27017)

### 2)Install dependencies in the back-end and front-end folder

from the project root
```
cd back-end
npm i
```

from the project root
```
cd front-end
npm i
```

### 3) Setting configuration values 

You will need to set up back-end configuration before you can test lobbies locally.

You need an osu! API key to be able to create tournaments since it fetches beatmaps from the osu API. Go to https://osu.ppy.sh/p/api to get an API key

Optional: If you want to test logging in with your osu! account locally you will need to create an osu oAuth client following this guide: https://github.com/int-and-his-friends/osu-api-v2/wiki/OAuth-clients (this is the minimum required for lobby creation, since it fetches beatmaps from the osu API). Note: this is NOT the same as the osu api key. This is for the login flow (not for lobby creation).

- Create a new file at `back-end/development.yml`. Leave out optional parameters if you don't need them.
```
OSU_API_KEY: your osu api key obtained from osu.ppy.sh
OSU_OAUTH_ID: (optional) your osu oAuth ID
OSU_OAUTH_SECRET: (optional) your osu oAuth secret
OSU_OAUTH_REDIRECT: (optional) your osu oAuth secret
TWITCH_CLIENT_ID: (optional) your twich oAuth ID if you want to test twitch integration
TWITCH_SECRET: (optional) twich oAuth client secret
TWITCH_REDIRECT: (optional) twitch oAuth redirect URL
```

Note: any other configuration values set in `back-end/default.yml` can be overwritten in `back-end/development.yml` if you want.

# Running the project
Assuming you have set up the config, you can now run the site locally:

- Open up two terminals, one in the front-end folder, and the other in the back-end folder
- run `npm start` in both the terminals
- Note: the back-end project will run 2 separate processes called 'API' and 'SOC'. These are named rather randomly, but the SOC process is concerned with the majority of the I/O for users, and the API process is concerned with the processing of lobbies.

You should now have 2 processes running. You can now go to localhost:4200 in your browser and test the website locally.

For testing purposes, there is an 'admin logon' feature which is used to display admin commands on the front-end. Activate them by executing some commands in the chrome console while on the website:

Google chrome console:
```
window.adminLogon('asd123') // (default admin password)
```

After entering this javascript command, you can refresh the page to see the 'admin' button on the lobbies page. This allows you to run testing commands such as clearing the database, toggling lobby auto-creation, and skipping the round.

