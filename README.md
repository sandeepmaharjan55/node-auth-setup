## node-auth-setup

- This project is in NodeJs(Express) as back-end.

## To setup in local

### Step

- Go to root folder of back-end and install yarn

```
yarn install
```

## Setup Mongoose string

- Add db connection string in config/dev and config/prod as per requirement for Production or Development

### config/dev

```
MONGODB_URI:
    "mongodb://localhost:{portNo}/<database name>",
```

### config/prod

```
MONGODB_URI:
    "mongodb://localhost:{portNo}/<database name>",
```

### Create .env file in root folder

- add these strings in .env file

```
NODE_ENV='<production>/<development>'
JWT_SECRET='<SecretCode>'
MONGO_DB_URL='<url of mongo connection>'
```

## After the above all setup

- Run the project

### In root folder

- For database connection to {portNo} and start server

```
yarn start
Or
npm start server.js
```
## Congratulations!! Happy Coding!!

### Show your support

Give a ⭐ if you like this!

<a href="https://www.buymeacoffee.com/sandeepmaharjan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" height= "60px" width= "217px" ></a>
