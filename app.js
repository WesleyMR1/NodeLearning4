// Carregando módulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const { Console } = require('console');
    const app = express();
    const mongoose = require('mongoose');
    const admin = require("./routes/admin");
    const path = require('path');
    const session = require('express-session');
    const flash = require("connect-flash");

// Configurações
    // Sessão
        app.use(session({
            secret: "senha",
            resave: true,
            saveUninitialized: true
        }));
        app.use(flash());
    //  Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash('error_msg');
            next();
        })
    // Body Parser
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
    // Template engine
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.set('strictQuery', false);
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://127.0.0.1:27017/blogapp').then(() => {
            console.log("Conectado ao banco de dados");
        }).catch((error) => {
            console.log(`Error ao se conectar: ${error}`);
        });
    // Public
        app.use(express.static(path.join(__dirname, "public")));


    
// Rotas
    app.get('/', (req, res) => {
        res.send("Rota Principal.")
    })
    app.use('/admin', admin);
    

// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});