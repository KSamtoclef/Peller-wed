window.FAN_CONVERSATION = (() => {
  const previewActive =
    location.hostname === 'localhost' ||
    location.hostname.endsWith('.vercel.app') ||
    new URLSearchParams(location.search).get('commentsPreview') === '1';

  const now = Date.now();
  const minute = 60 * 1000;

  const seed = [
    ['Amina Yusuf','I am going for the data option 😅','',3,2],
    ['Tosin Adeyemi','Same here, data first 😂','Amina Yusuf',2.6,1],
    ['Fatima Bello','Congratulations to Peller and Jarvis ❤️','',4,9],
    ['Chisom Nwankwo','Who else selected cash?','',5,4],
    ['Emeka Okoro','Cash for me too.','Chisom Nwankwo',4.6,2],
    ['Blessing Eze','The wedding picture is beautiful sha ❤️','',7,6],
    ['Sodiq Lawal','Cow gift people where una dey 😂','',9,8],
    ['Kemi Afolabi','I picked data. I need that one pass everything 😂','',11,5],
    ['Maryam Sani','Please which gift did you people choose?','',13,3],
    ['Hauwa Musa','I chose any available gift.','Maryam Sani',12.6,2],
    ['David Ojo','Data gang here 🙌','Maryam Sani',12.2,4],
    ['Ifeanyi Obi','Congratulations to both of them.','',16,7],
    ['Rukayat Salami','I almost chose cash but changed to data 😂','',19,3],
    ['Samuel Akpan','Anybody here choosing cow gift?','',22,4],
    ['Mercy George','Me 😂','Samuel Akpan',21.6,2],
    ['Janet Effiong','This green and gold looks nice.','',26,6],
    ['Abdul Kareem','I came from WhatsApp.','',31,3],
    ['Esther Nnamdi','Same, somebody dropped it in our group.','Abdul Kareem',30.5,1],
    ['Favour John','I selected cash gift.','',36,5],
    ['Kingsley Nwosu','May God bless their home 🙏','',42,10],
    ['Deborah Okon','Amen 🙏','Kingsley Nwosu',41.5,3],
    ['Taiwo Balogun','Which one are most people choosing, cash or data?','',48,4],
    ['Khadija Bello','Looks like data 😂','Taiwo Balogun',47.5,2],
    ['Collins Eze','Cash people are quiet 😂','Taiwo Balogun',47.1,1],
    ['Yetunde Salami','I picked any available gift.','',55,3],
    ['Ibrahim Lawal','Peller fans plenty here o 😂','',63,8],
    ['Sandra Udo','Congratulations Jarvis ❤️','',71,7],
    ['Gbenga Cole','The cow option made me laugh but I actually picked it 😂','',82,6],
    ['Victoria James','I chose data for my younger brother.','',95,5],
    ['Paul Etim','Cash gift for me please 😂','',108,4],
    ['Joyce Peter','I am still deciding between cash and data.','',122,3],
    ['Mubarak Ahmed','Just pick data 😂','Joyce Peter',121.5,2],
    ['Rita Okafor','The couple look good together ❤️','',138,9],
    ['Chidera Obi','I saw this in my class group.','',154,4],
    ['Bola Martins','Same here.','Chidera Obi',153.5,1],
    ['Hadiza Aliyu','Any available gift gang 😂','',176,6],
    ['Jennifer Uche','I picked data immediately.','',198,4],
    ['Victor Daniel','Congratulations to them 🎉','',224,8],
    ['Grace Monday','Who picked cow gift apart from me? 😂','',252,5],
    ['Ayomide Cole','Me too 😂','Grace Monday',251.4,2],
    ['Peter Chukwu','Cash gift people make una show face 😂','',286,4],
    ['Pauline Edet','Here 🙋‍♀️','Peter Chukwu',285.5,2],
    ['Olamide Adebayo','I like the wedding photo.','',326,5],
    ['Nneka Eze','Data option all the way.','',371,4],
    ['Usman Bello','I just opened it now from WhatsApp.','',422,3],
    ['Cynthia Okoro','Congratulations Peller and Jarvis ❤️','',486,9],
    ['Femi Ajayi','I picked any available gift because I no wan stress 😂','',552,7],
    ['Rahmat Yusuf','Cash or data? I am confused 😭','',630,4],
    ['Michael Akpan','Data 😂','Rahmat Yusuf',629.5,2],
    ['Faith Nwankwo','Cash for me.','Rahmat Yusuf',629,2],
    ['Seyi Lawal','God bless their new home.','',715,8],
    ['Amaka George','Amen ❤️','Seyi Lawal',714.5,2]
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
    maxStoredComments: 120,
    previewActive,
    previewLabel: 'DEMO COMMENT PREVIEW',
    demoComments
  };
})();
