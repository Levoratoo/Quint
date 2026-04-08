/* ============================================================
   QUINT PRESS KIT, SCRIPT
   Navbar, galleries, i18n, interactions
   ============================================================ */

'use strict';

// ============================================================
// NAVBAR
// ============================================================

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

function onScroll() {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    updateActiveNav();
}

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================================
// SMOOTH SCROLL (navbar + scroll-padding-top em html)
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id     = this.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
            behavior: prefersReduced ? 'auto' : 'smooth',
            block: 'start',
        });
    });
});

// ============================================================
// ACTIVE NAV LINK
// ============================================================

const navSections = Array.from(document.querySelectorAll('section[id]'));

function updateActiveNav() {
    const mid = window.scrollY + window.innerHeight / 3;

    let current = '';
    for (const section of navSections) {
        if (section.offsetTop <= mid) {
            current = section.id;
        }
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${current}`
        );
    });
}

// ============================================================
// INTERSECTION OBSERVER — REVEAL ANIMATIONS
// ============================================================

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// ============================================================
// NUMBER COUNTER ANIMATION
// ============================================================

function animateCounter(el, target) {
    const duration = target > 999 ? 2200 : 1600;
    const start    = performance.now();

    function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const value    = Math.round(eased * target);

        el.textContent = value.toLocaleString('pt-BR');

        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el     = entry.target;
                const target = parseInt(el.dataset.target, 10);
                if (!isNaN(target)) animateCounter(el, target);
                counterObserver.unobserve(el);
            }
        });
    },
    { threshold: 0.5 }
);

document.querySelectorAll('.number-value[data-target]').forEach(el => {
    counterObserver.observe(el);
});

// ============================================================
// CURSOR GLOW (subtle amber spotlight, desktop only)
// ============================================================

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    (function setupCursorGlow() {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position:fixed;width:300px;height:300px;border-radius:50%;
            background:radial-gradient(circle,rgba(255,179,0,0.04) 0%,transparent 70%);
            pointer-events:none;z-index:0;transform:translate(-50%,-50%);
            transition:opacity 0.4s ease;opacity:0;
        `;
        document.body.appendChild(glow);

        let ticking = false;
        document.addEventListener('mousemove', e => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                glow.style.left    = e.clientX + 'px';
                glow.style.top     = e.clientY + 'px';
                glow.style.opacity = '1';
                ticking = false;
            });
        });

        document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    })();
}

// ============================================================
// WINDOW EVENTS
// ============================================================

window.addEventListener('scroll', onScroll, { passive: true });

// ============================================================
// TIMELINE — DRAG-TO-SCROLL DJ GALLERY
// ============================================================

function initDjGallery() {
    const gallery = document.getElementById('tl-dj-gallery');
    if (!gallery) return;

    let isDown = false, startX = 0, scrollLeft = 0;

    gallery.addEventListener('mousedown', e => {
        isDown = true;
        gallery.classList.add('grabbing');
        startX     = e.pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
    });

    const endDrag = () => { isDown = false; gallery.classList.remove('grabbing'); };
    gallery.addEventListener('mouseleave', endDrag);
    gallery.addEventListener('mouseup',    endDrag);

    gallery.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        gallery.scrollLeft = scrollLeft - (e.pageX - gallery.offsetLeft - startX) * 1.6;
    });

    let touchStartX = 0, touchScrollLeft = 0;
    gallery.addEventListener('touchstart', e => {
        touchStartX     = e.touches[0].pageX;
        touchScrollLeft = gallery.scrollLeft;
    }, { passive: true });
    gallery.addEventListener('touchmove', e => {
        gallery.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX);
    }, { passive: true });
}

// ============================================================
// TIMELINE — MOBILE CAROUSEL DRAG
// ============================================================

function initTimelineMobileCarousels() {
    const carousels = document.querySelectorAll('.tl-vc-mask');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
        let isPointerDown = false, startX = 0, startY = 0;
        let startScrollLeft = 0, isHorizontalDrag = false;

        carousel.addEventListener('pointerdown', e => {
            if (window.innerWidth > 900) return;
            isPointerDown = true; isHorizontalDrag = false;
            startX = e.clientX; startY = e.clientY;
            startScrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('pointermove', e => {
            if (!isPointerDown || window.innerWidth > 900) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            if (!isHorizontalDrag) {
                if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
                isHorizontalDrag = true;
            }
            e.preventDefault();
            carousel.scrollLeft = startScrollLeft - dx;
        });

        const end = () => { isPointerDown = false; isHorizontalDrag = false; };
        carousel.addEventListener('pointerup',          end);
        carousel.addEventListener('pointercancel',      end);
        carousel.addEventListener('lostpointercapture', end);
    });
}

// ============================================================
// TIMELINE — TENSION BLOCK GLITCH
// ============================================================

