// Variáveis de paginação
let allAuthors = [];
let currentPage = 1;
const itemsPerPage = 5;

// Função principal para carregar autores
document.getElementById('fetch-authors-btn').addEventListener('click', () => {
    fetch('https://libraryapi-production-7976.up.railway.app/autores/all')
        .then(response => response.json())
        .then(data => {
            allAuthors = data;
            currentPage = 1;
            updateAuthorsList();
            updatePaginationControls();
        })
        .catch(error => console.error('Erro:', error));
});

// Função para atualizar a lista
function updateAuthorsList() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedAuthors = allAuthors.slice(start, end);

    const authorsList = document.getElementById('authors-list');
    authorsList.innerHTML = '';

    paginatedAuthors.forEach(author => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Nome:</strong> ${author.nome}<br>
            <strong>ID:</strong> ${author.id}<br>
            <strong>Nacionalidade:</strong> ${author.nacionalidade}<br>
            <strong>Livros:</strong> ${author.livros?.join(', ') || 'Nenhum'}<br>
            <strong>Data de Nascimento:</strong> ${author.dataNascimento}<br>
            <strong>Data de Cadastro:</strong> ${author.dataCadastro}<br>
            <strong>Data de Atualização:</strong> ${author.dataAtualizacao}<br>
            <hr>
        `;
        authorsList.appendChild(listItem);
    });
}

// Função para controles de paginação
function updatePaginationControls() {
    const totalPages = Math.ceil(allAuthors.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

// Eventos dos botões
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateAuthorsList();
        updatePaginationControls();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(allAuthors.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateAuthorsList();
        updatePaginationControls();
    }
});

// Função para filtrar autores por nome
document.getElementById('filter-authors-btn').addEventListener('click', () => {
    const name = document.getElementById('filter-name').value;
    fetch(`https://libraryapi-production-7976.up.railway.app/autores?nome=${name}`)
        .then(response => response.json())
        .then(data => {
            const filteredList = document.getElementById('filtered-authors-list');
            filteredList.innerHTML = '';
            if (data && Array.isArray(data)) {
                data.forEach(author => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${author.nome} - ${author.nacionalidade}`;
                    filteredList.appendChild(listItem);
                });
            } else {
                filteredList.innerHTML = '<li>Erro ao filtrar autores. Tente novamente mais tarde.</li>';
            }
        })
        .catch(error => {
            console.error('Erro ao filtrar autores:', error);
        });
});

// Função para adicionar novo autor
document.getElementById('add-author-btn').addEventListener('click', () => {
    const authorDataValue = document.getElementById('author-data').value;

    if (!authorDataValue.trim()) {
        document.getElementById('add-author-response').textContent = 'Os dados do autor não podem estar vazios!';
        return;
    }

    let authorData;
    try {
        authorData = JSON.parse(authorDataValue);
        // Adicionando dataCadastro e dataAtualizacao
        authorData.dataCadastro = new Date().toISOString();
        authorData.dataAtualizacao = new Date().toISOString();
    } catch (error) {
        document.getElementById('add-author-response').textContent = 'Formato de dados inválido!';
        return;
    }

    fetch('https://libraryapi-production-7976.up.railway.app/autores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
    })
    .then(response => {
        if (response.status === 201) {
            document.getElementById('add-author-response').textContent = 'Autor criado com sucesso!';
        } else if (response.status === 400) {
            document.getElementById('add-author-response').textContent = 'Erro ao adicionar autor: Dados inválidos!';
        } else if (response.status === 409) {
            document.getElementById('add-author-response').textContent = 'Erro: Autor já existe!';
        }
    })
    .catch(error => {
        console.error('Erro ao adicionar autor:', error);
        document.getElementById('add-author-response').textContent = 'Erro ao tentar criar o autor!';
    });
});


// Função para deletar autor
document.getElementById('delete-author-btn').addEventListener('click', () => {
    const authorId = document.getElementById('delete-author-id').value;
    fetch(`https://libraryapi-production-7976.up.railway.app/autores/${authorId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 204) {
            document.getElementById('delete-author-response').textContent = 'Autor deletado com sucesso!';
        } else if (response.status === 404) {
            document.getElementById('delete-author-response').textContent = 'Autor não encontrado!';
        } else if (response.status === 400) {
            document.getElementById('delete-author-response').textContent = 'Não foi possível localizar o ID fornecido.';
        } else {
            return response.json().then(data => {
                document.getElementById('delete-author-response').textContent = JSON.stringify(data, null, 2);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao deletar autor:', error);
        document.getElementById('delete-author-response').textContent = 'Ocorreu um erro ao deletar o autor.';
    });
});

// Função para atualizar autor
document.getElementById('update-author-btn').addEventListener('click', () => {
    const authorId = document.getElementById('update-author-id').value;
    const authorData = JSON.parse(document.getElementById('update-author-data').value);

    if (!authorId) {
        document.getElementById('update-author-response').textContent = 'ID do autor é necessário!';
        return;
    }

    // Atualizando a data de atualização
    authorData.dataAtualizacao = new Date().toISOString();

    fetch(`https://libraryapi-production-7976.up.railway.app/autores/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
    })
    .then(response => {
        if (response.status === 204) {
            document.getElementById('update-author-response').textContent = 'Autor atualizado com sucesso!';
        } else if (response.status === 404) {
            document.getElementById('update-author-response').textContent = 'Autor não encontrado!';
        } else if (response.status === 500) {
            document.getElementById('update-author-response').textContent = 'Não foi possível identificar o ID do autor!';
        } else {
            return response.json().then(data => {
                document.getElementById('update-author-response').textContent = JSON.stringify(data, null, 2);
            });
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar autor:', error);
        document.getElementById('update-author-response').textContent = 'Ocorreu um erro ao atualizar o autor.';
    });
});

