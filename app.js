

function mostrarTela(tela) {
    const tLogin = document.getElementById('tela-login');
    const tCadastro = document.getElementById('tela-cadastro');
    const tPlanner = document.getElementById('tela-planner');

    tLogin.classList.add('escondido');
    tCadastro.classList.add('escondido');
    tPlanner.classList.add('escondido');

    if (tela === 'login') tLogin.classList.remove('escondido');
    if (tela === 'cadastro') tCadastro.classList.remove('escondido');
    if (tela === 'planner') tPlanner.classList.remove('escondido');
}

async function carregarMetas() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        
        // Envia o ID do usuário logado via header para filtrar no banco
        const resposta = await fetch('http://localhost:3000/metas', {
            method: 'GET',
            headers: { 'usuario-id': usuarioId }
        });
        const metas = await resposta.json();

        const container = document.getElementById('lista-metas');
        container.innerHTML = '';
        
        const metasPendentes = metas.filter(meta => meta.concluido === false);

        metasPendentes.forEach(meta => {
            container.innerHTML += `
                <div class="meta-card">
                    <span>${meta.titulo}</span>
                    <div class="acoes">
                        <button class="btn-check" onclick="concluirMeta('${meta._id}', true, '${meta.titulo}')">✓</button>
                        <button class="btn-delete" onclick="deletarMeta('${meta._id}')">✕</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao buscar metas do banco:', error);
    }
}

document.getElementById('form-meta').addEventListener('submit', async function(e) {
    e.preventDefault();
    const titulo = document.getElementById('input-meta').value;
    const usuarioId = localStorage.getItem('usuarioId');

    if (titulo.trim() === "") {
        alert("Por favor, adicione um desejo à sua Lista! O campo não pode ficar vazio. 📝");
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/metas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                titulo: titulo,
                usuarioId: usuarioId // Envia o ID do dono da meta
            }) 
        });

        if (resposta.ok) {
            alert("Desejo adicionado com sucesso a sua Lista! 🚀");
            document.getElementById('input-meta').value = ""; 
            carregarMetas(); 
        } else {
            alert("Houve um erro no servidor ao tentar salvar seu desejo.");
        }
    } catch (error) {
        console.error("Erro ao salvar meta:", error);
    }
});

async function concluirMeta(id, novoStatus, titulo) {
    try {
        const resposta = await fetch(`http://localhost:3000/metas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concluido: novoStatus }) 
        });

        if (resposta.ok) {
            if (novoStatus === true) {
                alert(`Fico feliz em saber que você concluuiu o desejo: ${titulo}! ✨🥳`);
            }
            carregarMetas(); 
        }
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
    }
}

async function deletarMeta(id) {
    if (!confirm("Tem certeza que deseja apagar esse desejo da sua lista?")) return;

    try {
        const resposta = await fetch(`http://localhost:3000/metas/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            carregarMetas();
        }
    } catch (error) {
        console.error("Erro ao deletar meta:", error);
    }
}


document.getElementById('form-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-senha').value;

    try {
        const resposta = await fetch('http://localhost:3000/usuario/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        if (resposta.ok) {
            alert("Conta criada com sucesso! 🎉 Agora faça o seu login.");
            document.getElementById('form-cadastro').reset(); 
            mostrarTela('login'); 
        } else {
            alert("Erro ao criar conta. Verifique os dados ou tente outro e-mail.");
        }
    } catch (error) {
        console.error("Erro na requisição de cadastro:", error);
    }
});

document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const resposta = await fetch('http://localhost:3000/usuario/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.mensagem);
        
            localStorage.setItem('usuarioId', dados.usuario.id);
            
            document.getElementById('nome-usuario-logado').innerText = `Olá, ${dados.usuario.nome} ✨`;
            
            mostrarTela('planner'); 
            carregarMetas(); 
        } else {
            alert(dados.erro); 
        }
    } catch (error) {
        console.error("Erro no login:", error);
    }
});

function fazerLogout() {
    localStorage.removeItem('usuarioId'); // Limpa o ID do usuário ao deslogar
    document.getElementById('form-login').reset();
    mostrarTela('login');
}


function abrirModal() {
    document.getElementById('modal-historico').style.display = 'flex';
    carregarHistorico(); 
}

function fecharModal() {
    document.getElementById('modal-historico').style.display = 'none';
}

async function carregarHistorico() {
    try {
        const usuarioId = localStorage.getItem('usuarioId');
        
        const resposta = await fetch('http://localhost:3000/metas', {
            method: 'GET',
            headers: { 'usuario-id': usuarioId }
        });
        const metas = await resposta.json();
        
        const containerHistorico = document.getElementById('lista-conquistas');
        containerHistorico.innerHTML = "";

        const metasConcluidas = metas.filter(meta => meta.concluido === true);

        if (metasConcluidas.length === 0) {
            containerHistorico.innerHTML = `<p style="color: #666; text-align: center; font-size: 0.9rem;">Nenhum desejo realizado ainda. Continue firme! 💪</p>`;
            return;
        }

        metasConcluidas.forEach(meta => {
            containerHistorico.innerHTML += `
                <div class="meta-card" style="border-left: 3px solid #00ff88;">
                    <span style="text-decoration: line-through; color: rgba(255,255,255,0.3);">${meta.titulo}</span>
                    <button class="btn-delete" onclick="deletarMetaHistorico('${meta._id}')">✕</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

async function deletarMetaHistorico(id) {
    if (!confirm("Remover essa conquista do histórico permanentemente?")) return;
    try {
        const resposta = await fetch(`http://localhost:3000/metas/${id}`, { method: 'DELETE' });
        if (resposta.ok) {
            carregarHistorico(); 
        }
    } catch (error) {
        console.error(error);
    }
}