function initTensionGlitch() {
    const el = document.getElementById('tl-glitch');
    if (!el) return;

    let glitchVisible = false;
    const obs = new IntersectionObserver(entries => {
        glitchVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    obs.observe(el);

    setInterval(() => {
        if (!glitchVisible || Math.random() > 0.55) return;
        el.style.transform = `translateX(${(Math.random() - 0.5) * 8}px)`;
        setTimeout(() => { el.style.transform = ''; }, 80);
    }, 600);
}

// ============================================================
// TIMELINE — SPINE LINE SCROLL ANIMATION
// ============================================================

function initSpineLine() {
    const wrappers = document.querySelectorAll('.tl-spine-wrapper');
    if (!wrappers.length) return;

    function updateSpine(wrapper) {
        const spineLine = wrapper.querySelector('.tl-spine-line');
        if (!spineLine) return;
        const nodes = wrapper.querySelectorAll('.tl-node');
        const lastNode = nodes[nodes.length - 1];
        const endDot = lastNode ? lastNode.querySelector('.tl-node-dot') : null;

        const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
        let endY;
        if (endDot) {
            const dotRect = endDot.getBoundingClientRect();
            endY = dotRect.top + window.scrollY + endDot.offsetHeight / 2;
        } else {
            endY = wrapperTop + wrapper.offsetHeight;
        }

        const totalSpan = Math.max(1, endY - wrapperTop);
        const scrolled  = Math.max(0, window.scrollY + window.innerHeight * 0.55 - wrapperTop);
        const pct       = Math.min(100, (scrolled / totalSpan) * 100);
        spineLine.style.height = ((pct / 100) * totalSpan) + 'px';
    }

    function updateAll() {
        wrappers.forEach(updateSpine);
    }

    window.addEventListener('scroll', updateAll, { passive: true });
    updateAll();
}

// ============================================================
// TIMELINE — SCROLL REVEAL WITH STAGGER
// ============================================================

function initTimelineReveal() {
    const items = document.querySelectorAll(
        '.tl-node-text, .tl-photo-grid--3, .tl-photo-grid--mosaic, .tl-tension-content, .tl-node-photos--gallery'
    );

    const obs = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${i * 0.06}s`;
                entry.target.classList.add('tl-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    items.forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.75s ease, transform 0.75s ease';
        obs.observe(el);
    });

    document.querySelectorAll('.tl-node-dot-inner').forEach(dot => {
        dot.style.opacity   = '0';
        dot.style.transform = 'scale(0)';
        dot.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        const dotObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity   = '1';
                    e.target.style.transform = 'scale(1)';
                    dotObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.8 });
        dotObs.observe(dot);
    });

    const style = document.createElement('style');
    style.textContent = `.tl-visible { opacity: 1 !important; transform: none !important; }`;
    document.head.appendChild(style);
}

// ============================================================
// TIMELINE — TENSION SECTION: red flicker on entry
// ============================================================

function initTensionEntry() {
    const tension = document.getElementById('tl-ch3');
    if (!tension) return;

    const tensionObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bg = tension.querySelector('.tl-tension-bg');
                if (!bg) return;
                let count = 0;
                const flicker = setInterval(() => {
                    bg.style.opacity = count % 2 === 0 ? '1.6' : '0.4';
                    count++;
                    if (count >= 6) { clearInterval(flicker); bg.style.opacity = ''; }
                }, 80);
                tensionObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    tensionObs.observe(tension);
}

// ============================================================
// MUSIC — STREAM TABS
// ============================================================

function initStreamTabs() {
    const tabs   = document.querySelectorAll('.stream-tab');
    const panels = document.querySelectorAll('.stream-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t   => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById('panel-' + target);
            if (panel) panel.classList.add('active');
        });
    });
}

function initDownloadsTabs() {
    const root = document.getElementById('downloads-tabs');
    if (!root) return;
    const tabs = root.querySelectorAll('.downloads-tab');
    const panels = root.parentElement.querySelectorAll('.downloads-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            const target = tab.dataset.dlPanel;
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById('dl-panel-' + target);
            if (panel) panel.classList.add('active');
        });
    });
}

/** Um clique inicia os 3 .zip (GitHub limita 100 MB por arquivo, o pacote total fica em 3 partes). */
const PRESS_ZIP_PARTS = [
    { href: 'downloads/quint-fotos-imprensa-parte1.zip', filename: 'quint-fotos-imprensa-parte1.zip' },
    { href: 'downloads/quint-fotos-imprensa-parte2.zip', filename: 'quint-fotos-imprensa-parte2.zip' },
    { href: 'downloads/quint-fotos-imprensa-parte3.zip', filename: 'quint-fotos-imprensa-parte3.zip' },
];

function initPressZipBundle() {
    const btn = document.getElementById('downloads-zip-all');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const delayMs = 500;
        PRESS_ZIP_PARTS.forEach((part, i) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = part.href;
                a.setAttribute('download', part.filename);
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }, i * delayMs);
        });
    });
}

function initTimelineStoryTabs() {
    const root = document.getElementById('timeline-story-tabs');
    if (!root) return;
    const tabs = root.querySelectorAll('.downloads-tab');
    const panels = document.querySelectorAll('.tl-timeline-panel');
    if (!tabs.length || !panels.length) return;

    function activate(target) {
        tabs.forEach(t => {
            const on = t.getAttribute('data-tl-panel') === target;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => {
            const panelTarget = p.getAttribute('data-tl-panel') || p.id.replace(/^tl-panel-/, '');
            const on = panelTarget === target;
            p.classList.toggle('active', on);
            p.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            const target = tab.getAttribute('data-tl-panel');
            if (!target) return;
            activate(target);
        });
    });
}

// ============================================================
// INTERNATIONALIZATION (i18n)
// ============================================================

const i18n = {
    pt: {
        'nav-historia'       : 'História',
        'nav-sobre'          : 'Sobre',
        'nav-musicas'        : 'Músicas',
        'nav-drops'          : 'Drops',
        'drops-tag'          : 'ELETRÔNICA',
        'drops-sub'          : 'Energia no máximo. Clique para assistir.',
        'nav-autorais'       : 'Autorais',
        'autorais-tag'       : 'ORIGINAIS',
        'hero-desc'          : 'Sets construídos a partir da identidade musical.<br>Cada pista, uma história. Cada drop, uma experiência.',
        'hero-listen'        : 'Ouvir Agora',
        'badge-pressure'     : 'Pressão de Pista',
        'tl-section-tag'     : 'A HISTÓRIA',
        'tl-section-title'   : 'Uma trajetória de <span class="text-glow">20 anos</span>',
        'tl-tab-performance' : 'Performance nos palcos',
        'tl-tab-education'   : 'Educação musical',
        'edu-01-tag'         : 'AGO 2015 / NOV 2015',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : 'Professor de guitarra e violão · Maringá, PR',
        'edu-01-desc'        : 'Onde comecei a ensinar: alunos em diferentes níveis, foco em aprendizado leve, prático e próximo, desenvolvendo didática e motivação desde o primeiro contato com o instrumento.',
        'edu-01-aria'        : 'Tok Music, abrir em nova aba',
        'edu-02-tag'         : 'FEV 2016 / JUL 2016',
        'edu-02-title'       : 'Universidade Estadual de Maringá',
        'edu-02-role'        : 'Projeto de extensão · Colégio de Aplicação Pedagógica (CAP)',
        'edu-02-desc'        : 'Atuação durante a graduação em Música: educação musical em ambiente escolar, com percepção, ritmo e instrumentos, alinhada à proposta pedagógica do projeto de extensão.',
        'edu-02-aria'        : 'CAP UEM, abrir em nova aba',
        'edu-03-tag'         : 'JUL 2016 / NOV 2016',
        'edu-03-title'       : 'Colégio Estadual Alberto Jackson Byington Junior',
        'edu-03-role'        : 'Professor de música · projeto de extensão · Maringá, PR',
        'edu-03-desc'        : 'Ensino de música no ambiente escolar público, adaptando conteúdo ao nível dos alunos e conectando teoria da graduação à prática em sala.',
        'edu-03-aria'        : 'Colégio Byington Junior, abrir em nova aba',
        'edu-04-tag'         : 'OUT 2016 / AGO 2018',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : 'Professor freelance · guitarra, violão, baixo e cavaquinho',
        'edu-04-desc'        : 'Aulas particulares para diferentes perfis e objetivos, com ênfase na prática e no repertório, usando a teoria como suporte quando fazia sentido para cada aluno.',
        'edu-04-aria'        : 'Art Musica, abrir em nova aba',
        'edu-05-tag'         : 'JAN 2017 / NOV 2017',
        'edu-05-title'       : 'Escola Municipal Victor Beloti',
        'edu-05-role'        : 'Estágio · educação musical · part-time · Maringá, PR',
        'edu-05-desc'        : 'Estágio no ensino público com acompanhamento pedagógico: planejamento, condução de turma e desenvolvimento de percepção e ritmo com instrumentos.',
        'edu-05-aria'        : 'Escola Municipal Victor Beloti, abrir em nova aba',
        'edu-06-tag'         : 'JAN 2017 / JUL 2019',
        'edu-06-title'       : 'Colégio Estadual do Jardim Independência',
        'edu-06-role'        : 'Estágio · professor de música · part-time · Maringá, PR',
        'edu-06-desc'        : 'Estágio no último ano da graduação em Música: autonomia em sala, planejamento das aulas e acompanhamento da evolução dos alunos em educação musical escolar.',
        'edu-06-aria'        : 'Colégio Jardim Independência, abrir em nova aba',
        'edu-07-tag'         : 'FEV 2017 / NOV 2017',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : 'Educação musical infantil · bebês · Maringá, PR',
        'edu-07-desc'        : 'Trabalho com primeira infância: estímulos sonoros, ritmos, movimentos e vivências lúdicas, com sensibilidade, vínculo com as famílias e abordagem fora do modelo técnico tradicional.',
        'edu-07-aria'        : 'Ateliê Da Criança, abrir em nova aba',
        'edu-08-tag'         : 'ABR 2017 / OUT 2019',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : 'Professor · guitarra, violão, baixo e cavaquinho · Maringá, PR',
        'edu-08-desc'        : 'Aulas com foco prático e adaptação ao objetivo de cada aluno, da base técnica ao repertório, reforçando versatilidade instrumental e contato com perfis diversos.',
        'edu-08-aria'        : 'Som Maior Música e Arte, abrir em nova aba',
        'edu-09-tag'         : 'JUL 2017 / SET 2020',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : 'Professor de música · guitarra, violão e outros instrumentos · part-time · Maringá, PR',
        'edu-09-desc'        : 'Aulas com foco prático, adaptadas ao objetivo de cada aluno, de iniciantes a repertório e técnica mais avançados, com teoria como apoio quando fazia sentido.',
        'edu-09-aria'        : 'Belas Artes, abrir em nova aba',
        'edu-10-tag'         : 'JUN 2018 / ABR 2019',
        'edu-10-title'       : 'Projeto de assistência social',
        'edu-10-role'        : 'Professor de música · idosos · part-time · Maringá, PR',
        'edu-10-desc'        : 'Música com foco em saúde e bem-estar: coordenação motora, memória, socialização e acolhimento. Instrumentos e atividades adaptados, apresentações em grupo e protagonismo dos participantes.',
        'edu-11-tag'         : 'MAR 2020 / DEZ 2020',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : 'Aulas coletivas de teclado e violão · part-time · Maringá, PR',
        'edu-11-desc'        : 'Turmas em grupo: prática colaborativa, níveis diferentes na mesma turma com adaptação contínua, ritmo, harmonia e repertório de forma acessível e dinâmica.',
        'edu-11-aria'        : 'Passantes e Pensantes, abrir em nova aba',
        'edu-12-tag'         : 'NOV 2021 / AGO 2023',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : 'Professor multinstrumental e teoria · part-time · Itajaí, SC',
        'edu-12-desc'        : 'Guitarra, piano, violão, cavaquinho, pandeiro, percussão, teclado, contrabaixo e teoria musical para várias idades e níveis, técnica, repertório, percepção e ritmo com didática clara.',
        'edu-12-aria'        : 'Estação da Música, abrir em nova aba',
        'edu-13-tag'         : 'JUN 2022 / DEZ 2022',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : 'Professor multinstrumental e teoria · part-time · Balneário Camboriú, SC',
        'edu-13-desc'        : 'Ensino multinstrumental e teoria: prática equilibrada com fundamentos teóricos, técnica, interpretação e adaptação a cada objetivo.',
        'edu-13-aria'        : 'Centro Musicall, abrir em nova aba',
        'ch01-tag'           : 'CAPÍTULO 01',
        'ch01-title'         : 'Onde tudo<br><span class="tl-title-accent">começou.</span>',
        'ch01-desc'          : 'Antes dos lançamentos, dos suportes e dos palcos, existia apenas uma ideia clara: criar algo autêntico. Em 2024, Quint iniciou sua jornada na música eletrônica com uma proposta direta, unir groove, atmosfera e identidade em cada track. Em pouco tempo, o que era começo virou movimento. Lançamentos, conexões e suporte de artistas começaram a surgir, mostrando que o som já tinha direção. A história não começou há anos. Ela começou agora, e já está em movimento.',
        'ch02-tag'           : 'CAPÍTULO 02',
        'ch02-title'         : 'O som que<br><span class="tl-title-accent">chegou.</span>',
        
        'ch02-desc'          : 'Em pouco tempo, Quint começou a consolidar sua presença na cena underground com lançamentos por selos como Cuff, Muzenga Records, Player One Records e Indie Beats. Suas produções rapidamente chamaram atenção, recebendo suporte de artistas como Amine Edge, Jessika Branka, Deeper Purpose, Kolombo, Loulou Players, BRN, entre outros nomes relevantes da cena internacional. Mais do que números, esse momento marcou a construção de uma identidade sonora sólida, baseada em groove, atmosfera e energia de pista.',
        'ch03-tag'           : 'CAPÍTULO 03',
        'tension-e'          : 'E',
        'tension-phrase'     : ' onde estou',
        'tension-now'        : 'AGORA??',
        'tension-sub'        : 'A resposta está abaixo.',
        'ch04-tag'           : 'CAPÍTULO 03',
        'ch04-year'          : '2025 / HOJE',
        'ch04-title'         : 'Novo<br><span class="tl-title-accent">Ciclo.</span>',
        'ch04-quote'         : 'O que começou como visão, hoje é direção.<br>Tudo que eu imaginei já está em movimento e eu estou só acelerando rumo a algo muito maior.',
        'sobre-tag'          : 'SOBRE',
        'sobre-title'        : 'De guitarra em mãos<br><span class="text-glow">à pista de dança</span>',
        'sobre-p1'           : 'Desde os 8 anos a música faz parte da minha vida. Cresci tocando guitarra e violão por influência do meu pai e do meu tio, ambos guitarristas, e esse contato precoce moldou minha relação com o som. Com o tempo, meu gosto foi migrando para a música eletrônica, e a pista de dança virou o meu lugar.',
        'sobre-p2'           : 'Foi ao lado de amigos DJs que descobri uma perspectiva completamente diferente da música, a de cima do palco. Ver a galera responder a um set me deu uma emoção que nunca tinha sentido, e foi ali que pensei: por que não eu?',
        'sobre-p3'           : 'Em 2024 comecei a explorar o Ableton, desenvolvi meu som e, em apenas 6 meses de produção, enviei uma track para o Amine Edge. Ele passou a me dar suporte, incluindo ao vivo na Park Art, e aquele momento mudou tudo. Logo veio meu primeiro lançamento pela Cuff, que foi um marco real na minha carreira.',
        'sobre-p4'           : 'A partir daí as coisas se aceleraram: novos contratos, suportes de nomes relevantes da cena, formação em mixagem pela Volare em 2025 e chamadas para eventos como Fire Music, aniversário do Estúdio Mixar, Summer Festival e Night Vision.',
        'sobre-p5'           : 'Recentemente me classifiquei em 2º lugar para a final do Circuito, o maior campeonato de DJs do Brasil, promovido pela Park Art. Cada passo vem confirmando que o caminho é esse, e que tudo depende do esforço.',
        'lugares-tag'        : 'PALCO &amp; EVENTOS',
        'lugares-title'      : 'Principais palcos onde<br><span class="text-glow">já me apresentei</span>',
        'dl-tag'             : 'MATERIAL DE IMPRENSA',
        'dl-title'           : 'Fotos em <span class="text-glow">alta qualidade</span>',
        'dl-desc'            : 'Baixe individualmente ou o pacote completo sem perda de qualidade.',
        'dl-cta'             : 'Baixar todas as fotos (.zip)',
        'dl-zip-note'        : 'O pacote são 3 arquivos .zip (~194 MB no total). Um clique inicia os três downloads, o navegador pode pedir permissão para vários arquivos.',
        'dl-cta-zip-all'     : 'Baixar pacote completo (3 .zip)',
        'dl-btn'             : 'Baixar',
        'dl-tab-photos'      : 'Minhas fotos',
        'dl-tab-logo'        : 'Logo',
        'dl-logo-tag'        : 'LOGO OFICIAL',
        'dl-logo-title'      : 'Logo oficial para midia e contratantes',
        'dl-logo-desc'       : 'Baixe a logo oficial separada das fotos para aplicar em flyers, lineups, artes e materiais de divulgacao.',
        'dl-logo-btn'        : 'Baixar logo (.png)',
        'fs-tag': 'DESTAQUE',
        'fs-new': 'GRAVADO',
        'fs-title1': 'APRESENTAÇÃO',
        'fs-subtitle': '2026',
        'fs-desc': 'Apresentação no Park Art, uma das principais referencias da cena Minimal Bass no Brasil. Pressao de pista do comeco ao fim.',
        'fs-listen': 'Assistir no YouTube',
        'music-tag'          : 'OUÇA',
        'music-title'        : 'Músicas &amp; <span class="text-glow">Releases</span>',
        'music-desc'         : 'Explore os sets e lançamentos nas plataformas',
        'tab-autorais'       : 'Autorais',
        'tab-sets'           : 'Sets',
        'tab-youtube'        : 'Vídeo',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : 'Ver no YouTube',
        'sc-cta'             : 'Ver todos no SoundCloud',
        'spotify-cta'        : 'Ver discografia completa no Spotify',
        'platforms-label'    : 'Também disponível em',
        'booking-tag'        : 'CONTATO',
        'booking-title'      : 'Pronto para<br><span class="text-glow">levar ao limite?</span>',
        'booking-desc'       : 'Disponível para clubs, eventos e festivais.<br>Entre em contato e vamos criar algo memorável.',
        'available-private'  : 'Eventos Privados',
        'footer-tagline'     : 'Energia crua. Pressão de pista.<br>Som sem concessões.',
        'footer-nav-heading' : 'Navegação',
        'footer-sobre'       : 'Sobre',
        'footer-musicas'     : 'Músicas',
        'footer-social-heading': 'Redes Sociais',
        'footer-copy'        : '© 2026 QUINT. Todos os direitos reservados.',
        'footer-credit-text' : 'Site desenvolvido por',
    },
    en: {
        'nav-historia'       : 'History',
        'nav-sobre'          : 'About',
        'nav-musicas'        : 'Music',
        'nav-drops'          : 'Drops',
        'drops-tag'          : 'ELECTRONIC',
        'nav-autorais'       : 'Originals',
        'autorais-tag'       : 'ORIGINALS',
        'drops-sub'          : 'Maximum energy. Click to watch.',
        'hero-desc'          : 'Sets built from musical identity.<br>Every track, a story. Every drop, an experience.',
        'hero-listen'        : 'Listen Now',
        'badge-pressure'     : 'Floor Pressure',
        'tl-section-tag'     : 'THE STORY',
        'tl-section-title'   : 'A journey of <span class="text-glow">20 years</span>',
        'tl-tab-performance' : 'Stage performance',
        'tl-tab-education'   : 'Music education',
        'edu-01-tag'         : 'AUG 2015 / NOV 2015',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : 'Guitar & acoustic guitar teacher · Maringá, PR',
        'edu-01-desc'        : 'Where I started teaching: students at different levels, with a light, hands-on, close approach, building pedagogy and motivation from the first contact with the instrument.',
        'edu-01-aria'        : 'Tok Music, open in new tab',
        'edu-02-tag'         : 'FEB 2016 / JUL 2016',
        'edu-02-title'       : 'Universidade Estadual de Maringá',
        'edu-02-role'        : 'Extension project · Colégio de Aplicação Pedagógica (CAP)',
        'edu-02-desc'        : 'Work during my Music degree: music education in a school setting, perception, rhythm and instruments, aligned with the extension project’s pedagogy.',
        'edu-02-aria'        : 'CAP UEM, open in new tab',
        'edu-03-tag'         : 'JUL 2016 / NOV 2016',
        'edu-03-title'       : 'Alberto Jackson Byington Junior State School',
        'edu-03-role'        : 'Music teacher · extension project · Maringá, PR',
        'edu-03-desc'        : 'Music teaching in public schools, adapting content to students’ levels and connecting degree theory with classroom practice.',
        'edu-03-aria'        : 'Byington Junior school, open in new tab',
        'edu-04-tag'         : 'OCT 2016 / AUG 2018',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : 'Freelance teacher · guitar, acoustic bass & cavaquinho',
        'edu-04-desc'        : 'Private lessons for different goals and profiles, emphasis on practice and repertoire, using theory as support when it made sense for each student.',
        'edu-04-aria'        : 'Art Musica, open in new tab',
        'edu-05-tag'         : 'JAN 2017 / NOV 2017',
        'edu-05-title'       : 'Victor Beloti Municipal School',
        'edu-05-role'        : 'Internship · music education · part-time · Maringá, PR',
        'edu-05-desc'        : 'Public-school internship with pedagogical mentoring: planning, leading classes, and building perception and rhythm with instruments.',
        'edu-05-aria'        : 'Victor Beloti school, open in new tab',
        'edu-06-tag'         : 'JAN 2017 / JUL 2019',
        'edu-06-title'       : 'Jardim Independência State School',
        'edu-06-role'        : 'Internship · music teacher · part-time · Maringá, PR',
        'edu-06-desc'        : 'Final-year Music degree internship: autonomy in the classroom, lesson planning, and tracking students’ progress in school music education.',
        'edu-06-aria'        : 'Jardim Independência school, open in new tab',
        'edu-07-tag'         : 'FEB 2017 / NOV 2017',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : 'Early childhood music education · babies · Maringá, PR',
        'edu-07-desc'        : 'Work with infants: sound stimuli, rhythm, movement and playful experiences, with sensitivity, family connection, and a non-traditional technical approach.',
        'edu-07-aria'        : 'Ateliê Da Criança, open in new tab',
        'edu-08-tag'         : 'APR 2017 / OCT 2019',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : 'Teacher · guitar, acoustic bass & cavaquinho · Maringá, PR',
        'edu-08-desc'        : 'Lessons focused on practice and each student’s goals, from technique to repertoire, building versatility and diverse audiences.',
        'edu-08-aria'        : 'Som Maior Música e Arte, open in new tab',
        'edu-09-tag'         : 'JUL 2017 / SEP 2020',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : 'Music teacher · guitar, acoustic & other instruments · part-time · Maringá, PR',
        'edu-09-desc'        : 'Practice-focused lessons tailored to each student, from beginners to advanced repertoire and technique, with theory as support when needed.',
        'edu-09-aria'        : 'Belas Artes, open in new tab',
        'edu-10-tag'         : 'JUN 2018 / APR 2019',
        'edu-10-title'       : 'Social outreach project',
        'edu-10-role'        : 'Music teacher · seniors · part-time · Maringá, PR',
        'edu-10-desc'        : 'Music for health and wellbeing: motor coordination, memory, social connection and care. Adapted instruments and activities, group performances and participant agency.',
        'edu-11-tag'         : 'MAR 2020 / DEC 2020',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : 'Group keyboard & guitar classes · part-time · Maringá, PR',
        'edu-11-desc'        : 'Group classes: collaborative practice, mixed levels in one room with ongoing adaptation, rhythm, harmony and repertoire in an accessible, dynamic way.',
        'edu-11-aria'        : 'Passantes e Pensantes, open in new tab',
        'edu-12-tag'         : 'NOV 2021 / AUG 2023',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : 'Multi-instrument & theory teacher · part-time · Itajaí, SC',
        'edu-12-desc'        : 'Guitar, piano, acoustic, cavaquinho, pandeiro, percussion, keys, bass and theory for different ages and levels, technique, repertoire, ear training and rhythm with clear teaching.',
        'edu-12-aria'        : 'Estação da Música, open in new tab',
        'edu-13-tag'         : 'JUN 2022 / DEC 2022',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : 'Multi-instrument & theory teacher · part-time · Balneário Camboriú, SC',
        'edu-13-desc'        : 'Multi-instrument and theory: balanced practice with fundamentals, technique, interpretation and goals tailored to each student.',
        'edu-13-aria'        : 'Centro Musicall, open in new tab',
        'ch01-tag'           : 'CHAPTER 01',
        'ch01-title'         : 'Where it all<br><span class="tl-title-accent">began.</span>',
        'ch01-desc'          : 'Before the releases, the support and the stages, there was just one clear idea: create something authentic. In 2024, Quint began his journey in electronic music with a direct purpose, merging groove, atmosphere and identity into every track. Before long, what started as a beginning became a movement. Releases, connections and support from artists began to emerge, showing the sound already had direction. The story did not start years ago. It started now, and it is already in motion.',
        'ch02-tag'           : 'CHAPTER 02',
        'ch02-title'         : 'The sound that<br><span class="tl-title-accent">arrived.</span>',
        
        'ch02-desc'          : 'In a short time, Quint began to consolidate his presence in the underground scene with releases on labels such as Cuff, Muzenga Records, Player One Records and Indie Beats. His productions quickly gained attention, receiving support from artists like Amine Edge, Jessika Branka, Deeper Purpose, Kolombo, Loulou Players, BRN, among other relevant names in the international scene. More than numbers, this moment marked the building of a solid sonic identity, rooted in groove, atmosphere and dancefloor energy.',
        'ch03-tag'           : 'CHAPTER 03',
        'tension-e'          : 'And',
        'tension-phrase'     : ' where am I',
        'tension-now'        : 'NOW??',
        'tension-sub'        : 'The answer is below.',
        'ch04-tag'           : 'CHAPTER 03',
        'ch04-year'          : '2025, TODAY',
        'ch04-title'         : 'New<br><span class="tl-title-accent">Cycle.</span>',
        'ch04-quote'         : 'What started as vision is now direction.<br>Everything I imagined is already in motion, and I\'m just accelerating toward something much greater.',
        'sobre-tag'          : 'ABOUT',
        'sobre-title'        : 'From guitar in hand<br><span class="text-glow">to the dancefloor</span>',
        'sobre-p1'           : 'Music has been part of my life since I was 8 years old. I grew up playing guitar influenced by my father and uncle, both guitarists, and that early connection shaped my relationship with sound. Over time my taste shifted to electronic music, and the dancefloor became my place.',
        'sobre-p2'           : 'It was alongside DJ friends that I discovered a completely different perspective on music, from the stage. Watching a crowd respond to a set gave me a feeling I had never felt before, and that\'s when I thought: why not me?',
        'sobre-p3'           : 'In 2024 I started exploring Ableton, developed my sound, and within just 6 months of producing I sent a track to Amine Edge. He started supporting it, including live at Park Art, and that moment changed everything. My first release followed on Cuff, which was a real milestone in my career.',
        'sobre-p4'           : 'From there things accelerated: new deals, support from key names in the scene, mixing training at Volare in 2025, and bookings for events like Fire Music, Estúdio Mixar\'s anniversary, Summer Festival, and Night Vision.',
        'sobre-p5'           : 'I recently qualified in 2nd place for the final of Circuito, Brazil\'s biggest DJ competition, organized by Park Art. Every step confirms this is the right path, and that everything depends on the effort you put in.',
        'lugares-tag'        : 'STAGE &amp; EVENTS',
        'lugares-title'      : 'Main stages where<br><span class="text-glow">I\'ve performed</span>',
        'dl-tag'             : 'PRESS MATERIAL',
        'dl-title'           : 'Photos in <span class="text-glow">high quality</span>',
        'dl-desc'            : 'Download individually or the full package without quality loss.',
        'dl-cta'             : 'Download all photos (.zip)',
        'dl-zip-note'        : 'The package is 3 .zip files (~194 MB total). One click starts all three, your browser may ask to allow multiple downloads.',
        'dl-cta-zip-all'     : 'Download full package (3 .zip)',
        'dl-btn'             : 'Download',
        'dl-tab-photos'      : 'My photos',
        'dl-tab-logo'        : 'Logo',
        'dl-logo-tag'        : 'OFFICIAL LOGO',
        'dl-logo-title'      : 'Official logo for media and bookers',
        'dl-logo-desc'       : 'Download the official logo separately from photos for flyers, lineups, artworks and promo materials.',
        'dl-logo-btn'        : 'Download logo (.png)',
        'fs-tag': 'FEATURED',
        'fs-new': 'RECORDED',
        'fs-title1': 'PERFORMANCE',
        'fs-subtitle': '2026',
        'fs-desc': 'Live performance at Park Art, one of the main Minimal Bass references in Brazil. Dance floor pressure from start to finish.',
        'fs-listen': 'Watch on YouTube',
        'music-tag'          : 'LISTEN',
        'music-title'        : 'Music &amp; <span class="text-glow">Releases</span>',
        'music-desc'         : 'Explore sets and releases on the platforms',
        'tab-autorais'       : 'Originals',
        'tab-sets'           : 'Sets',
        'tab-youtube'        : 'Video',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : 'Watch on YouTube',
        'sc-cta'             : 'See all on SoundCloud',
        'spotify-cta'        : 'See full discography on Spotify',
        'platforms-label'    : 'Also available on',
        'booking-tag'        : 'CONTACT',
        'booking-title'      : 'Ready to<br><span class="text-glow">push the limits?</span>',
        'booking-desc'       : 'Available for clubs, events and festivals.<br>Get in touch and let\'s create something memorable.',
        'available-private'  : 'Private Events',
        'footer-tagline'     : 'Raw energy. Floor pressure.<br>Sound without compromise.',
        'footer-nav-heading' : 'Navigation',
        'footer-sobre'       : 'About',
        'footer-musicas'     : 'Music',
        'footer-social-heading': 'Social Media',
        'footer-copy'        : '© 2026 QUINT. All rights reserved.',
        'footer-credit-text' : 'Website developed by',
    },
    es: {
        'nav-historia'       : 'Historia',
        'nav-sobre'          : 'Sobre',
        'nav-musicas'        : 'Música',
        'nav-drops'          : 'Drops',
        'drops-tag'          : 'ELECTRÓNICA',
        'nav-autorais'       : 'Originales',
        'autorais-tag'       : 'ORIGINALES',
        'drops-sub'          : 'Energía al máximo. Haz clic para ver.',
        'hero-desc'          : 'Sets construidos desde la identidad musical.<br>Cada pista, una historia. Cada drop, una experiencia.',
        'hero-listen'        : 'Escuchar Ahora',
        'badge-pressure'     : 'Presión de Pista',
        'tl-section-tag'     : 'LA HISTORIA',
        'tl-section-title'   : 'Un viaje de <span class="text-glow">20 años</span>',
        'tl-tab-performance' : 'Actuación en escena',
        'tl-tab-education'   : 'Educación musical',
        'edu-01-tag'         : 'AGO 2015 / NOV 2015',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : 'Profesor de guitarra y guitarra acústica · Maringá, PR',
        'edu-01-desc'        : 'Donde empecé a enseñar: alumnos de distintos niveles, enfoque ligero, práctico y cercano, desarrollando didáctica y motivación desde el primer contacto con el instrumento.',
        'edu-01-aria'        : 'Tok Music, abrir en nueva pestaña',
        'edu-02-tag'         : 'FEB 2016 / JUL 2016',
        'edu-02-title'       : 'Universidade Estadual de Maringá',
        'edu-02-role'        : 'Proyecto de extensión · Colégio de Aplicação Pedagógica (CAP)',
        'edu-02-desc'        : 'Actuación durante la licenciatura en Música: educación musical en contexto escolar, con percepción, ritmo e instrumentos, alineada con la propuesta del proyecto de extensión.',
        'edu-02-aria'        : 'CAP UEM, abrir en nueva pestaña',
        'edu-03-tag'         : 'JUL 2016 / NOV 2016',
        'edu-03-title'       : 'Colégio Estadual Alberto Jackson Byington Junior',
        'edu-03-role'        : 'Profesor de música · proyecto de extensión · Maringá, PR',
        'edu-03-desc'        : 'Enseñanza de música en escuela pública, adaptando contenidos al nivel del alumnado y conectando la teoría de la carrera con la práctica en sala.',
        'edu-03-aria'        : 'Colégio Byington Junior, abrir en nueva pestaña',
        'edu-04-tag'         : 'OCT 2016 / AGO 2018',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : 'Profesor freelance · guitarra, guitarra acústica, bajo y cavaquinho',
        'edu-04-desc'        : 'Clases particulares para distintos perfiles y objetivos, con énfasis en práctica y repertorio, usando la teoría como apoyo cuando tenía sentido para cada alumno.',
        'edu-04-aria'        : 'Art Musica, abrir en nueva pestaña',
        'edu-05-tag'         : 'ENE 2017 / NOV 2017',
        'edu-05-title'       : 'Escuela Municipal Victor Beloti',
        'edu-05-role'        : 'Prácticas · educación musical · tiempo parcial · Maringá, PR',
        'edu-05-desc'        : 'Prácticas en enseñanza pública con acompañamiento pedagógico: planificación, conducción de grupo y desarrollo de percepción y ritmo con instrumentos.',
        'edu-05-aria'        : 'Escuela Municipal Victor Beloti, abrir en nueva pestaña',
        'edu-06-tag'         : 'ENE 2017 / JUL 2019',
        'edu-06-title'       : 'Colégio Estadual do Jardim Independência',
        'edu-06-role'        : 'Prácticas · profesor de música · tiempo parcial · Maringá, PR',
        'edu-06-desc'        : 'Prácticas en el último año de la licenciatura en Música: autonomía en sala, planificación de clases y seguimiento del alumnado en educación musical escolar.',
        'edu-06-aria'        : 'Colégio Jardim Independência, abrir en nueva pestaña',
        'edu-07-tag'         : 'FEB 2017 / NOV 2017',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : 'Educación musical infantil · bebés · Maringá, PR',
        'edu-07-desc'        : 'Trabajo con primera infancia: estímulos sonoros, ritmos, movimientos y vivencias lúdicas, con sensibilidad, vínculo con las familias y enfoque fuera del modelo técnico tradicional.',
        'edu-07-aria'        : 'Ateliê Da Criança, abrir en nueva pestaña',
        'edu-08-tag'         : 'ABR 2017 / OCT 2019',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : 'Profesor · guitarra, guitarra acústica, bajo y cavaquinho · Maringá, PR',
        'edu-08-desc'        : 'Clases con enfoque práctico y adaptación al objetivo de cada alumno, de la base técnica al repertorio, reforzando versatilidad instrumental y perfiles diversos.',
        'edu-08-aria'        : 'Som Maior Música e Arte, abrir en nueva pestaña',
        'edu-09-tag'         : 'JUL 2017 / SEP 2020',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : 'Profesor de música · guitarra, guitarra acústica y otros instrumentos · tiempo parcial · Maringá, PR',
        'edu-09-desc'        : 'Clases prácticas adaptadas al objetivo de cada alumno, de principiantes a repertorio y técnica avanzados, con teoría como apoyo cuando tenía sentido.',
        'edu-09-aria'        : 'Belas Artes, abrir en nueva pestaña',
        'edu-10-tag'         : 'JUN 2018 / ABR 2019',
        'edu-10-title'       : 'Proyecto de asistencia social',
        'edu-10-role'        : 'Profesor de música · personas mayores · tiempo parcial · Maringá, PR',
        'edu-10-desc'        : 'Música centrada en salud y bienestar: coordinación motriz, memoria, socialización y acogida. Instrumentos y actividades adaptados, presentaciones en grupo y protagonismo de los participantes.',
        'edu-11-tag'         : 'MAR 2020 / DIC 2020',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : 'Clases colectivas de teclado y guitarra · tiempo parcial · Maringá, PR',
        'edu-11-desc'        : 'Grupos: práctica colaborativa, distintos niveles en la misma clase con adaptación continua, ritmo, armonía y repertorio de forma accesible y dinámica.',
        'edu-11-aria'        : 'Passantes e Pensantes, abrir en nueva pestaña',
        'edu-12-tag'         : 'NOV 2021 / AGO 2023',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : 'Profesor de multiinstrumento y teoría · tiempo parcial · Itajaí, SC',
        'edu-12-desc'        : 'Guitarra, piano, guitarra acústica, cavaquinho, pandeiro, percusión, teclado, bajo y teoría musical para todas las edades y niveles, técnica, repertorio, percepción y ritmo con didáctica clara.',
        'edu-12-aria'        : 'Estação da Música, abrir en nueva pestaña',
        'edu-13-tag'         : 'JUN 2022 / DIC 2022',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : 'Profesor de multiinstrumento y teoría · tiempo parcial · Balneário Camboriú, SC',
        'edu-13-desc'        : 'Enseñanza multiinstrumental y teoría: práctica equilibrada con fundamentos teóricos, técnica, interpretación y adaptación a cada objetivo.',
        'edu-13-aria'        : 'Centro Musicall, abrir en nueva pestaña',
        'ch01-tag'           : 'CAPÍTULO 01',
        'ch01-title'         : 'Donde todo<br><span class="tl-title-accent">comenzó.</span>',
        'ch01-desc'          : 'Antes de los lanzamientos, los apoyos y los escenarios, solo existía una idea clara: crear algo auténtico. En 2024, Quint inició su camino en la música electrónica con una propuesta directa, unir groove, atmósfera e identidad en cada track. En poco tiempo, lo que era un comienzo se convirtió en movimiento. Lanzamientos, conexiones y apoyos de artistas comenzaron a surgir, mostrando que el sonido ya tenía dirección. La historia no comenzó hace años. Comenzó ahora, y ya está en movimiento.',
        'ch02-tag'           : 'CAPÍTULO 02',
        'ch02-title'         : 'El sonido que<br><span class="tl-title-accent">llegó.</span>',
        
        'ch02-desc'          : 'En poco tiempo, Quint comenzó a consolidar su presencia en la escena underground con lanzamientos en sellos como Cuff, Muzenga Records, Player One Records e Indie Beats. Sus producciones rápidamente llamaron la atención, recibiendo apoyo de artistas como Amine Edge, Jessika Branka, Deeper Purpose, Kolombo, Loulou Players, BRN, entre otros nombres relevantes de la escena internacional. Más que números, ese momento marcó la construcción de una identidad sonora sólida, basada en groove, atmósfera y energía de pista.',
        'ch03-tag'           : 'CAPÍTULO 03',
        'tension-e'          : 'Y',
        'tension-phrase'     : ' dónde estoy',
        'tension-now'        : '¿AHORA??',
        'tension-sub'        : 'La respuesta está abajo.',
        'ch04-tag'           : 'CAPÍTULO 03',
        'ch04-year'          : '2025 / HOY',
        'ch04-title'         : 'Nuevo<br><span class="tl-title-accent">Ciclo.</span>',
        'ch04-quote'         : 'Lo que empezó como visión, hoy es dirección.<br>Todo lo que imaginé ya está en movimiento y solo acelero hacia algo mucho más grande.',
        'sobre-tag'          : 'SOBRE',
        'sobre-title'        : 'De guitarra en mano<br><span class="text-glow">a la pista de baile</span>',
        'sobre-p1'           : 'La música forma parte de mi vida desde los 8 años. Crecí tocando guitarra bajo la influencia de mi padre y mi tío, ambos guitarristas, y ese contacto temprano moldeó mi relación con el sonido. Con el tiempo mi gusto se fue inclinando hacia la música electrónica, y la pista de baile se convirtió en mi lugar.',
        'sobre-p2'           : 'Fue junto a amigos DJs que descubrí una perspectiva completamente distinta de la música, desde el escenario. Ver a la gente reaccionar a un set me generó una emoción que nunca había sentido, y fue ahí donde pensé: ¿por qué no yo?',
        'sobre-p3'           : 'En 2024 comencé a explorar Ableton, desarrollé mi sonido y, en apenas 6 meses de producción, envié un track a Amine Edge. Él comenzó a apoyarlo, incluso en vivo en Park Art, y ese momento lo cambió todo. Poco después llegó mi primer lanzamiento por Cuff, un hito real en mi carrera.',
        'sobre-p4'           : 'A partir de ahí las cosas se aceleraron: nuevos contratos, apoyo de nombres relevantes de la escena, formación en mezcla por Volare en 2025 y presentaciones en eventos como Fire Music, el aniversario de Estúdio Mixar, Summer Festival y Night Vision.',
        'sobre-p5'           : 'Recientemente me clasifiqué en 2.º lugar para la final del Circuito, el mayor campeonato de DJs de Brasil, organizado por Park Art. Cada paso confirma que este es el camino correcto, y que todo depende del esfuerzo.',
        'lugares-tag'        : 'ESCENARIO &amp; EVENTOS',
        'lugares-title'      : 'Principales escenarios donde<br><span class="text-glow">me he presentado</span>',
        'dl-tag'             : 'MATERIAL DE PRENSA',
        'dl-title'           : 'Fotos en <span class="text-glow">alta calidad</span>',
        'dl-desc'            : 'Descarga individualmente o el paquete completo sin pérdida de calidad.',
        'dl-cta'             : 'Descargar todas las fotos (.zip)',
        'dl-zip-note'        : 'El paquete son 3 archivos .zip (~194 MB en total). Un clic inicia las tres descargas, el navegador puede pedir permiso.',
        'dl-cta-zip-all'     : 'Descargar paquete completo (3 .zip)',
        'dl-btn'             : 'Descargar',
        'dl-tab-photos'      : 'Mis fotos',
        'dl-tab-logo'        : 'Logo',
        'dl-logo-tag'        : 'LOGO OFICIAL',
        'dl-logo-title'      : 'Logo oficial para prensa y bookers',
        'dl-logo-desc'       : 'Descarga el logo oficial separado de las fotos para usar en flyers, lineups, artes y materiales promocionales.',
        'dl-logo-btn'        : 'Descargar logo (.png)',
        'fs-tag': 'DESTACADO',
        'fs-new': 'GRABADO',
        'fs-title1': 'PRESENTACIÓN',
        'fs-subtitle': '2026',
        'fs-desc': 'Presentación en Park Art, una de las principales referencias del Minimal Bass en Brasil. Presión de pista de principio a fin.',
        'fs-listen': 'Ver en YouTube',
        'music-tag'          : 'ESCUCHA',
        'music-title'        : 'Música &amp; <span class="text-glow">Releases</span>',
        'music-desc'         : 'Explora los sets y lanzamientos en las plataformas',
        'tab-autorais'       : 'Originales',
        'tab-sets'           : 'Sets',
        'tab-youtube'        : 'Video',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : 'Ver en YouTube',
        'sc-cta'             : 'Ver todos en SoundCloud',
        'spotify-cta'        : 'Ver discografía completa en Spotify',
        'platforms-label'    : 'También disponible en',
        'booking-tag'        : 'CONTACTO',
        'booking-title'      : 'Listo para<br><span class="text-glow">llevar al límite?</span>',
        'booking-desc'       : 'Disponible para clubs, eventos y festivales.<br>Contáctame y creemos algo memorable.',
        'available-private'  : 'Eventos Privados',
        'footer-tagline'     : 'Energía cruda. Presión de pista.<br>Sonido sin concesiones.',
        'footer-nav-heading' : 'Navegación',
        'footer-sobre'       : 'Sobre',
        'footer-musicas'     : 'Música',
        'footer-social-heading': 'Redes Sociales',
        'footer-copy'        : '© 2026 QUINT. Todos los derechos reservados.',
        'footer-credit-text' : 'Sitio desarrollado por',
    },
    zh: {
        'nav-historia'       : '历程',
        'nav-sobre'          : '关于',
        'nav-musicas'        : '音乐',
        'nav-drops'          : 'Drops',
        'drops-tag'          : '电子音乐',
        'nav-autorais'       : '原创',
        'autorais-tag'       : '原创音乐',
        'drops-sub'          : '能量拉满。点击观看。',
        'hero-desc'          : '从音乐身份构建的曲目集。<br>每首曲目，一个故事。每次降拍，一次体验。',
        'hero-listen'        : '立即收听',
        'badge-pressure'     : '舞台张力',
        'tl-section-tag'     : '历程',
        'tl-section-title'   : '20年的<span class="text-glow">旅程</span>',
        'tl-tab-performance' : '舞台演出',
        'tl-tab-education'   : '音乐教育',
        'edu-01-tag'         : '2015年8月 / 2015年11月',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : '吉他教师 · 马林加，巴拉那州',
        'edu-01-desc'        : '我开始教学的地方：不同水平的学员，轻松、务实、贴近的教学方式，从第一次接触乐器就培养教学法与动力。',
        'edu-01-aria'        : 'Tok Music, 在新标签页打开',
        'edu-02-tag'         : '2016年2月 / 2016年7月',
        'edu-02-title'       : '马林加州立大学（Universidade Estadual de Maringá）',
        'edu-02-role'        : '推广项目 · 教育应用学校（CAP）',
        'edu-02-desc'        : '音乐本科期间：学校环境下的音乐教育，包括听觉、节奏与乐器，与推广项目的教学理念一致。',
        'edu-02-aria'        : 'CAP UEM, 在新标签页打开',
        'edu-03-tag'         : '2016年7月 / 2016年11月',
        'edu-03-title'       : 'Alberto Jackson Byington Junior 州立中学',
        'edu-03-role'        : '音乐教师 · 推广项目 · 马林加，巴拉那州',
        'edu-03-desc'        : '公立学校音乐教学，根据学生程度调整内容，将本科理论联系课堂实践。',
        'edu-03-aria'        : 'Byington Junior 学校, 在新标签页打开',
        'edu-04-tag'         : '2016年10月 / 2018年8月',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : '自由教师 · 吉他、木吉他、贝斯与卡瓦奎尼奥',
        'edu-04-desc'        : '针对不同目标与学员的一对一课程，强调实践与曲目，必要时辅以理论。',
        'edu-04-aria'        : 'Art Musica, 在新标签页打开',
        'edu-05-tag'         : '2017年1月 / 2017年11月',
        'edu-05-title'       : 'Victor Beloti 市立学校',
        'edu-05-role'        : '实习 · 音乐教育 · 兼职 · 马林加，巴拉那州',
        'edu-05-desc'        : '公立学校实习，带教学辅导：备课、课堂组织与用乐器培养听觉与节奏。',
        'edu-05-aria'        : 'Victor Beloti 学校, 在新标签页打开',
        'edu-06-tag'         : '2017年1月 / 2019年7月',
        'edu-06-title'       : 'Jardim Independência 州立中学',
        'edu-06-role'        : '实习 · 音乐教师 · 兼职 · 马林加，巴拉那州',
        'edu-06-desc'        : '音乐本科最后一年实习：课堂自主、课程规划与跟踪学生在校音乐教育中的进展。',
        'edu-06-aria'        : 'Jardim Independência 学校, 在新标签页打开',
        'edu-07-tag'         : '2017年2月 / 2017年11月',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : '幼儿音乐教育 · 婴儿 · 马林加，巴拉那州',
        'edu-07-desc'        : '面向婴幼儿：声音刺激、节奏、动作与游戏化体验，注重家庭连结与非传统技术路线。',
        'edu-07-aria'        : 'Ateliê Da Criança, 在新标签页打开',
        'edu-08-tag'         : '2017年4月 / 2019年10月',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : '教师 · 吉他、木吉他、贝斯与卡瓦奎尼奥 · 马林加，巴拉那州',
        'edu-08-desc'        : '以实践为目标、因人而异的课程，从基础技术到曲目，培养多面手与多样学员。',
        'edu-08-aria'        : 'Som Maior Música e Arte, 在新标签页打开',
        'edu-09-tag'         : '2017年7月 / 2020年9月',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : '音乐教师 · 吉他、木吉他及其他乐器 · 兼职 · 马林加，巴拉那州',
        'edu-09-desc'        : '注重实践的课程，按目标调整，从初学者到进阶曲目与技术，需要时辅以理论。',
        'edu-09-aria'        : 'Belas Artes, 在新标签页打开',
        'edu-10-tag'         : '2018年6月 / 2019年4月',
        'edu-10-title'       : '社会援助项目',
        'edu-10-role'        : '音乐教师 · 长者 · 兼职 · 马林加，巴拉那州',
        'edu-10-desc'        : '以健康与福祉为重的音乐：运动协调、记忆、社交与关怀。适配的乐器与活动、小组演出与参与者主体性。',
        'edu-11-tag'         : '2020年3月 / 2020年12月',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : '键盘与吉他集体课 · 兼职 · 马林加，巴拉那州',
        'edu-11-desc'        : '小组课：协作练习、同班混龄与持续调整，节奏、和声与曲目，轻松而有活力。',
        'edu-11-aria'        : 'Passantes e Pensantes, 在新标签页打开',
        'edu-12-tag'         : '2021年11月 / 2023年8月',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : '多乐器与乐理教师 · 兼职 · 伊塔雅伊，圣卡塔琳娜州',
        'edu-12-desc'        : '吉他、钢琴、木吉他、卡瓦奎尼奥、铃鼓、打击、键盘、低音与乐理，面向不同年龄与水平，技术、曲目、听觉与节奏，教学清晰。',
        'edu-12-aria'        : 'Estação da Música, 在新标签页打开',
        'edu-13-tag'         : '2022年6月 / 2022年12月',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : '多乐器与乐理教师 · 兼职 · 巴尔内阿里奥坎博里乌，圣卡塔琳娜州',
        'edu-13-desc'        : '多乐器与乐理：实践与基础理论平衡，技术、诠释与目标因人而异。',
        'edu-13-aria'        : 'Centro Musicall, 在新标签页打开',
        'ch01-tag'           : '第一章',
        'ch01-title'         : '一切<br><span class="tl-title-accent">开始的地方。</span>',
        'ch01-desc'          : '在发行、支持和舞台之前，只有一个清晰的想法：创造真实的东西。2024年，Quint开始了他在电子音乐中的旅程，目标明确, 将groove、氛围和身份融入每首作品。不久之后，起点变成了运动。发行、联系和艺术家的支持开始涌现，证明音乐已有方向。这个故事不是从多年前开始的。它现在才开始, 而且已经在运动中。',
        'ch02-tag'           : '第二章',
        'ch02-title'         : '到来的<br><span class="tl-title-accent">声音。</span>',
        
        'ch02-desc'          : '在短时间内，Quint开始在地下圈巩固自己的存在，在Cuff、Muzenga Records、Player One Records和Indie Beats等厂牌发行音乐。他的制作迅速引起关注，获得了Amine Edge、Jessika Branka、Deeper Purpose、Kolombo、Loulou Players、BRN等国际圈内重要艺术家的支持。这一刻不只是数字，更标志着一种扎实音乐身份的建立, 以groove、氛围和舞池能量为基础。',
        'ch03-tag'           : '第三章',
        'tension-e'          : '而',
        'tension-phrase'     : ' 我现在在哪里',
        'tension-now'        : '现在？？',
        'tension-sub'        : '答案就在下面。',
        'ch04-tag'           : '第三章',
        'ch04-year'          : '2025 / 至今',
        'ch04-title'         : '新<br><span class="tl-title-accent">篇章。</span>',
        'ch04-quote'         : '始于愿景，如今是方向。<br>我想象的一切已在路上，我正加速奔向更远大的东西。',
        'sobre-tag'          : '关于',
        'sobre-title'        : '从吉他到<br><span class="text-glow">舞池之间</span>',
        'sobre-p1'           : '从8岁起，音乐就是我生活的一部分。在父亲和叔叔，两位吉他手，的影响下，我从小就接触吉他与古典吉他，这段经历塑造了我对声音的感知。随着时间推移，我的兴趣逐渐转向电子音乐，舞池成了我真正的归处。',
        'sobre-p2'           : '在 DJ 朋友们的陪伴下，我从台上的视角重新认识了音乐。看着观众回应一段 set，那种情绪前所未有，正是在那一刻，我心想：为什么不能是我？',
        'sobre-p3'           : '2024年，我开始探索 Ableton，磨练自己的声音。仅仅制作了6个月，我便将一首作品发给了 Amine Edge，他开始为我的音乐站台，包括在 Park Art 的现场。那一刻改变了一切。随后，我的首张发行登陆 Cuff，成为职业生涯真正的转折点。',
        'sobre-p4'           : '此后一切开始加速：新的合作合约、圈内重要人物的支持、2025年在 Volare 完成混音课程，并受邀参加 Fire Music、Estúdio Mixar 周年庆、Summer Festival 和 Night Vision 等活动。',
        'sobre-p5'           : '我近期以第二名的成绩晋级 Circuito 总决赛，这是巴西规模最大的 DJ 大赛，由 Park Art 主办。每一步都在证明，这条路是对的，而一切都取决于你愿意付出多少努力。',
        'lugares-tag'        : '舞台 &amp; 演出',
        'lugares-title'      : '主要登台<br><span class="text-glow">演出场地</span>',
        'dl-tag'             : '媒体素材',
        'dl-title'           : '高清<span class="text-glow">照片素材</span>',
        'dl-desc'            : '单独下载或下载完整套装，无损画质。',
        'dl-cta'             : '下载所有照片（.zip）',
        'dl-zip-note'        : '完整套装为 3 个 .zip（合计约 194 MB）。一次点击会依次开始下载, 浏览器可能询问是否允许多文件下载。',
        'dl-cta-zip-all'     : '下载完整套装（3 个 .zip）',
        'dl-btn'             : '下载',
        'dl-tab-photos'      : '我的照片',
        'dl-tab-logo'        : 'Logo',
        'dl-logo-tag'        : '官方 LOGO',
        'dl-logo-title'      : '面向演出方与媒体的官方 Logo',
        'dl-logo-desc'       : '将官方 logo 与照片分开下载，用于海报、阵容图与宣传物料。',
        'dl-logo-btn'        : '下载 logo (.png)',
        'fs-tag': '精选',
        'fs-new': '录制',
        'fs-title1': '演出',
        'fs-subtitle': '2026',
        'fs-desc': '在Park Art的现场演出，巴西Minimal Bass的重要阵地。从头到尾充满舞池压迫感。',
        'fs-listen': '在 YouTube 观看',
        'music-tag'          : '收听',
        'music-title'        : '音乐 &amp; <span class="text-glow">发行</span>',
        'music-desc'         : '在各平台探索曲目集和发行作品',
        'tab-autorais'       : '原创作品',
        'tab-sets'           : 'Set',
        'tab-youtube'        : '视频',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : '在 YouTube 观看',
        'sc-cta'             : '在SoundCloud查看全部',
        'spotify-cta'        : '在Spotify查看完整唱片目录',
        'platforms-label'    : '还可在以下平台收听',
        'booking-tag'        : '联系',
        'booking-title'      : '准备好<br><span class="text-glow">突破极限了吗？</span>',
        'booking-desc'       : '可接受俱乐部、活动和音乐节演出邀约。<br>联系我，一起创造难忘的体验。',
        'available-private'  : '私人活动',
        'footer-tagline'     : '原始能量。舞台张力。<br>纯粹的声音。',
        'footer-nav-heading' : '导航',
        'footer-sobre'       : '关于',
        'footer-musicas'     : '音乐',
        'footer-social-heading': '社交媒体',
        'footer-copy'        : '© 2026 QUINT. 保留所有权利。',
        'footer-credit-text' : '网站开发者',
    },
    de: {
        'nav-historia'       : 'Geschichte',
        'nav-sobre'          : 'Über mich',
        'nav-musicas'        : 'Musik',
        'nav-drops'          : 'Drops',
        'drops-tag'          : 'ELEKTRONIK',
        'nav-autorais'       : 'Eigene',
        'autorais-tag'       : 'EIGENE TRACKS',
        'drops-sub'          : 'Volle Energie. Klicken zum Ansehen.',
        'hero-desc'          : 'Sets aufgebaut aus musikalischer Identität.<br>Jeder Track, eine Geschichte. Jeder Drop, ein Erlebnis.',
        'hero-listen'        : 'Jetzt hören',
        'badge-pressure'     : 'Floor-Druck',
        'tl-section-tag'     : 'DIE GESCHICHTE',
        'tl-section-title'   : 'Eine Reise von <span class="text-glow">20 Jahren</span>',
        'tl-tab-performance' : 'Auf der Bühne',
        'tl-tab-education'   : 'Musikpädagogik',
        'edu-01-tag'         : 'AUG 2015 / NOV 2015',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : 'Gitarre- & Akustikgitarrenlehrer · Maringá, PR',
        'edu-01-desc'        : 'Wo ich mit dem Unterricht begann: unterschiedliche Niveaus, leichter, praxisnaher, persönlicher Ansatz, Didaktik und Motivation vom ersten Kontakt mit dem Instrument an.',
        'edu-01-aria'        : 'Tok Music, in neuem Tab öffnen',
        'edu-02-tag'         : 'FEB 2016 / JUL 2016',
        'edu-02-title'       : 'Universidade Estadual de Maringá',
        'edu-02-role'        : 'Erweiterungsprojekt · Colégio de Aplicação Pedagógica (CAP)',
        'edu-02-desc'        : 'Tätigkeit während des Musikstudiums: musikalische Bildung in der Schule, Wahrnehmung, Rhythmus und Instrumente, im Einklang mit der Projektpädagogik.',
        'edu-02-aria'        : 'CAP UEM, in neuem Tab öffnen',
        'edu-03-tag'         : 'JUL 2016 / NOV 2016',
        'edu-03-title'       : 'Staatliche Schule Alberto Jackson Byington Junior',
        'edu-03-role'        : 'Musiklehrer · Erweiterungsprojekt · Maringá, PR',
        'edu-03-desc'        : 'Musikunterricht in öffentlichen Schulen, Inhalte an das Niveau angepasst und Studientheorie mit Unterrichtspraxis verbunden.',
        'edu-03-aria'        : 'Byington Junior, in neuem Tab öffnen',
        'edu-04-tag'         : 'OKT 2016 / AUG 2018',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : 'Freiberuflicher Lehrer · Gitarre, Akustik, Bass & Cavaquinho',
        'edu-04-desc'        : 'Einzelunterricht für verschiedene Ziele und Profile, Schwerpunkt Praxis und Repertoire, Theorie als Stütze wenn sinnvoll.',
        'edu-04-aria'        : 'Art Musica, in neuem Tab öffnen',
        'edu-05-tag'         : 'JAN 2017 / NOV 2017',
        'edu-05-title'       : 'Gemeinschaftsschule Victor Beloti',
        'edu-05-role'        : 'Praktikum · musikalische Bildung · Teilzeit · Maringá, PR',
        'edu-05-desc'        : 'Praktikum im öffentlichen Schulsystem mit pädagogischer Begleitung: Planung, Klassenführung, Wahrnehmung und Rhythmus mit Instrumenten.',
        'edu-05-aria'        : 'Victor Beloti, in neuem Tab öffnen',
        'edu-06-tag'         : 'JAN 2017 / JUL 2019',
        'edu-06-title'       : 'Staatliche Schule Jardim Independência',
        'edu-06-role'        : 'Praktikum · Musiklehrer · Teilzeit · Maringá, PR',
        'edu-06-desc'        : 'Praktikum im letzten Studienjahr: Eigenständigkeit im Unterricht, Stundenplanung und Begleitung der Schüler in schulischer Musikerziehung.',
        'edu-06-aria'        : 'Jardim Independência, in neuem Tab öffnen',
        'edu-07-tag'         : 'FEB 2017 / NOV 2017',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : 'Musik in der frühen Kindheit · Babys · Maringá, PR',
        'edu-07-desc'        : 'Arbeit mit Kleinkindern: Klänge, Rhythmus, Bewegung und Spiel, mit Sensibilität, Elternbezug und unkonventionellem Ansatz.',
        'edu-07-aria'        : 'Ateliê Da Criança, in neuem Tab öffnen',
        'edu-08-tag'         : 'APR 2017 / OKT 2019',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : 'Lehrer · Gitarre, Akustik, Bass & Cavaquinho · Maringá, PR',
        'edu-08-desc'        : 'Praxisorientierter Unterricht nach Zielen, von Technik bis Repertoire, mit vielseitigem Instrumentarium und verschiedenen Lernenden.',
        'edu-08-aria'        : 'Som Maior Música e Arte, in neuem Tab öffnen',
        'edu-09-tag'         : 'JUL 2017 / SEP 2020',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : 'Musiklehrer · Gitarre, Akustik & weitere Instrumente · Teilzeit · Maringá, PR',
        'edu-09-desc'        : 'Praxisnaher Unterricht nach Ziel, von Anfängern bis fortgeschrittenem Repertoire, Theorie bei Bedarf.',
        'edu-09-aria'        : 'Belas Artes, in neuem Tab öffnen',
        'edu-10-tag'         : 'JUN 2018 / APR 2019',
        'edu-10-title'       : 'Soziales Hilfsprojekt',
        'edu-10-role'        : 'Musiklehrer · Senioren · Teilzeit · Maringá, PR',
        'edu-10-desc'        : 'Musik für Gesundheit und Wohlbefinden: Motorik, Gedächtnis, Austausch und Zuwendung. Angepasste Instrumente und Aktivitäten, Gruppenauftritte und Mitgestaltung.',
        'edu-11-tag'         : 'MÄR 2020, DEZ 2020',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : 'Gruppenunterricht Keyboard & Gitarre · Teilzeit · Maringá, PR',
        'edu-11-desc'        : 'Gruppen: gemeinsames Üben, gemischte Niveaus mit laufender Anpassung, Rhythmus, Harmonie und Repertoire zugänglich und lebendig.',
        'edu-11-aria'        : 'Passantes e Pensantes, in neuem Tab öffnen',
        'edu-12-tag'         : 'NOV 2021 / AUG 2023',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : 'Multi-Instrument & Theorie · Teilzeit · Itajaí, SC',
        'edu-12-desc'        : 'Gitarre, Klavier, Akustik, Cavaquinho, Pandeiro, Percussion, Keys, Bass und Theorie für alle Altersstufen, Technik, Repertoire, Gehör und Rhythmus mit klarer Didaktik.',
        'edu-12-aria'        : 'Estação da Música, in neuem Tab öffnen',
        'edu-13-tag'         : 'JUN 2022 / DEZ 2022',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : 'Multi-Instrument & Theorie · Teilzeit · Balneário Camboriú, SC',
        'edu-13-desc'        : 'Multi-Instrument und Theorie: ausgewogene Praxis mit Grundlagen, Technik, Interpretation und Zielen pro Person.',
        'edu-13-aria'        : 'Centro Musicall, in neuem Tab öffnen',
        'ch01-tag'           : 'KAPITEL 01',
        'ch01-title'         : 'Wo alles<br><span class="tl-title-accent">begann.</span>',
        'ch01-desc'          : 'Vor den Veröffentlichungen, dem Support und den Bühnen gab es nur eine klare Idee: etwas Authentisches schaffen. 2024 begann Quint seine Reise in der elektronischen Musik mit einem direkten Ziel, Groove, Atmosphäre und Identität in jedem Track vereinen. Bald wurde aus einem Anfang eine Bewegung. Veröffentlichungen, Verbindungen und Support von Künstlern begannen zu entstehen und zeigten, dass der Sound schon eine Richtung hatte. Die Geschichte begann nicht vor Jahren. Sie begann jetzt, und ist bereits in Bewegung.',
        'ch02-tag'           : 'KAPITEL 02',
        'ch02-title'         : 'Der Sound der<br><span class="tl-title-accent">ankam.</span>',
        
        'ch02-desc'          : 'In kurzer Zeit begann Quint, seine Präsenz in der Underground-Szene zu festigen, mit Veröffentlichungen auf Labels wie Cuff, Muzenga Records, Player One Records und Indie Beats. Seine Produktionen erregten schnell Aufmerksamkeit und erhielten Support von Amine Edge, Jessika Branka, Deeper Purpose, Kolombo, Loulou Players, BRN und anderen relevanten Namen der internationalen Szene. Mehr als Zahlen markierte dieser Moment den Aufbau einer soliden Klangidentität, basierend auf Groove, Atmosphäre und Floor-Energie.',
        'ch03-tag'           : 'KAPITEL 03',
        'tension-e'          : 'Und',
        'tension-phrase'     : ' wo bin ich',
        'tension-now'        : 'JETZT??',
        'tension-sub'        : 'Die Antwort liegt unten.',
        'ch04-tag'           : 'KAPITEL 03',
        'ch04-year'          : '2025 / HEUTE',
        'ch04-title'         : 'Neuer<br><span class="tl-title-accent">Zyklus.</span>',
        'ch04-quote'         : 'Was als Vision begann, ist heute Richtung.<br>Alles, was ich mir vorgestellt habe, ist bereits in Bewegung, und ich beschleunige nur noch auf etwas viel Größeres zu.',
        'sobre-tag'          : 'ÜBER MICH',
        'sobre-title'        : 'Von der Gitarre<br><span class="text-glow">zur Tanzfläche</span>',
        'sobre-p1'           : 'Musik begleitet mich seit meinem 8. Lebensjahr. Ich wuchs mit Gitarre und Akustikgitarre auf, beeinflusst von meinem Vater und meinem Onkel, beide Gitarristen. Dieser frühe Kontakt prägte mein Verhältnis zum Klang. Mit der Zeit verschob sich mein Geschmack hin zur elektronischen Musik, und die Tanzfläche wurde mein eigentlicher Ort.',
        'sobre-p2'           : 'Es war an der Seite von DJ-Freunden, dass ich Musik aus einer völlig neuen Perspektive erlebte, von der Bühne aus. Die Reaktion des Publikums auf ein Set löste in mir etwas aus, das ich noch nie gefühlt hatte, und genau da dachte ich: Warum nicht ich?',
        'sobre-p3'           : '2024 begann ich Ableton zu erkunden, entwickelte meinen Sound und schickte nach nur 6 Monaten Produktion einen Track an Amine Edge. Er unterstützte ihn, auch live in der Park Art, und dieser Moment veränderte alles. Kurz darauf erschien mein erstes Release über Cuff, ein echter Meilenstein in meiner Karriere.',
        'sobre-p4'           : 'Von da an beschleunigten sich die Dinge: neue Verträge, Support von relevanten Namen der Szene, eine Mixingausbildung bei Volare 2025 und Auftritte bei Events wie Fire Music, dem Jubiläum des Estúdio Mixar, dem Summer Festival und Night Vision.',
        'sobre-p5'           : 'Kürzlich qualifizierte ich mich als Zweiter für das Finale des Circuito, Brasiliens größtem DJ-Wettbewerb, veranstaltet von Park Art. Jeder Schritt bestätigt, dass dies der richtige Weg ist, und dass alles vom eigenen Einsatz abhängt.',
        'lugares-tag'        : 'BÜHNE &amp; EVENTS',
        'lugares-title'      : 'Hauptbühnen, auf denen<br><span class="text-glow">ich aufgetreten bin</span>',
        'dl-tag'             : 'PRESSEMATERIAL',
        'dl-title'           : 'Fotos in <span class="text-glow">hoher Qualität</span>',
        'dl-desc'            : 'Einzeln oder als komplettes Paket ohne Qualitätsverlust herunterladen.',
        'dl-cta'             : 'Alle Fotos herunterladen (.zip)',
        'dl-zip-note'        : 'Das Paket besteht aus 3 .zip-Dateien (insgesamt ~194 MB). Ein Klick startet alle drei Downloads, der Browser kann nachfragen.',
        'dl-cta-zip-all'     : 'Komplettpaket herunterladen (3 .zip)',
        'dl-btn'             : 'Herunterladen',
        'dl-tab-photos'      : 'Meine Fotos',
        'dl-tab-logo'        : 'Logo',
        'dl-logo-tag'        : 'OFFIZIELLES LOGO',
        'dl-logo-title'      : 'Offizielles Logo für Presse und Booker',
        'dl-logo-desc'       : 'Lade das offizielle Logo getrennt von den Fotos herunter für Flyer, Lineups, Artworks und Promo-Material.',
        'dl-logo-btn'        : 'Logo herunterladen (.png)',
        'fs-tag': 'HIGHLIGHT',
        'fs-new': 'AUFGEZEICHNET',
        'fs-title1': 'AUFTRITT',
        'fs-subtitle': '2026',
        'fs-desc': 'Live-Auftritt im Park Art, einer der wichtigsten Minimal Bass Locations in Brasilien. Dancefloor-Druck von Anfang bis Ende.',
        'fs-listen': 'Auf YouTube ansehen',
        'music-tag'          : 'HÖREN',
        'music-title'        : 'Musik &amp; <span class="text-glow">Releases</span>',
        'music-desc'         : 'Entdecke Sets und Releases auf den Plattformen',
        'tab-autorais'       : 'Eigene Tracks',
        'tab-sets'           : 'Sets',
        'tab-youtube'        : 'Video',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : 'Auf YouTube ansehen',
        'sc-cta'             : 'Alle auf SoundCloud ansehen',
        'spotify-cta'        : 'Vollständige Diskografie auf Spotify',
        'platforms-label'    : 'Auch verfügbar auf',
        'booking-tag'        : 'KONTAKT',
        'booking-title'      : 'Bereit, ans<br><span class="text-glow">Limit zu gehen?</span>',
        'booking-desc'       : 'Verfügbar für Clubs, Events und Festivals.<br>Melde dich, lass uns etwas Unvergessliches schaffen.',
        'available-private'  : 'Private Events',
        'footer-tagline'     : 'Rohe Energie. Floor-Druck.<br>Klang ohne Kompromisse.',
        'footer-nav-heading' : 'Navigation',
        'footer-sobre'       : 'Über mich',
        'footer-musicas'     : 'Musik',
        'footer-social-heading': 'Social Media',
        'footer-copy'        : '© 2026 QUINT. Alle Rechte vorbehalten.',
        'footer-credit-text' : 'Website entwickelt von',
    },
    ja: {
        'nav-historia'       : 'ヒストリー',
        'nav-sobre'          : 'プロフィール',
        'nav-musicas'        : 'ミュージック',
        'nav-drops'          : 'ドロップス',
        'drops-tag'          : 'エレクトロニカ',
        'drops-sub'          : 'エネルギー全開。クリックして視聴。',
        'nav-autorais'       : 'オリジナル',
        'autorais-tag'       : 'オリジナル楽曲',
        'hero-desc'          : '音楽的アイデンティティから構築されたセット。<br>すべてのトラックに物語がある。すべてのドロップに体験がある。',
        'hero-listen'        : '今すぐ聴く',
        'badge-pressure'     : 'フロアの圧力',
        'tl-section-tag'     : 'ヒストリー',
        'tl-section-title'   : '<span class="text-glow">20年</span>の軌跡',
        'tl-tab-performance' : 'ステージ',
        'tl-tab-education'   : '音楽教育',
        'edu-01-tag'         : '2015年8月 / 2015年11月',
        'edu-01-title'       : 'Tok Music',
        'edu-01-role'        : 'ギター講師 · マリンガ、パラナ州',
        'edu-01-desc'        : '指導を始めた場所：さまざまなレベルの生徒へ、軽やかで実践的・身近なアプローチ。最初の一音から教学法とモチベーションを育てる。',
        'edu-01-aria'        : 'Tok Music, 新しいタブで開く',
        'edu-02-tag'         : '2016年2月 / 2016年7月',
        'edu-02-title'       : 'Universidade Estadual de Maringá',
        'edu-02-role'        : '拡張プロジェクト · CAP（教育応用校）',
        'edu-02-desc'        : '音楽学士課程中の活動：学校での音楽教育（聴覚・リズム・楽器）、拡張プロジェクトの方針に沿った内容。',
        'edu-02-aria'        : 'CAP UEM, 新しいタブで開く',
        'edu-03-tag'         : '2016年7月 / 2016年11月',
        'edu-03-title'       : 'Alberto Jackson Byington Junior 州立校',
        'edu-03-role'        : '音楽教師 · 拡張プロジェクト · マリンガ、パラナ州',
        'edu-03-desc'        : '公立校での音楽指導。生徒の水準に合わせて内容を調整し、大学の理論と教室の実践をつなぐ。',
        'edu-03-aria'        : 'Byington Junior, 新しいタブで開く',
        'edu-04-tag'         : '2016年10月 / 2018年8月',
        'edu-04-title'       : 'Art Musica',
        'edu-04-role'        : 'フリーランス講師 · ギター、アコースティック、ベース、カヴァキーニョ',
        'edu-04-desc'        : '目的とプロフィールに合わせた個人レッスン。実践とレパートリーを重視し、必要に応じて理論をサポート。',
        'edu-04-aria'        : 'Art Musica, 新しいタブで開く',
        'edu-05-tag'         : '2017年1月 / 2017年11月',
        'edu-05-title'       : 'Victor Beloti 市立校',
        'edu-05-role'        : 'インターンシップ · 音楽教育 · パートタイム · マリンガ、パラナ州',
        'edu-05-desc'        : '公立校インターン（指導伴走）：計画、クラス運営、楽器を使った聴覚とリズムの育成。',
        'edu-05-aria'        : 'Victor Beloti, 新しいタブで開く',
        'edu-06-tag'         : '2017年1月 / 2019年7月',
        'edu-06-title'       : 'Jardim Independência 州立校',
        'edu-06-role'        : 'インターンシップ · 音楽教師 · パートタイム · マリンガ、パラナ州',
        'edu-06-desc'        : '音楽学士最終年のインターン：教室での自律、授業設計、学校音楽教育での生徒の成長をフォロー。',
        'edu-06-aria'        : 'Jardim Independência, 新しいタブで開く',
        'edu-07-tag'         : '2017年2月 / 2017年11月',
        'edu-07-title'       : 'Ateliê Da Criança',
        'edu-07-role'        : '幼児音楽教育 · 乳児 · マリンガ、パラナ州',
        'edu-07-desc'        : '乳幼児向け：音の刺激、リズム、動き、遊びを通した体験。家族とのつながりと、従来型の技術偏重ではないアプローチ。',
        'edu-07-aria'        : 'Ateliê Da Criança, 新しいタブで開く',
        'edu-08-tag'         : '2017年4月 / 2019年10月',
        'edu-08-title'       : 'Som Maior Música e Arte',
        'edu-08-role'        : '講師 · ギター、アコースティック、ベース、カヴァキーニョ · マリンガ、パラナ州',
        'edu-08-desc'        : '実践重視で一人ひとりの目標に合わせるレッスン, 基礎からレパートリまで, 多様な生徒との経験を重ねる。',
        'edu-08-aria'        : 'Som Maior Música e Arte, 新しいタブで開く',
        'edu-09-tag'         : '2017年7月 / 2020年9月',
        'edu-09-title'       : 'Belas Artes',
        'edu-09-role'        : '音楽講師 · ギター、アコースティック、その他楽器 · パートタイム · マリンガ、パラナ州',
        'edu-09-desc'        : '実践中心で目標に合わせたレッスン, 初級から上級の技法・レパートリまで, 必要に応じて理論を補助。',
        'edu-09-aria'        : 'Belas Artes, 新しいタブで開く',
        'edu-10-tag'         : '2018年6月 / 2019年4月',
        'edu-10-title'       : '社会支援プロジェクト',
        'edu-10-role'        : '音楽講師 · シニア · パートタイム · マリンガ、パラナ州',
        'edu-10-desc'        : '健康とウェルビーイングを意識した音楽：運動協調、記憶、交流と受け止め。楽器と活動を調整し、グループ発表と参加者の主役性。',
        'edu-11-tag'         : '2020年3月 / 2020年12月',
        'edu-11-title'       : 'Passantes Pensantes',
        'edu-11-role'        : 'キーボードとギターのグループレッスン · パートタイム · マリンガ、パラナ州',
        'edu-11-desc'        : 'グループレッスン：協働練習、混在レベルを継続的に調整、リズム・和声・レパートリをわかりやすくダイナミックに。',
        'edu-11-aria'        : 'Passantes e Pensantes, 新しいタブで開く',
        'edu-12-tag'         : '2021年11月 / 2023年8月',
        'edu-12-title'       : 'Estação da Música',
        'edu-12-role'        : '多楽器・理論講師 · パートタイム · イタジャイ、SC',
        'edu-12-desc'        : 'ギター、ピアノ、アコースティック、カヴァキーニョ、パンデイロ、打楽器、キーボード、ベースと理論。年齢・レベルに応じて技法、レパートリ、聴音とリズムを明確に指導。',
        'edu-12-aria'        : 'Estação da Música, 新しいタブで開く',
        'edu-13-tag'         : '2022年6月 / 2022年12月',
        'edu-13-title'       : 'Centro Musicall',
        'edu-13-role'        : '多楽器・理論講師 · パートタイム · バルネアリオ・カンボリウ、SC',
        'edu-13-desc'        : '多楽器と理論：実践と基礎理論のバランス、技法、解釈、一人ひとりの目標に合わせた指導。',
        'edu-13-aria'        : 'Centro Musicall, 新しいタブで開く',
        'ch01-tag'           : 'チャプター 01',
        'ch01-title'         : 'すべてが<br><span class="tl-title-accent">始まった場所。</span>',
        'ch01-desc'          : 'リリース、サポート、ステージよりも前に、ただ一つ明確なアイデアがあった, 本物のものを作ること。2024年、Quintはgroove・アトモスフィア・アイデンティティをすべてのトラックに込めるという直接的な目標とともに、電子音楽の旅を始めた。やがて、始まりが運動へと変わった。リリース、コネクション、アーティストからのサポートが生まれ、サウンドにはすでに方向性があることが証明された。この物語は何年も前に始まったのではない。今始まった, そしてすでに動き出している。',
        'ch02-tag'           : 'チャプター 02',
        'ch02-title'         : '届いた<br><span class="tl-title-accent">サウンド。</span>',
        
        'ch02-desc'          : '短期間のうちに、QuintはCuff、Muzenga Records、Player One Records、Indie Beatsなどのレーベルからリリースを重ね、アンダーグラウンドシーンでの存在感を確立し始めた。彼の制作はすぐに注目を集め、Amine Edge、Jessika Branka、Deeper Purpose、Kolombo、Loulou Players、BRNなど国際的なシーンの重要なアーティストたちからサポートを受けた。数字以上に、この瞬間はgroove・アトモスフィア・フロアエナジーを基盤とした確固たる音楽的アイデンティティの構築を意味していた。',
        'ch03-tag'           : 'チャプター 03',
        'tension-e'          : 'そして',
        'tension-phrase'     : ' 今どこにいるのか',
        'tension-now'        : '今？？',
        'tension-sub'        : '答えは下にあります。',
        'ch04-tag'           : 'チャプター 03',
        'ch04-year'          : '2025 / 現在',
        'ch04-title'         : '新しい<br><span class="tl-title-accent">サイクル。</span>',
        'ch04-quote'         : 'ビジョンだったものが、今は方向になる。<br>考えていたすべてがすでに動き出し、自分はさらに大きな何かへ向けて加速しているだけだ。',
        'sobre-tag'          : 'プロフィール',
        'sobre-title'        : 'ギターから<br><span class="text-glow">ダンスフロアへ</span>',
        'sobre-p1'           : '8歳のころから音楽は私の人生の一部です。父と叔父，どちらもギタリスト，の影響でギターを始め、その経験が音への感覚を育てました。やがて電子音楽へと興味が移り、ダンスフロアが私の本当の居場所になりました。',
        'sobre-p2'           : 'DJ仲間と過ごすなかで、ステージの上から見る音楽という、まったく新しい視点に気づきました。観客がセットに反応する姿を見て、これまで感じたことのない感動が生まれ、「なぜ自分ではいけないのか」と思いました。',
        'sobre-p3'           : '2024年にAbletonを使い始め、サウンドを磨き続け、わずか6か月でAmine Edgeにトラックを送りました。彼はそれをサポートしてくれ，Park Artでのライブも含め，その瞬間がすべてを変えました。その後、Cuffからの初リリースが実現し、キャリアの本当の転換点となりました。',
        'sobre-p4'           : 'そこからは加速しました。新たな契約、シーンの重要人物からのサポート、2025年のVolare mixingコース修了、そしてFire Music・Estúdio Mixar周年イベント・Summer Festival・Night Visionへの出演。',
        'sobre-p5'           : '最近、ブラジル最大のDJコンテストであるCircuito（Park Art主催）の決勝に2位で進出しました。一歩一歩が、このの道が正しいことを証明しています，そしてすべては自分の努力次第です。',
        'lugares-tag'        : 'ステージ &amp; イベント',
        'lugares-title'      : '主な出演<br><span class="text-glow">ステージ</span>',
        'dl-tag'             : 'プレス素材',
        'dl-title'           : '高画質<span class="text-glow">フォト素材</span>',
        'dl-desc'            : '個別またはフルパッケージを画質を損なわずにダウンロード。',
        'dl-cta'             : 'すべての写真をダウンロード（.zip）',
        'dl-zip-note'        : 'フルパッケージは3つの.zip（合計約194MB）です。1クリックで順にダウンロードが始まります。ブラウザが複数ファイルの許可を求めることがあります。',
        'dl-cta-zip-all'     : 'フルパッケージをダウンロード（3つの.zip）',
        'dl-btn'             : 'ダウンロード',
        'dl-tab-photos'      : '写真',
        'dl-tab-logo'        : 'ロゴ',
        'dl-logo-tag'        : '公式ロゴ',
        'dl-logo-title'      : 'ブッカーとメディア向け公式ロゴ',
        'dl-logo-desc'       : 'フライヤー、ラインナップ、告知素材に使える公式ロゴを写真と分けてダウンロード。',
        'dl-logo-btn'        : 'ロゴをダウンロード (.png)',
        'fs-tag': '注目',
        'fs-new': '収録済み',
        'fs-title1': 'パフォーマンス',
        'fs-subtitle': '2026',
        'fs-desc': 'ブラジルのMinimal Bassの重要拠点Park Artでのライブパフォーマンス。最初から最後までフロアを揺らす。',
        'fs-listen': 'YouTubeで観る',
        'music-tag'          : '聴く',
        'music-title'        : 'ミュージック &amp; <span class="text-glow">リリース</span>',
        'music-desc'         : 'プラットフォームでセットとリリースを探索',
        'tab-autorais'       : 'オリジナル楽曲',
        'tab-sets'           : 'セット',
        'tab-youtube'        : '動画',
        'youtube-card-label' : 'YouTube',
        'youtube-cta'        : 'YouTubeで見る',
        'sc-cta'             : 'SoundCloudですべて見る',
        'spotify-cta'        : 'Spotifyでディスコグラフィーを見る',
        'platforms-label'    : 'その他のプラットフォームでも配信中',
        'booking-tag'        : 'コンタクト',
        'booking-title'      : '限界を<br><span class="text-glow">超える準備はできていますか？</span>',
        'booking-desc'       : 'クラブ、イベント、フェスティバルへの出演受付中。<br>お問い合わせください。一緒に忘れられない体験を。',
        'available-private'  : 'プライベートイベント',
        'footer-tagline'     : '生のエネルギー。フロアの圧力。<br>妥協のないサウンド。',
        'footer-nav-heading' : 'ナビゲーション',
        'footer-sobre'       : 'プロフィール',
        'footer-musicas'     : 'ミュージック',
        'footer-social-heading': 'ソーシャルメディア',
        'footer-copy'        : '© 2026 QUINT. 無断複製禁止。',
        'footer-credit-text' : 'ウェブサイト制作',
    },
};

// Maps lang code → [flag class, short code]
const langMeta = {
    pt: ['fi-br', 'PT'],
    en: ['fi-us', 'EN'],
    es: ['fi-es', 'ES'],
    zh: ['fi-cn', '中文'],
    de: ['fi-de', 'DE'],
    ja: ['fi-jp', 'JP'],
};

function applyLang(lang) {
    const t = i18n[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t[key];
        if (val === undefined) return;
        if (/<[^>]+>/.test(val)) {
            el.innerHTML = val;
        } else {
            el.textContent = val;
        }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        const val = key ? t[key] : undefined;
        if (val !== undefined) el.setAttribute('aria-label', val);
    });

    // Keep data-text in sync for the CSS glitch effect
    const glitch = document.getElementById('tl-glitch');
    if (glitch) glitch.dataset.text = t['tension-now'] || glitch.dataset.text;

    // Update trigger pill display
    const meta = langMeta[lang] || ['fi-br', 'PT'];
    const triggerFlag = document.getElementById('trigger-flag');
    const triggerCode = document.getElementById('trigger-code');
    if (triggerFlag) {
        triggerFlag.className = `fi ${meta[0]} fis lang-flag`;
    }
    if (triggerCode) triggerCode.textContent = meta[1];

    // Update active option highlight in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('lang-option--active', opt.dataset.lang === lang);
    });

    const langMap = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN', de: 'de', ja: 'ja' };
    document.documentElement.lang = langMap[lang] || lang;
    localStorage.setItem('quint-lang', lang);
}

function initI18n() {
    const switcher = document.getElementById('lang-switcher');
    const trigger  = document.getElementById('lang-trigger');
    const dropdown = document.getElementById('lang-dropdown');
    if (!switcher || !trigger || !dropdown) return;

    // Toggle dropdown on trigger click
    trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = switcher.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen);
    });

    // Select language from dropdown
    dropdown.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            applyLang(opt.dataset.lang);
            switcher.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!switcher.contains(e.target)) {
            switcher.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            switcher.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Apply saved language
    const saved = localStorage.getItem('quint-lang') || 'pt';
    if (saved !== 'pt') applyLang(saved);
}

// ============================================================
// INIT
// ============================================================

function init() {
    onScroll();
    initDjGallery();
    initTimelineMobileCarousels();
    initTensionGlitch();
    initSpineLine();
    initTimelineReveal();
    initTensionEntry();
    initStreamTabs();
    initDownloadsTabs();
    initPressZipBundle();
    initTimelineStoryTabs();
    initI18n();
    initTypingEffect();
    initDrops();
    initAutorais();
}

// ============================================================
// AUTORAIS — carrossel de músicas originais + player Spotify
// ============================================================
function initAutorais() {
    const reel       = document.getElementById('autorais-reel');
    const player     = document.getElementById('autoral-player');
    const iframe     = document.getElementById('autoral-iframe');
    const playerName = document.getElementById('autoral-player-name');
    const progressBar = document.getElementById('autorais-progress-bar');

    if (!reel) return;

    const cards = reel.querySelectorAll('.autoral-card');
    let activeCard = null;

    // ---- Click: abre / fecha player ----
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (reel.classList.contains('is-dragging')) return;

            const isSame = card === activeCard;

            // Desativa card anterior
            if (activeCard) {
                activeCard.classList.remove('is-active');
                activeCard = null;
            }

            if (isSame) {
                // Fechar player
                if (player) { player.classList.remove('is-open'); }
                if (iframe)  { setTimeout(() => { iframe.src = ''; }, 400); }
                return;
            }

            // Ativa novo card
            card.classList.add('is-active');
            activeCard = card;

            const trackId = card.dataset.trackId;
            const title   = card.dataset.title || '';

            if (playerName) playerName.textContent = title;
            if (iframe) {
                iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
            }
            if (player) {
                player.classList.add('is-open');
                // Scroll suave para o player
                setTimeout(() => {
                    player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });

    // ---- Nav buttons ----
    const prevBtn = document.getElementById('autorais-prev');
    const nextBtn = document.getElementById('autorais-next');
    const cardStep = () => {
        const first = reel.querySelector('.autoral-card');
        if (!first) return 260;
        const gap = parseFloat(getComputedStyle(reel).gap) || 0;
        return first.offsetWidth + gap;
    };
    prevBtn && prevBtn.addEventListener('click', () => {
        reel.scrollBy({ left: -cardStep() * 2, behavior: 'smooth' });
    });
    nextBtn && nextBtn.addEventListener('click', () => {
        reel.scrollBy({ left: cardStep() * 2, behavior: 'smooth' });
    });

    // ---- Scroll progress ----
    function updateProgress() {
        if (!progressBar) return;
        const max = reel.scrollWidth - reel.clientWidth;
        const pct = max > 0 ? (reel.scrollLeft / max) * 100 : 0;
        progressBar.style.width = pct + '%';
    }
    reel.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // ---- Drag scroll (desktop) ----
    let isDown = false, startX = 0, scrollLeft = 0;

    reel.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX - reel.offsetLeft;
        scrollLeft = reel.scrollLeft;
        reel.classList.add('is-dragging');
    });
    reel.addEventListener('mouseleave', () => { isDown = false; reel.classList.remove('is-dragging'); });
    reel.addEventListener('mouseup',    () => { isDown = false; reel.classList.remove('is-dragging'); });
    reel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - reel.offsetLeft;
        reel.scrollLeft = scrollLeft - (x - startX) * 1.3;
    });
}

// ============================================================
// DROPS DE ELETRÔNICA
// ============================================================
function initDrops() {
    const reel  = document.getElementById('drops-reel');
    const modal = document.getElementById('drop-modal');
    const modalVideo = document.getElementById('drop-modal-video');
    const closeBtn   = document.getElementById('drop-modal-close');
    const backdrop   = modal ? modal.querySelector('.drop-modal-backdrop') : null;

    if (!reel || !modal) return;

    const cards = reel.querySelectorAll('.drop-card');
    const isTouch = () => window.matchMedia('(hover: none)').matches;

    // ---- Hover play/pause (desktop only) ----
    cards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;

        card.addEventListener('mouseenter', () => {
            if (isTouch()) return;
            video.play().catch(() => {});
            card.classList.add('is-active');
        });

        card.addEventListener('mouseleave', () => {
            if (isTouch()) return;
            video.pause();
            video.currentTime = 0;
            card.classList.remove('is-active');
        });
    });

    // ---- Click → open modal ----
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (reel.classList.contains('is-dragging')) return;
            const src = card.dataset.src;
            if (!src) return;
            modalVideo.src = src;
            modalVideo.load();
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            modalVideo.play().catch(() => {});
        });
    });

    // ---- Close modal ----
    function closeModal() {
        modal.classList.remove('is-open');
        modalVideo.pause();
        modalVideo.src = '';
        document.body.style.overflow = '';
    }

    closeBtn && closeBtn.addEventListener('click', closeModal);
    backdrop && backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // ---- Drag scroll (desktop) ----
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let moved = false;

    reel.addEventListener('mousedown', e => {
        isDown = true;
        moved = false;
        startX = e.pageX - reel.offsetLeft;
        scrollLeft = reel.scrollLeft;
        reel.classList.add('is-dragging');
    });

    reel.addEventListener('mouseleave', () => {
        isDown = false;
        reel.classList.remove('is-dragging');
    });

    reel.addEventListener('mouseup', () => {
        isDown = false;
        reel.classList.remove('is-dragging');
    });

    reel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - reel.offsetLeft;
        const walk = (x - startX) * 1.3;
        reel.scrollLeft = scrollLeft - walk;
        if (Math.abs(walk) > 5) moved = true;
    });

    // ---- Nav buttons (prev / next) ----
    const prevBtn = document.getElementById('drops-prev');
    const nextBtn = document.getElementById('drops-next');
    const cardWidth = () => {
        const first = reel.querySelector('.drop-card');
        if (!first) return 300;
        const gap = parseFloat(getComputedStyle(reel).gap) || 0;
        return first.offsetWidth + gap;
    };
    prevBtn && prevBtn.addEventListener('click', () => {
        reel.scrollBy({ left: -cardWidth() * 2, behavior: 'smooth' });
    });
    nextBtn && nextBtn.addEventListener('click', () => {
        reel.scrollBy({ left: cardWidth() * 2, behavior: 'smooth' });
    });

    // ---- Scroll progress bar ----
    const progressBar = document.getElementById('drops-progress-bar');
    function updateProgress() {
        if (!progressBar) return;
        const max = reel.scrollWidth - reel.clientWidth;
        const pct = max > 0 ? (reel.scrollLeft / max) * 100 : 0;
        progressBar.style.width = pct + '%';
    }
    reel.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}

// ============================================================
// TYPING EFFECT — hero eyebrow
// ============================================================
function initTypingEffect() {
    const pill = document.querySelector('.hero-pill');
    if (!pill) return;

    const fullText = pill.textContent.replace(/\s+/g, ' ').trim();
    pill.textContent = '';
    pill.classList.add('typing');

    let i = 0;
    const iv = setInterval(() => {
        pill.textContent = fullText.slice(0, i + 1);
        i++;
        if (i >= fullText.length) {
            clearInterval(iv);
            setTimeout(() => pill.classList.remove('typing'), 900);
        }
    }, 52);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}