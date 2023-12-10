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

Business Logic:

Course > Unit > Chapters

npx prisma db push to push schema changes

#ForwardRefs
Creating Refs in Parent Component: In ConfirmChapters, you create a ref for each ChapterCard using React.useRef. These refs are stored in chapterRefs, keyed by chapter ID.

Passing Refs to Child Components: You pass these refs to the corresponding ChapterCard components. This is done by setting the ref prop on each ChapterCard in your map function.

Defining Functions in Child Component: Inside ChapterCard, you use React.useImperativeHandle to bind a triggerLoad function to each ref. This function, when called, will perform specific actions defined within ChapterCard (in your current code, it logs a message to the console, but it's meant to make an API call).

Triggering Functions from Parent Component: Back in ConfirmChapters, when the "Generate" button is clicked, you iterate over chapterRefs and call the triggerLoad function on each ref. This action triggers the triggerLoad function defined in each ChapterCard.

Summary of the Flow
ConfirmChapters (Parent): Manages a collection of refs and provides a mechanism to trigger functions in child components.
ChapterCard (Child): Defines the triggerLoad function and binds it to the ref passed from the parent.
Interaction: When the user interacts with the parent component (clicking "Generate"), it triggers the triggerLoad function in each child component.
Addressing Your Questions
Do You Need ChapterCard.displayName?: Setting displayName on a component is useful for debugging, especially when you're using higher-order components or React DevTools. It's not necessary for functionality, but it can help make your components more identifiable in development tools.
Final Thoughts
Your implementation effectively leverages the capabilities of React.forwardRef and React.useImperativeHandle to establish a direct line of communication from the parent to each child component. This pattern is particularly useful in scenarios like yours, where a parent component needs to orchestrate actions in multiple child components.

Important!
You changed several proxy settings to make it work somewhat on the corp proxy. All of these need to be addressed depending on which network you are running. For example

const { data } = await axios.get(
`https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`,
{
httpsAgent: agent,
proxy: false,
}
);

remove httpAgent and proxy when on a public or actually functional network.
This needs to be changed at the very least in gpt2.ts, youtube.ts. The import for the transcript needs to be switched back to the library from your youtubeTranscriptRecieverAxios.ts file

you must set the httpsAgent with "tunnel" AND ALSO set 'proxy:false'

for example:
if (innerTubeApiKey && innerTubeApiKey.length > 0) {
// Use Axios to make a POST request
const response = await axios.post(
`https://www.youtube.com/youtubei/v1/get_transcript?key=${innerTubeApiKey}`,
this.generateRequest(videoPageBody, config),
{
httpsAgent: agent,
proxy: false,
headers: {
"Content-Type": "application/json",
},
}
);
cons

if you are OFF the corp proxy, you must STILL have "proxy:false" to ignore the environment variables.

- Also consider the proxy settings in .npmrc AND .yarnrc
