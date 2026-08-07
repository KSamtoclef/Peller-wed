window.FAN_CONVERSATION = (() => {
  const previewActive =
    location.hostname === 'localhost' ||
    location.hostname.endsWith('.vercel.app') ||
    new URLSearchParams(location.search).get('commentsPreview') === '1';

  const now = Date.now();
  const minute = 60 * 1000;

  const people = [
    'Amina Yusuf','Tosin Adeyemi','Fatima Bello','Chisom Nwankwo','Emeka Okoro','Blessing Eze',
    'Sodiq Lawal','Kemi Afolabi','Maryam Sani','Hauwa Musa','David Ojo','Ifeanyi Obi','Rukayat Salami',
    'Samuel Akpan','Mercy George','Janet Effiong','Abdul Kareem','Esther Nnamdi','Favour John','Kingsley Nwosu',
    'Deborah Okon','Taiwo Balogun','Khadija Bello','Collins Eze','Yetunde Salami','Ibrahim Lawal','Sandra Udo',
    'Gbenga Cole','Victoria James','Paul Etim','Joyce Peter','Mubarak Ahmed','Rita Okafor','Chidera Obi',
    'Bola Martins','Hadiza Aliyu','Jennifer Uche','Victor Daniel','Grace Monday','Ayomide Cole','Peter Chukwu',
    'Pauline Edet','Olamide Adebayo','Nneka Eze','Usman Bello','Cynthia Okoro','Femi Ajayi','Rahmat Yusuf',
    'Michael Akpan','Faith Nwankwo','Seyi Lawal','Amaka George','Temitope Bakare','Daniel Etim','Precious James',
    'Kelvin Udo','Zainab Ibrahim','Halima Musa','Benedict Oke','Oluwatobi Ajayi'
  ];

  // These are fictional preview/test comments only. The UI labels the stream as DEMO.
  const seed = [
    ['Amina Yusuf','My cash gift just entered 😭❤️ Thank you Peller and Jarvis. God bless your new home.','',2,14],
    ['Tosin Adeyemi','Congratulations sis. I am still waiting for mine 🙏','Amina Yusuf',1.7,4],
    ['Fatima Bello','I received mine now. I honestly did not expect it this fast. Thank you both so much ❤️','',4,18],
    ['Chisom Nwankwo','Mine came too 🙌 God will continue to bless Peller and Jarvis.','',6,12],
    ['Emeka Okoro','I just got the cash gift. Thank you thank you thank you 😭🙏','',8,16],
    ['Blessing Eze','May God bless this marriage with peace, long life and plenty happiness. I got mine ❤️','',10,21],
    ['Sodiq Lawal','Payment received here 😂🔥 Peller no dey disappoint. God bless una both.','',12,15],
    ['Kemi Afolabi','I have received my own. Thank you Jarvis ❤️ May your home be blessed forever.','',14,19],
    ['Maryam Sani','Mine just entered now wow 😭 I am grateful. God bless Peller and Jarvis.','',17,11],
    ['Hauwa Musa','Congratulations ❤️','Maryam Sani',16.6,3],
    ['David Ojo','I got mine too. Thank you both and happy married life 🙏','',20,13],
    ['Ifeanyi Obi','Cash gift received. More blessings to this beautiful couple ❤️','',23,10],
    ['Rukayat Salami','I was checking my phone and the alert just came 😭 thank you so much.','',27,17],
    ['Samuel Akpan','Received mine successfully 🙌 God bless Peller and Jarvis for remembering the fans.','',31,9],
    ['Mercy George','Same here, mine just came ❤️','Samuel Akpan',30.5,2],
    ['Janet Effiong','I got my own cash gift. May joy never leave your home 🙏❤️','',35,18],
    ['Abdul Kareem','Alhamdulillah I received mine. Thank you and congratulations to the couple.','',39,12],
    ['Esther Nnamdi','My own entered just now 😭❤️ God bless you people seriously.','',43,14],
    ['Favour John','Received 🙌 I pray your marriage will be full of favour and peace.','',47,11],
    ['Kingsley Nwosu','Thank you Peller and Jarvis. My cash gift came through. More wins to both of you 🙏','',52,16],
    ['Deborah Okon','Amen and congratulations ❤️','Kingsley Nwosu',51.5,4],
    ['Taiwo Balogun','I just received mine too. I appreciate this so much 🙏','',57,9],
    ['Khadija Bello','Mine came earlier. May Allah bless your union and give you a peaceful home.','',63,13],
    ['Collins Eze','Alert received 😂🔥 Thank you Peller and Jarvis. More blessings.','',69,8],
    ['Yetunde Salami','I got mine ❤️ I pray this marriage keeps bringing both of you joy.','',76,15],
    ['Ibrahim Lawal','Received my cash gift. Thank you both. God go bless una marriage 🙏','',84,10],
    ['Sandra Udo','Mine entered. Congratulations Jarvis ❤️ Wishing you both a beautiful home.','',93,14],
    ['Gbenga Cole','I received mine successfully. This really made my day 🙏','',103,9],
    ['Victoria James','Thank you so much. My own came in and I am grateful ❤️','',114,12],
    ['Paul Etim','Cash received 🙌 More money and more happiness to the couple.','',126,8],
    ['Joyce Peter','Mine just came. I pray God continues to provide for you both ❤️','',139,11],
    ['Mubarak Ahmed','Congratulations, mine came too 🙏','Joyce Peter',138.4,3],
    ['Rita Okafor','I received my gift. Thank you Peller and Jarvis, may your home be full of laughter ❤️','',153,17],
    ['Chidera Obi','Payment received. I appreciate this a lot. Happy married life to you both 🙏','',168,9],
    ['Bola Martins','Mine entered too ❤️','Chidera Obi',167.5,2],
    ['Hadiza Aliyu','I got mine. May God reward your kindness and bless the marriage.','',184,12],
    ['Jennifer Uche','Received 🙌 I am so happy. Thank you both and congratulations again.','',201,13],
    ['Victor Daniel','My cash gift came through. God bless Peller and Jarvis abundantly 🙏❤️','',219,15],
    ['Grace Monday','I just got mine 😭 thank you so much. May this home never lack anything good.','',238,16],
    ['Ayomide Cole','Congratulations ❤️ mine came too','Grace Monday',237.4,3],
    ['Peter Chukwu','Received my own. God bless una, happy married life 🙏','',258,9],
    ['Pauline Edet','Mine entered too. Thank you so much ❤️','Peter Chukwu',257.5,2],
    ['Olamide Adebayo','I got the cash gift. Wishing both of you love, peace and long life together.','',279,14],
    ['Nneka Eze','Received ❤️ Thank you Peller and Jarvis. God bless your new home.','',301,11],
    ['Usman Bello','Mine came through successfully. May your marriage be blessed with peace and prosperity.','',326,13],
    ['Cynthia Okoro','I received mine 🙏❤️ Congratulations to this beautiful couple.','',353,15],
    ['Femi Ajayi','Alert received 😂 Thank you both. God bless the family.','',382,8],
    ['Rahmat Yusuf','I got mine. I pray greater blessings come back to you both 🙏','',414,10],
    ['Michael Akpan','Same here, received mine too.','Rahmat Yusuf',413.5,2],
    ['Faith Nwankwo','Mine also came ❤️','Rahmat Yusuf',413,2],
    ['Seyi Lawal','Cash gift received. May God bless your home with understanding and happiness.','',448,14],
    ['Amaka George','Amen ❤️ I received mine too','Seyi Lawal',447.5,3]
  ];

  const liveMessages = [
    'My cash gift just entered 😭❤️ Thank you Peller and Jarvis. God bless your home.',
    'I received mine now 🙌 Thank you both so much. Happy married life.',
    'Mine came through successfully. May God continue to bless this marriage 🙏',
    'Alert received 😂🔥 Thank you Peller and Jarvis. More blessings to your family.',
    'I just got mine. I am genuinely grateful ❤️ God bless you both.',
    'Received my own cash gift 🙏 May joy and peace never leave your home.',
    'Mine entered just now 😭 Thank you so much. Congratulations again ❤️',
    'I got the cash gift. May God reward your kindness and bless your union.',
    'Payment received here 🙌 Wishing both of you long life, peace and happiness.',
    'My own came in ❤️ Thank you Peller and Jarvis. May your home prosper.',
    'I received mine successfully. This made my day, thank you both 🙏',
    'Mine just landed 😂❤️ God bless you people and happy married life.',
    'Cash gift received. I pray greater blessings return to both of you.',
    'I got mine now. Thank you Jarvis ❤️ May your marriage remain beautiful forever.',
    'Received 🙌 May this new home be filled with favour, love and understanding.',
    'My alert came through. Thank you Peller and Jarvis, more wins to you both.',
    'I have received mine ❤️ I pray your home will never lack anything good.',
    'Mine came too. God bless the couple and everyone celebrating with them 🙏',
    'Just received my cash gift 😭❤️ I appreciate this so much.',
    'Received successfully. Congratulations and may God keep both of you together in peace.',
    'My own entered 🙌 Thank you both. May happiness follow this marriage always.',
    'I got mine. I pray blessings will multiply back to Peller and Jarvis ❤️',
    'Cash received 😂🔥 Thank you. God bless your new home abundantly.',
    'Mine just came in. I am grateful 🙏 Happy married life to both of you.',
    'Received mine ❤️ May your marriage bring you both favour and endless joy.',
    'I got the alert now 😭 Thank you so much. God bless your union.',
    'Payment came through. More grace, peace and prosperity to the couple 🙏',
    'Mine has entered ❤️ Congratulations Peller and Jarvis and thank you both.',
    'I received my own. May God continue to open doors for both of you.',
    'Cash gift received 🙌 I pray your home remains full of love and laughter.'
  ];

  const liveReplies = [
    'Congratulations ❤️ mine came too.',
    'Same here 🙌 thank God.',
    'Amen 🙏 God bless them.',
    'Mine just entered too 😭❤️',
    'Congratulations, I received mine earlier.',
    'Amen ❤️ wishing them the same.',
    'Same here, I am grateful.',
    'God bless them seriously 🙏',
    'Congratulations 🎉 mine came through too.',
    'Amen and happy married life to them ❤️'
  ];

  const demoComments = seed.map((item,index) => ({
    id: `demo-${index + 1}`,
    n: item[0],
    t: item[1],
    replyTo: item[2],
    ts: now - Math.round(item[3] * minute),
    l: item[4],
    demo: true
  }));

  if (previewActive) {
    try {
      const key = 'pj_fan_gift_modular';
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      const existing = Array.isArray(state.userComments) ? state.userComments : [];
      const realComments = existing.filter(comment => !comment.demo);
      state.userComments = [...realComments, ...demoComments];
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Comment preview seed failed:', error);
    }
  }

  return {
    maxStoredComments: 300,
    previewActive,
    previewLabel: 'DEMO TESTIMONIAL PREVIEW',
    demoComments,
    livePeople: people,
    liveMessages,
    liveReplies
  };
})();
