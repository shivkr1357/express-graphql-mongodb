const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!

        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput) : Event
        }

        schema {
            query : RootQuery ,
            mutation : RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find();
      },
      createEvent: async (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });

        try {
          const res = await event.save();
          console.log(res);
          return { ...res._doc };
        } catch (err) {
          console.log("Unable to save event");
          throw err;
        }
      },
    },
    graphiql: true,
  })
);

mongoose.connect("mongodb://localhost:27017/express-graphql").then(() => {
  console.log("COnnected to db");
  app.listen(4000, () => {
    console.log("App is listening to port 4000");
  });
});
