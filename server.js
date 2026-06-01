import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';         
import Meta from './meta.js'; // Mantido no singular conforme seu arquivo
import Usuario from './usuario.js';   

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        console.log('Tentando conectar ao MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔥 Conectado ao MongoDB do Planner!');
    } catch (error) {
        console.log('Erro ao conectar ao banco', error);
    }
}

connectDB();

// --- ROTAS DE METAS (INDIVIDUAIS) ---

app.get('/metas', async (req, res) => {
    try {
        // Pega o ID enviado pelo front-end nos Headers
        const usuarioId = req.headers['usuario-id'];

        if (!usuarioId) {
            return res.status(400).json({ erro: "Usuário não identificado." });
        }

        // Filtra para trazer apenas os desejos do usuário logado
        const metas = await Meta.find({ usuarioId: usuarioId });
        res.json(metas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/metas', async (req, res) => {
    try {
        const { titulo, usuarioId } = req.body;

        if (!usuarioId) {
            return res.status(400).json({ erro: "Não é possível salvar uma meta sem um usuário dono." });
        }

        // Cria a meta vinculando ao ID do dono
        const dados = await Meta.create({
            titulo,
            usuarioId
        }); 
        
        res.status(201).json(dados);
    } catch (error) {
        res.status(500).json({ erro: 'Não foi possível salvar o seu desejo.' });
    }
});

app.patch('/metas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const metaAtualizada = await Meta.findByIdAndUpdate(id, req.body, { new: true });
        res.json(metaAtualizada);
    } catch (error) {
        res.status(500).json({ erro: 'Não foi possível atualizar o seu desejo.' });
    }
});

app.delete('/metas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Meta.findByIdAndDelete(id);
        res.json("Desejo removido!");
    } catch (error) {
         res.status(500).json({ erro: 'Não foi possível deletar seu desejo.' });
    }
});

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/usuario/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        
        const novoUsuario = await Usuario.create({
            nome,
            email,
            senha: senhaCriptografada
        });
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao realizar o cadastro." });
    }
});

app.post('/usuario/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuarioEncontrado = await Usuario.findOne({ email });

        if (!usuarioEncontrado) {
            return res.status(400).json({ erro: "E-mail ou senha inválidos." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

        if (!senhaCorreta) {
            return res.status(400).json({ erro: "E-mail ou senha inválidos." });
        }

        res.json({ 
            mensagem: "Login realizado com sucesso! 🎉",
            usuario: {
                id: usuarioEncontrado._id,
                nome: usuarioEncontrado.nome
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao tentar fazer login." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});