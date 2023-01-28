const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.get('/posts', (req,res) => {
    res.send("Pagina de posts");
});

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});
    }).catch((error) => {
        req.flash('error_msg', "Houve um error ao listar as categorias");
        res.redirect('/admin');
    })
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addCategorias');
});

router.get('/categorias/edit/:id', (req,res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editCategorias', {categoria: categoria});
    }).catch((error) => {
        req.flash('error_msg', "Esta categoria não existe");
        res.redirect('/admin/categorias');
    });
    
});

router.get('/postagens', (req, res) => {
    res.render('admin/postagens');
});

router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addPostagens', {categorias: categorias});
    }).catch(error => {
        req.flash('error_msg', "Houve um error ao carregar o formulario");
        res.redirect('/admin/postagens');
    });
});


//

router.post('/categorias/nova', (req, res) => {

    var erros = [];
    var sucesso = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: 'Nome inválido'
        });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({
            texto: 'Slug inválido'
        });
    }
    if (req.body.nome.length < 2) {
        erros.push({
            texto: 'Nome da categoria é muito pequeno'
        });
    }
    if (erros.length > 0) {
        res.render('admin/addcategorias', {erros: erros});
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((error) => {
            req.flash('error_msg', 'Houve um erro ao salvar categoria, tente novamente!');
            res.redirect('/admin/categorias');
        });
    };

    
});

router.post('/categorias/edit', (req,res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', "Categoria editada com sucesso");
            res.redirect('/admin/categorias');
        }).catch((error) => {
            req.flash('error_msg', "Houve um error interno ao salvar a edição");
            res.redirect('/admin/categorias');
        });

    }).catch((error) => {
        req.flash('error_msg', "Houve um error ao editar a categoria");
        res.redirect('/admin/categorias');
    })
});

router.post('/categorias/deletar', (req,res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg', "Categoria deletada com sucesso!");
    res.redirect('/admin/categorias');
}).catch((error) => {
    req.flash('error_msg', "Houve um erro ao deletar a categoria.");
    res.redirect('/admin/categorias');
})

});




module.exports = router;