Prerequisites:
    - NodeJs
    - Postgresql

Starting the server:
    (Other than the first time running this, step 1 may be skipped).
    1- Setting up the database: 
        - login to postgresql as a superuser .
        - verify that there is no existing user with the name `website` (use `\du` to list all users).
        - verify that there is no existing database with the name `florist` (use `\l` to list all databases).
        - run the `db.sql` script in the psql commandline with `\i db.sql`.
    2- use `npm run start` to boot up the server.
    3- go to `http://localhost:5050/`.

Note 1:
    - The port can be changed in the .env file (variable `PORT`).
    - The variable `SecretKey` in the .env file is used to generate the jsonwebtokens that handle authorizations.

Note 2: 
    - J'ai fait le truc do zoom avec les images des fleurs au lieu des bouquets.
    - I did the zoom thing on hover with the flowers instead of bouquets, as those are static and making new pictures
        for custom bouquets didn't make sense.

Note 3:
    - I could've split the routes for customers and employees in seperate files but i was lazy.
    - I do now know how to make the sorting stuff with jQuery, i would appreciate any advice on how to do so.

Note 4:
    - Please try going easy on us with the final project, we are exhausted, Thank you!
    - Sorry for typing all this in English, i was in a hurry and my french isn't good enough to express myself fully.