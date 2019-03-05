# FireBase Secondary
This project branch contains the firebase code required to deploy our website to their server. 
Below will be listed the important things to keep in mind when dealing with firebase. Any further questions
message the group. 

## Usage
```
- firebase serve     [ allows you to host the website through your pc] 
- firebase deploy     [deploys to the server ]
- firebase init       [ shouldn't be used, but allows to initialise a new project folder ]
- firebase init functions  [ used to init funcitons folder, may be usefull when creating similar database ]

```

## How To Get Started
```
- you must have npm, and firebase installed locally
- firebase login      [use our project google account and password
- firebase list       [will list all the projects linked to that account, that have been set up through online]
- firebase serve/deploy   [once you've made all the changes just test it out or deploy to server]
```

# What to Keep In Mind
> The firebase code has been assembled so that it resembles the old server which was previously used.
The functions folder is the dynamic part of the webpage. It will contain the equivalent of app.js, routes folder,
and the .hbs files. 
###### It's _NOT_ reccommended for you to touch the index.js in the functions folder, this is where the engine is and shouldn't be touched. 
 * _Instead_ use the routes for any page requests, but don't forget to link it in the index.js that has the engine. 
 * If you have _any_ linking issues, that cannot be resolved, message the group.
 
 ## Note to the User:
 When downloading the branch, you may come across issues. 
 * firebase module not found, _solution_ uninstall and install firebase
 ```
 cd functions
 npm uninstall firebase
 npm install firebase
 ```
 * Adminsdk.json, _solution_ there is a special json file ask in group chat for that file. Otherwise application won't work. This is required in the routes folder
 * cookie-parser
 ```
 cd functions
 npm install cookie-parser
 ```
  > If all else fails cry in a corner and ask group chat for help :) 
