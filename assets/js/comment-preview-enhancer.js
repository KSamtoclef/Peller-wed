(() => {
  'use strict';

  const F = window.FAN_CONVERSATION || {};
  if (!F.previewActive) return;

  const livePool = [
    ['Temitope Bakare','I finally picked data 😂'],
    ['Daniel Etim','Cash gang where una dey?'],
    ['Precious James','Congratulations to the couple ❤️'],
    ['Kelvin Udo','I chose any available gift.'],
    ['Zainab Ibrahim','The data option is tempting me 😂'],
    ['Halima Musa','Who else came from WhatsApp?'],
    ['Benedict Oke','Cow gift people no plenty here 😂'],
    ['Jennifer Uche','I still think data is the best one.'],
    ['Victoria James','Congratulations Jarvis ❤️'],
    ['Paul Etim','I picked cash immediately 😂'],
    ['Oluwatobi Ajayi','This comment section is active o 😂'],
    ['Maryam Sani','Any available gift for me 🙌']
  ];

  const css = document.createElement('style');
  css.textContent = `
    .demo-comment-badge{display:inline-flex;align-items:center;margin-top:7px;padding:4px 7px;border-radius:999px;background:#fff3d7;color:#765700;font-size:9px;font-weight:900;letter-spacing:.35px}
    .demo-typing{padding:8px 13px;color:#7a8781;font-size:10px;font-style:italic;border-bottom:1px solid #edf0ee}
    .demo-comment-live{animation:demoCommentIn .35s ease-out}
    .demo-comment-live .avatar{box-shadow:0 0 0 2px rgba(223,181,74,.22)}
    @keyframes demoCommentIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}
  `;
  document.head.appendChild(css);

  function readCommentMap() {
    try {
      const state = JSON.parse(localStorage.getItem('pj_fan_gift_modular') || '{}');
      return new Map((state.userComments || []).map(comment => [comment.id, comment]));
    } catch (e) {
      return new Map();
    }
  }

  function enhanceFeed(feed) {
    const head = feed.querySelector('.feed-head');
    if (head && !head.querySelector('.demo-comment-badge')) {
      const badge = document.createElement('span');
      badge.className = 'demo-comment-badge';
      badge.textContent = F.previewLabel || 'DEMO COMMENT PREVIEW';
      head.appendChild(badge);
    }

    if (!feed.querySelector('.demo-typing')) {
      const typing = document.createElement('div');
      typing.className = 'demo-typing';
      typing.textContent = 'Fan conversation preview';
      const actions = feed.querySelector('.social-actions');
      if (actions) actions.insertAdjacentElement('afterend', typing);
    }

    const map = readCommentMap();
    feed.querySelectorAll('[data-like-comment]').forEach(button => {
      const comment = map.get(button.dataset.likeComment);
      if (!comment) return;
      const base = Number(comment.l || 0);
      const liked = button.classList.contains('liked');
      button.textContent = `${liked ? 'Liked' : 'Like'} · ${base + (liked ? 1 : 0)}`;
    });
  }

  function enhanceAll() {
    document.querySelectorAll('.feed').forEach(enhanceFeed);
  }

  const observer = new MutationObserver(() => enhanceAll());
  observer.observe(document.body, { childList: true, subtree: true });
  enhanceAll();

  let liveIndex = 0;

  function initials(name) {
    return name.split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
  }

  function insertLivePreview(name, text) {
    document.querySelectorAll('.feed').forEach(feed => {
      const comments = feed.querySelector('.comments');
      if (!comments) return;

      const empty = comments.querySelector('.comments-empty');
      if (empty) empty.remove();

      const row = document.createElement('div');
      row.className = 'comment demo-comment-live';
      row.innerHTML = `
        <div class="avatar">${initials(name)}</div>
        <div class="comment-body">
          <div class="bubble"><b>${name}</b><p>${text}</p></div>
          <div class="meta">
            <button type="button" class="demo-like">Like · ${Math.floor(Math.random()*5)+1}</button>
            <button type="button" class="demo-reply">Reply</button>
            <span>now</span>
          </div>
        </div>`;

      const like = row.querySelector('.demo-like');
      like.addEventListener('click', () => {
        const match = like.textContent.match(/(\d+)$/);
        const count = Number(match?.[1] || 0);
        const active = like.dataset.active === '1';
        like.dataset.active = active ? '0' : '1';
        like.textContent = `${active ? 'Like' : 'Liked'} · ${active ? Math.max(0,count-1) : count+1}`;
      });

      row.querySelector('.demo-reply').addEventListener('click', () => {
        const input = feed.querySelector('.comment-input');
        if (input) {
          input.value = `@${name} `;
          input.focus();
        }
      });

      comments.prepend(row);
    });
  }

  function scheduleLivePreview() {
    const delay = 12000 + Math.floor(Math.random() * 12000);
    setTimeout(() => {
      const [name, text] = livePool[liveIndex % livePool.length];
      liveIndex += 1;

      document.querySelectorAll('.demo-typing').forEach(el => {
        el.textContent = `${name} is typing…`;
      });

      setTimeout(() => {
        insertLivePreview(name, text);
        document.querySelectorAll('.demo-typing').forEach(el => {
          el.textContent = 'Fan conversation preview';
        });
        scheduleLivePreview();
      }, 1200 + Math.floor(Math.random() * 1200));
    }, delay);
  }

  scheduleLivePreview();
})();
