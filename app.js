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
    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');
    require('./models/Categoria');
    const Categoria = mongoose.model('categorias');
    const usuarios = require('./routes/usuario')
    const passport = require('passport');
    require('./config/auth')(passport);

// Configurações
    // Sessão
        app.use(session({
            secret: "senha",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    //  Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
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

    app.use('/admin', admin);

    app.use('/usuarios', usuarios)

    app.get('/', (req, res) => {
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then(postagens => {
            res.render('index', {postagens: postagens});
        }).catch((req,flash) => {
            req.flash('error_msg', "Houve um erro interno");
            res.redirect('/404');
        })
    })

    app.get('/postagem/:id', (req, res) => {
        Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', "Esta postagem não existe!");
                res.redirect("/");
            }
        }).catch((error) => {
            req.flash('error_msg', "Houve um erro interno.");
            res.redirect('/');
        })
    });

    app.get('/404', (req, res) => {
        res.send('Erro 404!');
    })

    app.get('/categorias', (req,res) => {

        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index', {categorias: categorias});

        }).catch((error) => {
            req.flash('error_msg', "Houve um erro interno ao listar categorias.");
            res.redirect('/');
        })

    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if (categoria) {
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria});
                }).catch(error => {
                    req.flash('error_msg', "Houve um erro ao listar os posts.");
                    res.redirect('/')
                })
            } else {
                req.flash('error_msg', "Esta categoria não existe.");
                res.redirect('/')
            }
        }).catch((error) => {
            req.flash('error_msg', "Houve um erro interno ao carregar a pagina desta categoria.");
            res.redirect('/')
        })
    })


    

// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});