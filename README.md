for mysql development environemnt
docker pull mysql:latest

docker run --name ai-generator -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=ai-generator -d mysql:latest

npm install prisma --save-dev
npm install @prisma/client  
npx prisma init --datasource-provider mysql

2. Run prisma db pull to turn your database schema into a Prisma schema.
   -This step is only needed if you have an existing db, and need to turn it into a Prisma schema.
   To create a new one use

- npx prisma db push

3. Run prisma generate to generate the Prisma Client. You can then start querying your database.
   -npx prisma generate
   this is needed to generate the prisma client, which is used to query the database. It is only when we've made changes to the schema.prisma after initial setup. our "db.ts" file initializes and manages teh Prisma Client instance in our app.
   - generate generates the necessary code for Prisma Client inside node_modules/@prisma/client.

need for next auth
npm install @next-auth/prisma-adapter
