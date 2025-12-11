// ==UserScript==
// @name         Selecionar Regional GGNET - SZ.CHAT
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Seletor de regional
// @author       João/Samuel
// @icon         https://avatars.githubusercontent.com/u/179055349?v=4
// @match        *://*.ggnet.sz.chat/*
// @match        *://clusterscpr.sz.chat/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
// --- ESTRATÉGIA DE ATUALIZAÇÃO ---
// @updateURL    https://github.com/joaoAGS/Selecionar-Regional-GGNET---SZ.CHAT/raw/refs/heads/main/Selecionar%20Regional%20GGNET%20-%20SZ.CHAT.user.js
// @downloadURL  https://github.com/joaoAGS/Selecionar-Regional-GGNET---SZ.CHAT/raw/refs/heads/main/Selecionar%20Regional%20GGNET%20-%20SZ.CHAT.user.js
// ==/UserScript==

(function () {
    'use strict';

    // --- CONFIGURAÇÃO ---
    const regionais = [
        { nome: 'Regional CD', bg: '#ffcccc', text: '#550000' },
        { nome: 'Regional VII', bg: '#ffdec2', text: '#5c2b00' },
        { nome: 'Regional CNI', bg: '#fff4bd', text: '#5c5200' },
        { nome: 'Regional UVA', bg: '#d4edda', text: '#155724' },
        { nome: 'Regional RSL', bg: '#cce5ff', text: '#004085' },
        { nome: 'Regional IRI', bg: '#d1ecf1', text: '#0c5460' },
        { nome: 'Regional ITH', bg: '#e2d9f3', text: '#3c007a' },
        { nome: 'Regional CBS', bg: '#1d5a68', text: '#ffffff' }
    ];

    // --- ESTILOS CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* O Container agora é Fixed para flutuar sobre tudo */
        #regional-dropdown-portal {
            display: none;
            position: fixed;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000; /* Z-index altíssimo para ficar por cima do chat */
            width: 220px;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.2s, transform 0.2s;
        }

        #regional-dropdown-portal.ativo {
            opacity: 1;
            transform: translateY(0);
        }

        .regional-item {
            display: block;
            padding: 8px 12px;
            margin-bottom: 6px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            text-align: center;
            transition: filter 0.2s;
            user-select: none;
        }

        .regional-item:hover {
            filter: brightness(0.95);
        }

        .regional-search {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box; /* Garante que o padding não estoure a largura */
        }

        /* Scrollbar bonitinha */
        #regional-dropdown-portal::-webkit-scrollbar {
            width: 6px;
        }
        #regional-dropdown-portal::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    // --- CRIAÇÃO DO MENU FLUTUANTE (PORTAL) ---
    // Criamos direto no body para não ser cortado pela barra lateral
    const dropdown = document.createElement('div');
    dropdown.id = 'regional-dropdown-portal';

    // Input de busca
    const inputSearch = document.createElement('input');
    inputSearch.type = 'text';
    inputSearch.placeholder = 'Buscar regional...';
    inputSearch.className = 'regional-search';
    dropdown.appendChild(inputSearch);

    // Container da lista
    const listaContainer = document.createElement('div');
    dropdown.appendChild(listaContainer);

    document.body.appendChild(dropdown);

    // --- FUNÇÕES AUXILIARES ---
    function renderizarLista(filtro = '') {
        listaContainer.innerHTML = '';
        regionais.forEach(reg => {
            if (reg.nome.toLowerCase().includes(filtro.toLowerCase())) {
                const item = document.createElement('div');
                item.className = 'regional-item';
                item.textContent = reg.nome;
                item.style.backgroundColor = reg.bg;
                item.style.color = reg.text;

                item.onclick = () => {
                    localStorage.setItem('sz_regional_selecionada', reg.nome);

                    // Atualiza o texto do botão (se ele existir na tela)
                    const labelBtn = document.getElementById('reg-label');
                    if(labelBtn) labelBtn.textContent = reg.nome;

                    fecharDropdown();
                };
                listaContainer.appendChild(item);
            }
        });
    }

    function fecharDropdown() {
        dropdown.classList.remove('ativo');
        setTimeout(() => {
            if (!dropdown.classList.contains('ativo')) {
                dropdown.style.display = 'none';
            }
        }, 200); // Espera a animação acabar
    }

    function toggleDropdown(btnElement) {
        if (dropdown.style.display === 'block' && dropdown.classList.contains('ativo')) {
            fecharDropdown();
            return;
        }

        // Resetar filtro ao abrir
        inputSearch.value = '';
        renderizarLista();

        // CÁLCULO DE POSIÇÃO (A Mágica da Responsividade)
        const rect = btnElement.getBoundingClientRect();

        // Posiciona logo abaixo do botão, alinhado à esquerda
        let top = rect.bottom + 5;
        let left = rect.left;

        // Se estiver muito embaixo da tela, abre para cima
        if (top + 400 > window.innerHeight) {
            top = rect.top - 410; // Altura estimada do menu
        }

        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        dropdown.style.display = 'block';

        // Pequeno delay para permitir a animação CSS
        requestAnimationFrame(() => {
            dropdown.classList.add('ativo');
            inputSearch.focus();
        });
    }

    // Evento de busca
    inputSearch.addEventListener('input', (e) => renderizarLista(e.target.value));

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        // Se o clique não foi no dropdown nem no botão que abre ele
        if (!dropdown.contains(e.target) && !e.target.closest('#btn-selecionar-regional')) {
            fecharDropdown();
        }
    });

    // --- OBSERVER (INSERE O BOTÃO NA TELA) ---
    const observer = new MutationObserver(() => {
        const botoes = Array.from(document.querySelectorAll('a.item.text-ellipsis'));
        const btnExistente = document.querySelector('#btn-selecionar-regional');

        // Usa o botão de "Baixar Mídia" como âncora
        const btnModelo = botoes.find(el => el.textContent.includes('Baixar Mídia'));

        if (!btnModelo || btnExistente) return;

        // Clona e cria o botão
        const novoBotao = btnModelo.cloneNode(true);
        novoBotao.id = 'btn-selecionar-regional';
        novoBotao.href = 'javascript:void(0)';

        const salvo = localStorage.getItem('sz_regional_selecionada') || 'Selecionar Regional';
        novoBotao.innerHTML = `<i class="icon map marker alternate"></i> <span id="reg-label">${salvo}</span>`;

        // Evento de clique do botão
        novoBotao.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleDropdown(novoBotao);
        });

        // Insere na barra lateral
        btnModelo.parentElement.insertBefore(novoBotao, btnModelo);
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();