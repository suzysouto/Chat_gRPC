let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:5001";

//Carregamento do protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("protos/chat.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

let users = [];

//Menssagem recebida do cliente quando entra no chat.
function join(call, callback) {
    users.push(call);
    notifyChat({ user: "Server", text: "Novo usuário participando ..."});
}

//Menssagem recebida do cliente.
function send(call, callback) {
    notifyChat(call.request);
}

//Menssagem enviada para todos os clientes conectados.
function notifyChat(message) {
    users.forEach(user => {
        user.write(message);
    });
}

//Definindo os métodos e iniciando o servidor.
server.addService(proto.example.Chat.service, { join: join, send: send });
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
server.start();
