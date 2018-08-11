# idea

```javascript
// kapua - clouds

const kapua = require('kapua')('https://api.example.com/api');

const users = kapua('users', /* can pass a schema object here */);
await users.get(1); //return user with id of 1  url users/1
await users.getAll(); // get all users /users
users.save({} /*user object */); // calls POST '/users' if no id, patch or put if id
users.delete(1); // deletes user at that id by calling delete /users/id

// object from client, not pur JSON
const user = await users.get(1);

user.get('name'); // returns the name value
user.name; //returns name value if the object has that property

const newUser = users.get(); // returns new object
newUser.name = 'Bob';
```
