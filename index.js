const { ApolloServer, gql, ApolloError } = require('apollo-server');
var mongoose = require('mongoose');

const todo = mongoose.model("todo", { text: String, completed: Boolean});

const typeDefs = gql`
  type ITodo{
      _id: ID
      text: String
      completed: Boolean
  }
  type Query {
    getTodo: [ITodo]
    getTodoByStatus(completed: Boolean): [ITodo]
  }
  type Mutation {
      addTodo(text: String!, completed: Boolean): ITodo
      updateTodo(id: ID!, text: String, completed: Boolean!): ITodo
      deleteTodo(id: ID): Boolean
  }
`;
const resolvers = {
    Query: {
        getTodo: async() => {
          return await todo.find();
      }, getTodoByStatus: async(_,{completed}) => {
          return await todo.find({completed});
      }
    },
    Mutation: {
        addTodo: async(_,{text, completed}) => {
            console.log(text, completed);
            const newTodo = new todo({text,completed});
            await newTodo.save()
            return newTodo;
        },
        deleteTodo: async(_,{id}) => {
            const deleteRes = await todo.deleteOne({_id: id});
            return deleteRes.deletedCount > 0 ?  true : new ApolloError('Unable to delete record',500);
        }, updateTodo: async(_, {id, text, completed}) => {

            const updatedItem = await todo.updateOne({_id: id}, {text, completed});
            return updatedItem.nModified > 0 ? {
                _id: id,
                text,
                completed
            } : new ApolloError('Unable to update the record', 500);
        }
    }
  };

  mongoose.connect("mongodb+srv://todo:todo@cluster0.w36yg2g.mongodb.net/?retryWrites=true", { useUnifiedTopology: true }).then(() => {
    console.log('Db Connected');
    const server = new ApolloServer({ typeDefs, resolvers });
    server.listen().then(({ url }) => {
      console.log(` Server ready at ${url}`);
    });
}, (err) => {
    console.log('Failed to connect DB');
    console.log(err);
});