(() => {
  'use strict';

  const F = window.FAN_CONVERSATION || {};
  if (!F.previewActive) return;

  const STREAM_KEY = 'pj_demo_testimonial_stream_v3';
  const MAX_LIVE = 260;
  const people = Array.isArray(F.livePeople) && F.livePeople.length ? F.livePeople : ['Amina Yusuf','Tosin Adeyemi'];
  const replyPool = Array.isArray(F.liveReplies) && F.liveReplies.length ? F.liveReplies : ['Congratulations ❤️'];

  const receiptPhrases = [
    'My cash gift just entered',
    'I received mine now',
    'Mine just came through',
    'I got my own cash gift',
    'The alert just entered',
    'I have received mine successfully',
    'Mine landed just now',
    'I just received my own',
    'Cash gift received here',
    'My own has entered',
    'I got the alert now',
    'Payment came through for me',
    'Mine finally came in',
    'Received successfully',
    'I just got mine'
  ];

  const thankPhrases = [
    'Thank you Peller and Jarvis',
    'Thank you both so much',
    'I really appreciate Peller and Jarvis',
    'Big thank you to both of you',
    'I appreciate this so much',
    'Thank you for remembering the fans',
    'Thank you Jarvis and Peller',
    'I am really grateful to both of you'
  ];

  const prayerPhrases = [
    'God bless your new home',
    'May your marriage be filled with peace and happiness',
    'May God continue to bless this beautiful union',
    'I pray your home never lacks anything good',
    'May joy and understanding remain in your marriage',
    'God will continue to open doors for both of you',
    'May greater blessings return to you both',
    'I pray love and peace never leave your home',
    'May your family continue to prosper',
    'God bless your marriage with long life and favour',
    'May this new home be full of laughter and happiness',
    'I pray God keeps both of you together in peace'
  ];

  const endings = ['🙏','❤️','😭❤️','🙌','🙏❤️','😂❤️','🎉❤️',''];

  const css = document.createElement('style');
  css.textContent = `
    .demo-comment-badge{display:inline-flex;align-items:center;margin-top:7px;padding:4px 7px;border-radius:999px;background:#fff3d7;color:#765700;font-size:9px;font-weight:900;letter-spacing:.35px}
    .demo-inline-badge{display:inline-flex;margin-left:6px;padding:2px 5px;border-radius:999px;background:#fff3d7;color:#765700;font-size:7px;font-weight:900;vertical-align:middle;letter-spacing:.25px}
    .demo-typing{padding:8px 13px;color:#7a8781;font-size:10px;font-style:italic;border-bottom:1px solid #edf0ee}
    .demo-comment-live{animation:demoCommentIn .35s ease-out}
    .demo-comment-live .avatar{box-shadow:0 0 0 2px rgba(223,181,74,.22)}
    @keyframes demoCommentIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}
  `;
  document.head.appendChild(css);

  function readState() {
    try {
      return JSON.parse(localStorage.getItem('pj_fan_gift_modular') || '{}');
    } catch (e) {
      return {};
    }
  }

  function readCommentMap() {
    const state = readState();
    return new Map((state.userComments || []).map(comment => [comment.id, comment]));
  }

  function readStream() {
    try {
      const value = JSON.parse(localStorage.getItem(STREAM_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  }

  function writeStream(stream) {
    try {
      localStorage.setItem(STREAM_KEY, JSON.stringify(stream.slice(0, MAX_LIVE)));
    } catch (e) {}
  }

  function initials(name) {
    return String(name || 'Guest').split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
  }

  function age(ts) {
    const seconds = Math.max(0, Math.floor((Date.now() - Number(ts || Date.now())) / 1000));
    if (seconds < 55) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h';
    return Math.floor(hours / 24) + 'd';
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function makeTestimonial() {
    const receipt = pick(receiptPhrases);
    const thanks = pick(thankPhrases);
    const prayer = pick(prayerPhrases);
    const emoji = pick(endings);
    const style = Math.floor(Math.random() * 5);

    if (style === 0) return `${receipt} ${emoji} ${thanks}. ${prayer}.`.replace(/\s+/g,' ').trim();
    if (style === 1) return `${receipt}. ${thanks} ${emoji} ${prayer}.`.replace(/\s+/g,' ').trim();
    if (style === 2) return `${receipt} 😭 ${thanks}. ${prayer} ${emoji}`.replace(/\s+/g,' ').trim();
    if (style === 3) return `${receipt} 🙌 ${prayer}. Thank you both ${emoji}`.replace(/\s+/g,' ').trim();
    return `${receipt}. I am grateful ${emoji} ${prayer}.`.replace(/\s+/g,' ').trim();
  }

  function uniquePerson(stream) {
    const recent = stream.slice(0, 8).map(item => item.n);
    const available = people.filter(name => !recent.includes(name));
    return pick(available.length ? available : people);
  }

  function createLiveComment() {
    const stream = readStream();
    const recentParents = stream.filter(item => !item.replyTo).slice(0, 8);
    const makeReply = recentParents.length > 0 && Math.random() < 0.28;
    const parent = makeReply ? pick(recentParents) : null;
    const name = uniquePerson(stream);

    return {
      id: 'demo-live-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
      n: name,
      t: makeReply ? pick(replyPool) : makeTestimonial(),
      replyTo: parent ? parent.n : '',
      ts: Date.now(),
      l: makeReply ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 19) + 2,
      demo: true
    };
  }

  function createRow(comment) {
    const row = document.createElement('div');
    row.className = `comment demo-comment-live ${comment.replyTo ? 'reply-row' : ''}`;
    row.dataset.demoLiveId = comment.id;
    row.dataset.demoTimestamp = String(comment.ts);
    row.innerHTML = `
      <div class="avatar">${initials(comment.n)}</div>
      <div class="comment-body">
        <div class="bubble">
          ${comment.replyTo ? `<small>Replying to ${comment.replyTo}</small>` : ''}
          <b>${comment.n}<span class="demo-inline-badge">PREVIEW</span></b>
          <p>${comment.t}</p>
        </div>
        <div class="meta">
          <button type="button" class="demo-like">Like · ${Number(comment.l || 0)}</button>
          <button type="button" class="demo-reply">Reply</button>
          <span class="demo-age">${age(comment.ts)}</span>
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
      const feed = row.closest('.feed');
      const input = feed?.querySelector('.comment-input');
      if (input) {
        input.value = `@${comment.n} `;
        input.focus();
      }
    });

    return row;
  }

  function renderPersisted(feed) {
    const comments = feed.querySelector('.comments');
    if (!comments) return;

    const stream = readStream();
    const empty = comments.querySelector('.comments-empty');
    if (empty && stream.length) empty.remove();

    [...stream].reverse().forEach(comment => {
      if (comments.querySelector(`[data-demo-live-id="${comment.id}"]`)) return;
      comments.prepend(createRow(comment));
    });

    comments.querySelectorAll('[data-demo-live-id]').forEach(row => {
      const time = row.querySelector('.demo-age');
      if (time) time.textContent = age(Number(row.dataset.demoTimestamp));
    });
  }

  function markSeedPreviews(feed, map) {
    feed.querySelectorAll('[data-like-comment]').forEach(button => {
      const comment = map.get(button.dataset.likeComment);
      if (!comment) return;

      const base = Number(comment.l || 0);
      const liked = button.classList.contains('liked');
      button.textContent = `${liked ? 'Liked' : 'Like'} · ${base + (liked ? 1 : 0)}`;

      if (comment.demo) {
        const row = button.closest('.comment');
        const name = row?.querySelector('.bubble b');
        if (name && !name.querySelector('.demo-inline-badge')) {
          const badge = document.createElement('span');
          badge.className = 'demo-inline-badge';
          badge.textContent = 'PREVIEW';
          name.appendChild(badge);
        }
      }
    });
  }

  function enhanceFeed(feed) {
    const head = feed.querySelector('.feed-head');
    if (head && !head.querySelector('.demo-comment-badge')) {
      const badge = document.createElement('span');
      badge.className = 'demo-comment-badge';
      badge.textContent = F.previewLabel || 'DEMO TESTIMONIAL PREVIEW';
      head.appendChild(badge);
    }

    if (!feed.querySelector('.demo-typing')) {
      const typing = document.createElement('div');
      typing.className = 'demo-typing';
      typing.textContent = 'Preview conversation is active';
      const actions = feed.querySelector('.social-actions');
      if (actions) actions.insertAdjacentElement('afterend', typing);
    }

    const map = readCommentMap();
    markSeedPreviews(feed, map);
    renderPersisted(feed);

    const social = feed.querySelector('.social span');
    if (social) {
      const total = map.size + readStream().length;
      const wanted = `${total} ${total === 1 ? 'comment' : 'comments'}`;
      if (social.textContent !== wanted) social.textContent = wanted;
    }
  }

  let enhancing = false;
  function enhanceAll() {
    if (enhancing) return;
    enhancing = true;
    document.querySelectorAll('.feed').forEach(enhanceFeed);
    enhancing = false;
  }

  const observer = new MutationObserver(() => enhanceAll());
  observer.observe(document.body, { childList: true, subtree: true });
  enhanceAll();

  let timer = null;
  function nextDelay() {
    // Occasional quick replies mixed with normal pauses makes the one-hour preview less mechanical.
    return Math.random() < 0.16
      ? 7000 + Math.floor(Math.random() * 9000)
      : 22000 + Math.floor(Math.random() * 31000);
  }

  function scheduleLivePreview() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const comment = createLiveComment();
      const stream = readStream();
      stream.unshift(comment);
      writeStream(stream);

      document.querySelectorAll('.demo-typing').forEach(el => {
        el.textContent = `${comment.n} is typing…`;
      });

      setTimeout(() => {
        enhanceAll();
        document.querySelectorAll('.demo-typing').forEach(el => {
          el.textContent = 'Preview conversation is active';
        });
        scheduleLivePreview();
      }, 900 + Math.floor(Math.random() * 1500));
    }, nextDelay());
  }

  scheduleLivePreview();
  setInterval(enhanceAll, 30000);
})();
