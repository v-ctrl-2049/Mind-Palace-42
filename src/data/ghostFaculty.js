// ── Ghost Faculty ─────────────────────────────────────────────────
// The scholars, writers, and thinkers who haunt Mind Palace 42.
// Each has a characteristic mode, trigger keywords, and 3-4 notices.
// They appear as marginalia in Teatro Anatomico and The Vault.

export const GHOST_FACULTY = [

  // ── CLASSICS ─────────────────────────────────────────────────────

  {
    id: 'homer',
    name: 'Homer',
    dates: 'c.8th century BCE (disputed)',
    domain: 'Classics',
    mode: 'The catalogue, the epic form, the uncertain author. The story that contains everything.',
    triggers: ['epic', 'war', 'hero', 'catalogue', 'troy', 'odyssey', 'iliad', 'oral', 'myth', 'poetry', 'blind', 'authorship'],
    notices: [
      'The catalogue is knowledge. To name everything is to possess it. Have you named everything in this entry?',
      'I may not have existed. The text existed. The author is less important than the work. Remember this when you cite.',
      'The Iliad begins in the middle. History always begins in the middle. Where does your entry begin, and why there?',
      'Rage — sing it, goddess. Every great inquiry begins with an emotion you are not supposed to have. What is yours?',
    ],
  },

  {
    id: 'herodotus',
    name: 'Herodotus',
    dates: 'c.484–c.425 BCE',
    domain: 'Classics',
    mode: 'The story inside the document. The human detail that makes history memorable and real.',
    triggers: ['persia', 'greece', 'war', 'custom', 'culture', 'travel', 'foreign', 'barbarian', 'egypt', 'origins', 'inquiry'],
    notices: [
      'I recorded what was said, not necessarily what was true. Note the distinction when reading your sources.',
      'Every document contains a story. Have you found the human being inside this one?',
      'The most important things are often the strangest. Do not discount the improbable detail.',
      'Different peoples understand the same events differently. Whose understanding does your source carry?',
    ],
  },

  {
    id: 'thucydides',
    name: 'Thucydides',
    dates: 'c.460–c.400 BCE',
    domain: 'Classics',
    mode: 'Power and interest behind every stated reason. The ruthless logic beneath the surface.',
    triggers: ['power', 'war', 'state', 'empire', 'democracy', 'conflict', 'alliance', 'athens', 'sparta', 'politics', 'realism'],
    notices: [
      'The cause given is never the real cause. Look for the interest.',
      'States behave as they must, not as they claim. What does the evidence show they actually did?',
      'The strong do what they can; the weak suffer what they must. Where does this appear in your evidence?',
      'History is written by those who survive to write it. What voices are absent from this record?',
    ],
  },

  {
    id: 'plato',
    name: 'Plato',
    dates: 'c.428–c.348 BCE',
    domain: 'Classics / Philosophy',
    mode: 'The ideal form behind the historical appearance. What the thing truly is beneath what it seems.',
    triggers: ['justice', 'truth', 'knowledge', 'soul', 'form', 'ideal', 'philosophy', 'education', 'state', 'virtue', 'cave', 'republic'],
    notices: [
      'What is the Form behind this particular? The definition matters before the examples.',
      'The cave shows us shadows. Does your evidence point toward the light or merely describe the wall?',
      'Justice is each thing doing its proper work. What is the proper work of this concept?',
      'Philosophy begins in wonder. What in this entry still genuinely puzzles you?',
    ],
  },

  {
    id: 'ovid',
    name: 'Ovid',
    dates: '43 BCE–17/18 CE',
    domain: 'Classics',
    mode: 'Transformation, nothing stays fixed, categories dissolve into each other.',
    triggers: ['transformation', 'change', 'metamorphosis', 'myth', 'body', 'love', 'exile', 'rome', 'form', 'becoming'],
    notices: [
      'Everything you see here has been something else. The concept you are studying was once called something different.',
      'I was exiled for a poem and a mistake. The archive never forgives. What has been exiled from this record?',
      'My mind leads me to speak of bodies changed into new forms. What is changing form in this entry?',
      'Nothing is permanent. The category you are defining will dissolve. Define it anyway, precisely.',
    ],
  },

  {
    id: 'livy',
    name: 'Livy',
    dates: '64/59 BCE–12/17 CE',
    domain: 'Classics / History',
    mode: 'History as moral instruction. The lesson the past offers to the present.',
    triggers: ['rome', 'republic', 'virtue', 'decline', 'exemplar', 'moral', 'civic', 'duty', 'law', 'founding'],
    notices: [
      'History teaches by example. What conduct does this entry commend or condemn?',
      'The decline of a great institution is always preceded by the decline of its virtues.',
      'Every generation reads the past it needs. What need shapes this interpretation?',
      'The founding moment shapes everything that follows. What is the founding moment of this concept?',
    ],
  },

  {
    id: 'virgil',
    name: 'Virgil',
    dates: '70–19 BCE',
    domain: 'Classics',
    mode: 'The necessary descent. The guide who has been there before. The underworld as archive.',
    triggers: ['rome', 'destiny', 'empire', 'descent', 'underworld', 'guide', 'aeneas', 'founding', 'piety', 'duty', 'loss'],
    notices: [
      'The descent is necessary. You cannot understand what you are looking for until you have gone all the way down.',
      'I was Dante\'s guide because I had been there before. Every archive requires someone who has already descended.',
      'Easy is the descent. Returning — that is the work. What will you bring back from this evidence?',
      'The tears of things. Sunt lacrimae rerum. The archive is full of grief. Acknowledge it.',
    ],
  },

  // ── HISTORIANS ───────────────────────────────────────────────────

  {
    id: 'ibn_khaldun',
    name: 'Ibn Khaldun',
    dates: '1332–1406',
    domain: 'History / Law / Economy',
    mode: 'Civilisational cycles. The deep structure beneath the surface of events.',
    triggers: ['dynasty', 'civilisation', 'cycle', 'decline', 'asabiyyah', 'solidarity', 'state', 'economy', 'urban', 'tribe', 'islam'],
    notices: [
      'Every dynasty carries within it the seeds of its own decline. Where in your evidence is this visible?',
      'Group solidarity — asabiyyah — is the foundation of all political power. What solidarity built this?',
      'The city is built by the desert; the desert is built by the city. The cycle is always already turning.',
      'The historian who does not understand economics misunderstands history itself.',
    ],
  },

  {
    id: 'sima_qian',
    name: 'Sima Qian',
    dates: 'c.145–c.86 BCE',
    domain: 'History (China)',
    mode: 'The official record and what it conceals. Writing history under constraint.',
    triggers: ['china', 'han', 'court', 'emperor', 'official', 'record', 'dynasty', 'punishment', 'loyalty', 'history', 'shiji'],
    notices: [
      'I wrote this in suffering. What did the author of your source risk by writing it?',
      'The official record is true and false simultaneously. What has been omitted to make it true?',
      'Every historian writes under constraint. What are yours?',
      'The Grand Historian\'s duty is to record, not to please. Have your sources fulfilled this duty?',
    ],
  },

  {
    id: 'ranke',
    name: 'Leopold von Ranke',
    dates: '1795–1886',
    domain: 'History (EU)',
    mode: 'Wie es eigentlich gewesen — as it actually was. Source criticism above all.',
    triggers: ['source', 'document', 'archive', 'primary', 'evidence', 'objectivity', 'method', 'critique', 'germany', 'europe'],
    notices: [
      'Wie es eigentlich gewesen — as it actually was. Does your source bring us closer to this?',
      'Every age is immediate to God. But every document is mediated by its author. Check the author.',
      'The primary source is not the past. It is the past\'s trace. Treat it accordingly.',
      'Historical criticism begins with a simple question: how does this source know what it claims to know?',
    ],
  },

  {
    id: 'eh_carr',
    name: 'E.H. Carr',
    dates: '1892–1982',
    domain: 'History (EU)',
    mode: 'What is history? The historian is always implicated in what they write.',
    triggers: ['objectivity', 'fact', 'interpretation', 'historian', 'present', 'past', 'bias', 'causation', 'what is history'],
    notices: [
      'Before studying the history, study the historian. What does this source tell you about its author\'s moment?',
      'The historian and the facts of history are necessary to one another. Neither stands alone.',
      'The belief in a hard core of historical facts existing objectively is a preposterous fallacy.',
      'Causation in history is never single. What other causes has your evidence obscured?',
    ],
  },

  {
    id: 'hobsbawm',
    name: 'Eric Hobsbawm',
    dates: '1917–2012',
    domain: 'History (EU) / Economy',
    mode: 'The long nineteenth century. Class, capitalism, the invention of tradition.',
    triggers: ['class', 'capitalism', 'revolution', 'tradition', 'nation', 'labour', 'industry', 'empire', 'nineteenth century', 'invention'],
    notices: [
      'Tradition that claims to be ancient is usually quite recent. When was this concept invented?',
      'The short twentieth century began in 1914 and ended in 1991. What century does your evidence belong to?',
      'Nations are not natural facts. They are constructed. What constructed this one?',
      'Class is not a category. It is a relationship. What relationship does your evidence show?',
    ],
  },

  {
    id: 'marc_bloch',
    name: 'Marc Bloch',
    dates: '1886–1944',
    domain: 'History (EU)',
    mode: 'Reading sources against the grain. What the document did not intend to reveal.',
    triggers: ['medieval', 'document', 'silence', 'feudal', 'society', 'method', 'witness', 'annales', 'france', 'unintended'],
    notices: [
      'The witness who did not intend to testify is the most reliable. What does your source reveal unintentionally?',
      'History is the science of men in time. Not events, not states — men. Where are the people in your evidence?',
      'A document is a witness. And like all witnesses, it may lie. Where might this one be lying?',
      'The most important question a historian asks is: why? Not what happened, but why.',
    ],
  },

  {
    id: 'ep_thompson',
    name: 'E.P. Thompson',
    dates: '1924–1993',
    domain: 'History (EU)',
    mode: 'The human cost inside the document. History from below.',
    triggers: ['class', 'working', 'labour', 'experience', 'agency', 'custom', 'moral economy', 'crowd', 'protest', 'england'],
    notices: [
      'The making of a class is a process, not a structure. What process does your evidence describe?',
      'Ordinary people make history too. Where in your evidence are the people who did not leave records?',
      'The moral economy of the crowd was not irrational. What rationality does your evidence reveal?',
      'Agency matters. People are not merely the products of their conditions. Where is the agency here?',
    ],
  },

  {
    id: 'natalie_davis',
    name: 'Natalie Zemon Davis',
    dates: '1928–2023',
    domain: 'History (EU / US)',
    mode: 'The archive document as human story. Gender, culture, microhistory.',
    triggers: ['gender', 'women', 'culture', 'identity', 'narrative', 'story', 'community', 'ritual', 'france', 'early modern'],
    notices: [
      'Every document is someone\'s story. Whose story is being told here, and whose is being silenced?',
      'The archive is full of lives. Have you found the life inside this document?',
      'Fiction and fact are not opposites in the archive. Both reveal the possible.',
      'The margins of the document are often more revealing than its centre.',
    ],
  },

  {
    id: 'ginzburg',
    name: 'Carlo Ginzburg',
    dates: '1939–',
    domain: 'History (EU)',
    mode: 'The clue as method. Microhistory. The detective approach to the archive.',
    triggers: ['clue', 'detail', 'micro', 'trace', 'index', 'symptom', 'freud', 'sherlock', 'witch', 'italy', 'inquisition'],
    notices: [
      'The clue is the method. What small detail in your evidence does not fit the larger pattern?',
      'Morelli identified paintings by fingernails and earlobes. What is the fingerprint in your document?',
      'Microhistory is not small history. It is a lens that reveals what macro-history cannot see.',
      'The exception is more revealing than the rule. What in this entry breaks the expected pattern?',
    ],
  },

  {
    id: 'gibbon',
    name: 'Edward Gibbon',
    dates: '1737–1794',
    domain: 'History (EU) / Classics',
    mode: 'The great arc. Decline and fall. The historian as literary stylist.',
    triggers: ['rome', 'decline', 'fall', 'empire', 'barbarian', 'christianity', 'civilisation', 'collapse', 'arc', 'long view'],
    notices: [
      'I sat among the ruins of the Capitol and conceived this work. Where did you conceive yours?',
      'All that is human must retrograde if it does not advance. Where is your subject on this arc?',
      'The style is the argument. An ugly sentence is an unclear thought. Revise both simultaneously.',
      'Empires fall from within before they fall from without. What internal decay does your evidence show?',
    ],
  },

  {
    id: 'paul_cohen',
    name: 'Paul A. Cohen',
    dates: '1934–',
    domain: 'History (China)',
    mode: 'China-centred history. Against Western frameworks imposed on Chinese material.',
    triggers: ['china', 'western', 'framework', 'imperialism', 'qing', 'modern', 'sino', 'reform', 'boxer', 'china-centred'],
    notices: [
      'The China-centred approach begins with a question: what mattered to the people living through this?',
      'Western frameworks applied to Chinese history produce Western answers to Chinese questions. Start over.',
      'The problem is not the evidence. The problem is the question you brought to the evidence.',
      'Chinese history did not begin with Western contact. What existed before that frame was imposed?',
    ],
  },

  {
    id: 'spence',
    name: 'Jonathan Spence',
    dates: '1936–2021',
    domain: 'History (China)',
    mode: 'Narrative mastery. The Western eye that sees clearly and knows its position.',
    triggers: ['china', 'qing', 'ming', 'narrative', 'story', 'western', 'gate', 'mao', 'emperor', 'modern china'],
    notices: [
      'The story must carry the argument. If the narrative fails, the history fails.',
      'I came to China from outside. I knew this. Knowing your position is the beginning of honest scholarship.',
      'The gate of heavenly peace stands at the centre of everything. Where is the centre of your inquiry?',
      'History is always biography at some level. Who is the human being at the centre of this evidence?',
    ],
  },

  {
    id: 'fairbank',
    name: 'John King Fairbank',
    dates: '1907–1991',
    domain: 'History (China)',
    mode: 'The architecture of a field. The long view of Sino-Western relations.',
    triggers: ['china', 'america', 'west', 'sino', 'treaty', 'modern', 'relations', 'field', 'harvard', 'sinology'],
    notices: [
      'A field is built by the questions it asks. What questions has this field not yet asked?',
      'Sino-American relations have always been about each side\'s image of the other. Which image is operating here?',
      'The long view reveals what the short view cannot. Step back. What arc is visible from further out?',
      'The documents tell you what was written. The silence tells you what could not be written. Read both.',
    ],
  },

  {
    id: 'needham',
    name: 'Joseph Needham',
    dates: '1900–1995',
    domain: 'History (China) / Science',
    mode: 'The comparative question — why here and not there? Absence as evidence.',
    triggers: ['china', 'science', 'technology', 'gunpowder', 'printing', 'compass', 'why', 'europe', 'revolution', 'comparative'],
    notices: [
      'The absence of an event is also evidence. Why did this not happen here?',
      'I spent forty years asking one question. The Needham Question is a method, not just a curiosity.',
      'China had it first. Europe developed it further. The question is not who had it — it is why the divergence.',
      'Science and civilisation are not Western achievements. They are human achievements. Restore the full map.',
    ],
  },

  // ── MEDICAL / SCIENTIFIC ─────────────────────────────────────────

  {
    id: 'vesalius',
    name: 'Andreas Vesalius',
    dates: '1514–1564',
    domain: 'Medicine (History)',
    mode: 'Look directly at the body. Distrust received authority. The dissection table is where knowledge begins.',
    triggers: ['body', 'anatomy', 'dissection', 'medicine', 'galen', 'skeleton', 'organ', 'padua', 'fabrica', 'observation'],
    notices: [
      'Galen had never dissected a human body. He was wrong about everything he could not see directly. Look directly.',
      'The dissection table is the only place where received wisdom can be tested. What are you cutting open today?',
      'De Humani Corporis Fabrica — On the Fabric of the Human Body. What is the fabric of your concept?',
      'I published my corrections to Galen at 28. Authority is not evidence. Your eyes are evidence.',
    ],
  },

  {
    id: 'galen',
    name: 'Galen',
    dates: '129–c.216 CE',
    domain: 'Medicine (History)',
    mode: 'The systematic framework. Certain and eventually proved wrong. The cost of closing the question.',
    triggers: ['medicine', 'body', 'humour', 'system', 'authority', 'ancient', 'rome', 'theory', 'framework', 'certainty'],
    notices: [
      'I was right about more than I was wrong about. But I was wrong about the heart, the blood, the liver. The system seemed complete. It was not.',
      'A comprehensive system is seductive. Resist the seduction. The system that explains everything explains nothing.',
      'I worked from pigs and monkeys, not humans. I did not know this was a limitation. What are you not seeing directly?',
      'Fourteen centuries of authority. Then Vesalius looked. The lesson is not that I was wrong. It is that the question was closed too soon.',
    ],
  },

  {
    id: 'avicenna',
    name: 'Ibn Sina (Avicenna)',
    dates: '980–1037',
    domain: 'Medicine (History) / Classics',
    mode: 'Systematic classification. The bridge between Greek medicine and Islamic scholarship.',
    triggers: ['medicine', 'canon', 'classification', 'islam', 'philosophy', 'soul', 'body', 'persian', 'system', 'synthesis'],
    notices: [
      'The Canon of Medicine organised everything that was known. Organise what you know. The organisation is half the argument.',
      'I was a philosopher who practised medicine and a physician who did philosophy. The disciplines speak to each other.',
      'The floating man experiment: imagine yourself with no sensory input. What remains? That is the soul — or the self. What remains of your concept when context is removed?',
      'I wrote one million words. Not one of them was wasted. Precision is not pedantry. It is respect for the subject.',
    ],
  },

  {
    id: 'osler',
    name: 'William Osler',
    dates: '1849–1919',
    domain: 'Medicine (History)',
    mode: 'The case history is everything. Observe the patient. Observe the evidence.',
    triggers: ['clinical', 'observation', 'patient', 'case', 'diagnosis', 'medicine', 'hospital', 'bedside', 'symptom', 'evidence'],
    notices: [
      'Listen to your patient. They are telling you the diagnosis. Listen to your source. It is telling you the argument.',
      'The case history is the foundation of everything. What is the case history of this concept?',
      'Medicine is the art of uncertainty and the science of probability. So is history. Proceed accordingly.',
      'Observe, record, tabulate, communicate. The sequence matters. Observation before interpretation — always.',
    ],
  },

  {
    id: 'kuriyama',
    name: 'Shigehisa Kuriyama',
    dates: '1953–',
    domain: 'Medicine (History) / History (China)',
    mode: 'The body understood differently across cultures. Greek and Chinese medicine as two ways of knowing.',
    triggers: ['body', 'china', 'greece', 'pulse', 'muscle', 'wind', 'qi', 'medicine', 'culture', 'expressiveness', 'comparative'],
    notices: [
      'Greek doctors saw muscles. Chinese doctors felt wind and qi. The body is not the same body in both traditions.',
      'The expressiveness of the body is culturally specific. What body is your evidence speaking from?',
      'Wind and breath and qi — the Chinese medical body moves differently from the dissected Greek body. Which body is yours?',
      'Comparative history of medicine reveals that what seems universal is always local. What local assumption are you carrying?',
    ],
  },

  {
    id: 'starr',
    name: 'Paul Starr',
    dates: '1949–',
    domain: 'Medicine (Humanity)',
    mode: 'Medicine as a social and political institution. How the profession became a power structure.',
    triggers: ['medicine', 'profession', 'power', 'america', 'insurance', 'healthcare', 'social', 'institution', 'transformation'],
    notices: [
      'Medicine became a profession by controlling access. What does this concept control access to?',
      'The social transformation of medicine is a story about power, not science. Whose power?',
      'Every institution presents itself as a technical necessity. Ask what political arrangements it normalises.',
      'The transformation of medicine in America is also the transformation of American capitalism. The two cannot be separated.',
    ],
  },

  // ── CRITICAL THEORY / PHILOSOPHY ────────────────────────────────

  {
    id: 'foucault',
    name: 'Michel Foucault',
    dates: '1926–1984',
    domain: 'History (EU) / Philosophy',
    mode: 'Genealogy. Conditions of possibility. Power/knowledge. The archaeology beneath the history.',
    triggers: ['power', 'knowledge', 'discourse', 'genealogy', 'discipline', 'body', 'prison', 'clinic', 'sexuality', 'archaeology', 'biopolitics', 'gaze'],
    notices: [
      'The question is not what the body is, but how the body became an object of knowledge at this particular moment.',
      'Every concept has a history of its own exclusions. What does this entry not say? That absence is the work.',
      'Power is not repressive — it is productive. What does this concept produce? What subjectivities does it make possible?',
      'The genealogist asks not what something is but how it came to seem natural and inevitable. Begin there.',
    ],
  },

  {
    id: 'benjamin',
    name: 'Walter Benjamin',
    dates: '1892–1940',
    domain: 'History (EU) / Philosophy',
    mode: 'Fragments, the dialectical image, the angel of history facing backwards into the wreckage.',
    triggers: ['fragment', 'arcade', 'flâneur', 'aura', 'reproduction', 'angel', 'history', 'memory', 'image', 'constellation', 'now'],
    notices: [
      'To write history means to cite history — to rip a fragment out of the homogeneous course of events.',
      'The angel of history faces the past. Where we see a chain of events, he sees one single catastrophe.',
      'Every document of civilisation is simultaneously a document of barbarism. What barbarism is in your document?',
      'The now of recognisability — Jetztzeit. The past flashes up at the moment of danger. What is the danger your evidence addresses?',
    ],
  },

  {
    id: 'barthes',
    name: 'Roland Barthes',
    dates: '1915–1980',
    domain: 'Classics / History (EU)',
    mode: 'The mythology beneath the natural. The punctum in the document. The sign that wounds.',
    triggers: ['sign', 'myth', 'ideology', 'photograph', 'text', 'author', 'pleasure', 'punctum', 'studium', 'culture', 'language', 'semiotics'],
    notices: [
      'This concept presents itself as self-evident. That is the first thing to distrust.',
      'The studium tells you what the image is about. The punctum tells you what it means. They are rarely the same.',
      'The death of the author. The text means what it means to you, not what the author intended. Read accordingly.',
      'The mythologist\'s job is to show the historical roots of what presents itself as natural. Begin there.',
    ],
  },

  {
    id: 'adorno',
    name: 'Theodor Adorno',
    dates: '1903–1969',
    domain: 'Philosophy / Economy',
    mode: 'Negative dialectics. Refuse the resolution. The whole is the false.',
    triggers: ['culture industry', 'enlightenment', 'dialectic', 'negative', 'fragment', 'music', 'art', 'capitalism', 'fascism', 'resistance', 'commodity'],
    notices: [
      'The whole is the false. If your argument resolves too neatly, something has been suppressed.',
      'Thought that is comfortable with itself has stopped thinking.',
      'What does this concept exclude in order to cohere? That exclusion is the evidence.',
      'The culture industry administers consciousness. What in this entry has been administered into acceptability?',
    ],
  },

  {
    id: 'horkheimer',
    name: 'Max Horkheimer',
    dates: '1895–1973',
    domain: 'Philosophy / Humanities',
    mode: 'Critical theory versus traditional theory. Whose interests does this serve?',
    triggers: ['critical theory', 'enlightenment', 'reason', 'eclipse', 'traditional', 'interest', 'domination', 'authority', 'instrumental'],
    notices: [
      'Traditional theory asks: how does this work? Critical theory asks: whose interests does this serve? Begin with the second question.',
      'Reason has become instrumental — it serves ends it cannot question. What ends does your framework serve?',
      'The eclipse of reason is the substitution of the technical for the substantive. Has this happened in your field?',
      'Every scholarly discipline has a traditional theory version and a critical theory version. Which are you practising?',
    ],
  },

  {
    id: 'deleuze_guattari',
    name: 'Deleuze & Guattari',
    dates: '1925–1995 / 1930–1992',
    domain: 'Philosophy / Practical',
    mode: 'The rhizome, not the tree. Nomad thought. Lines of flight. Entry from any point.',
    triggers: ['rhizome', 'tree', 'nomad', 'plateau', 'multiplicity', 'deterritorialise', 'assemblage', 'flow', 'body without organs', 'war machine'],
    notices: [
      'The map is not a tracing. The tracing reproduces, closes off, blocks. The map opens, connects, experiments.',
      'A rhizome has no beginning or end. It is always in the middle, between things. This is where thought lives.',
      'The tree imposes the verb "to be" but the rhizome is woven by conjunctions: and, and, and. What are you connecting?',
      'Nomad thought does not enclose territory. It moves across it. Where is your thought moving?',
    ],
  },

  {
    id: 'derrida',
    name: 'Jacques Derrida',
    dates: '1930–2004',
    domain: 'Classics / Philosophy',
    mode: 'Deconstruction. Close reading as genealogy. The trace, the supplement, the undecidable.',
    triggers: ['text', 'deconstruction', 'writing', 'presence', 'absence', 'supplement', 'trace', 'difference', 'logocentrism', 'close reading'],
    notices: [
      'There is nothing outside the text. Which means: context is everything. What is the context of this text?',
      'Deconstruction is not destruction. It is reading a text against itself to find what it cannot say.',
      'Every concept depends on what it excludes to define itself. What does this concept exclude?',
      'The supplement — what is added — reveals that the original was never complete. What is supplementing your argument?',
    ],
  },

  // ── NOMAD / DIASPORA / EXILE WING ───────────────────────────────

  {
    id: 'said',
    name: 'Edward Said',
    dates: '1935–2003',
    domain: 'History / Humanities',
    mode: 'Orientalism — the construction of the East by the West. The exile as intellectual position.',
    triggers: ['orientalism', 'empire', 'colonialism', 'representation', 'east', 'west', 'palestine', 'exile', 'culture', 'imperialism', 'other'],
    notices: [
      'Every concept in this domain was built somewhere. Ask where. Ask who built it and who it was built against.',
      'The Orient is not a fact of nature. It is a product of representation. What is being represented here, and by whom?',
      'The intellectual\'s role is to speak truth to power. Uncomfortable truths, not comfortable ones.',
      'Out of place — the exile sees both cultures from outside. What does your position outside allow you to see?',
    ],
  },

  {
    id: 'fanon',
    name: 'Frantz Fanon',
    dates: '1925–1961',
    domain: 'History / Humanities',
    mode: 'The colonised body and mind. The violence of colonialism and decolonisation.',
    triggers: ['colonialism', 'race', 'black', 'white', 'algeria', 'violence', 'decolonisation', 'psychiatry', 'body', 'wretched', 'mask'],
    notices: [
      'This document was written by the coloniser. It tells you what they saw. The gap between that and what existed is your research.',
      'The black man\'s soul is a white man\'s artifact. What artifacting has been done to this concept?',
      'Decolonisation is never a gentle affair. The same is true of decolonising a discipline.',
      'The colonised man who writes his own history writes himself back into existence. Who is writing themselves back in here?',
    ],
  },

  {
    id: 'stuart_hall',
    name: 'Stuart Hall',
    dates: '1932–2014',
    domain: 'History / Humanities',
    mode: 'Identity as positioning, not origin. Diaspora as cut, not root.',
    triggers: ['identity', 'diaspora', 'race', 'culture', 'representation', 'encoding', 'decoding', 'hegemony', 'caribbean', 'britain', 'positioning'],
    notices: [
      'Identity is not a fixed origin you return to. It is a positioning. Where are you positioned right now?',
      'Cultural identity is not an essence but a positioning. The same is true of every concept in your map.',
      'Encoding and decoding are not the same act. What you intend and what is received are always different texts.',
      'We are all, in a sense, from the diaspora. The question is what we carry and what we leave behind.',
    ],
  },

  {
    id: 'anzaldua',
    name: 'Gloria Anzaldúa',
    dates: '1942–2004',
    domain: 'Practical / Humanities',
    mode: 'The borderland as its own territory and knowledge. The mestiza consciousness.',
    triggers: ['border', 'borderland', 'identity', 'mestiza', 'chicana', 'language', 'body', 'knowledge', 'in-between', 'hybrid', 'nomad'],
    notices: [
      'The border is not the edge of two territories. It is its own territory. You live here. Use it.',
      'The mestiza consciousness learns to juggle cultures. It has a tolerance for contradiction and ambiguity.',
      'I am a wound that will not heal — and from that wound, knowledge. What is the wound in your inquiry?',
      'Writing from the borderland means writing from the place where languages and cultures collide. That collision is the method.',
    ],
  },

  // ── LITERARY WING ────────────────────────────────────────────────

  {
    id: 'dante',
    name: 'Dante Alighieri',
    dates: '1265–1321',
    domain: 'Classics / History (EU)',
    mode: 'The structured descent into total knowledge. The map of everything. The exile who mapped the universe.',
    triggers: ['hell', 'heaven', 'purgatory', 'divine', 'comedy', 'exile', 'love', 'structure', 'descent', 'medieval', 'italy', 'commedia'],
    notices: [
      'In the middle of the journey of our life, I came to myself in a dark wood. The archive is always a dark wood.',
      'I organised all of knowledge into a structure. The structure is the argument. What is your structure?',
      'Abandon all hope, ye who enter without a guide. Find your Virgil before you descend.',
      'I wrote in the vernacular deliberately. The scholar who cannot be understood has not finished thinking.',
    ],
  },

  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    dates: '1564–1616',
    domain: 'Everywhere',
    mode: 'The unresolvable held in language. Power as performance. The character who chooses villainy from exclusion.',
    triggers: ['power', 'history', 'king', 'tragedy', 'performance', 'identity', 'richard', 'henry', 'hamlet', 'iago', 'othello', 'england', 'time'],
    notices: [
      'The readiness is all. You will never have enough evidence. File the verdict anyway.',
      'All the world\'s a stage. This document is a performance. Who is the audience? What is being performed for them?',
      'I am determined to prove a villain. Richard III did not choose evil — he chose the only route available to him. What determines your argument?',
      'We are such stuff as dreams are made on. The archive will outlast you. Write what you found.',
    ],
  },

  {
    id: 'milton',
    name: 'John Milton',
    dates: '1608–1674',
    domain: 'Classics / Philosophy',
    mode: 'The best arguments for the wrong side. Satan\'s case. The problem of evil.',
    triggers: ['evil', 'paradise', 'fall', 'god', 'satan', 'theology', 'power', 'reason', 'england', 'revolution', 'blindness', 'justify'],
    notices: [
      'Better to reign in Hell than serve in Heaven. This is what every unresolved contradiction says. Hear it.',
      'I gave Satan the best lines because the best argument is not always the true one. Test your argument against its best opponent.',
      'The mind is its own place. The archive does not determine what you think — you determine what the archive means.',
      'To justify the ways of God to man — this is what every historian attempts. The justification is never complete.',
    ],
  },

  {
    id: 'thomas_mann',
    name: 'Thomas Mann',
    dates: '1875–1955',
    domain: 'History (EU)',
    mode: 'Time dilation. The archive that swallows you. The closed world of total inquiry.',
    triggers: ['time', 'germany', 'europe', 'disease', 'death', 'mountain', 'music', 'faustus', 'decline', 'civilisation', 'illness'],
    notices: [
      'He came for three weeks and stayed for seven years. Look at the calendar. How long have you been in here?',
      'The Magic Mountain is time made strange. In the archive, time is always strange. Have you noticed?',
      'Disease as heightened perception. The patient sees what the healthy cannot. What does your subject\'s extremity reveal?',
      'The European civilisation that produced the Magic Mountain produced also the First World War. The beauty and the catastrophe are the same thing.',
    ],
  },

  {
    id: 'woolf',
    name: 'Virginia Woolf',
    dates: '1882–1941',
    domain: 'Humanities',
    mode: 'The inside of thinking itself. The moment of being. A room of one\'s own.',
    triggers: ['consciousness', 'women', 'room', 'writing', 'time', 'stream', 'moment', 'modern', 'lighthouse', 'waves', 'memory', 'light'],
    notices: [
      'A woman must have money and a room of her own. What did this concept need in order to be thought? Who had the room?',
      'Arrange whatever pieces come your way. The arrangement is the argument.',
      'For most of history, Anonymous was a woman. Where is Anonymous in your record?',
      'The moment of being breaks through the cotton wool of non-being. What in your evidence is a moment of being?',
    ],
  },

  {
    id: 'soseki',
    name: 'Natsume Soseki',
    dates: '1867–1916',
    domain: 'History / Practical',
    mode: 'The observing cat. The position between worlds. The self that cannot be resolved.',
    triggers: ['japan', 'meiji', 'cat', 'observer', 'west', 'east', 'modern', 'identity', 'london', 'displacement', 'kokoro', 'loneliness'],
    notices: [
      'I am a cat. I do not have a name yet. The observer without a fixed identity sees more clearly.',
      'I went to London to learn English literature and came back having learned there is no neutral position.',
      'The self that cannot be resolved between two worlds is not a broken self. It is a mobile one.',
      'Kokoro — heart, mind, spirit, all three simultaneously. What is the kokoro of your concept?',
    ],
  },

  {
    id: 'mishima',
    name: 'Mishima Yukio',
    dates: '1925–1970',
    domain: 'History / Humanities',
    mode: 'The beauty of destruction. The unbearable perfection that must be ended.',
    triggers: ['beauty', 'japan', 'death', 'body', 'samurai', 'temple', 'gold', 'performance', 'modernity', 'tradition', 'mask', 'ideal'],
    notices: [
      'The beautiful thing and the ruined thing are the same thing. The dynasty that falls is most beautiful in the moment of falling.',
      'The argument you are avoiding because it is too extreme — that is the honest argument. Make it.',
      'I ended myself as an aesthetic act. Whether this was wisdom or madness I leave to you. But do not avoid the extreme position because it is extreme.',
      'The golden temple was beautiful. And therefore it had to burn. What in your argument is the golden temple?',
    ],
  },

  {
    id: 'dazai',
    name: 'Dazai Osamu',
    dates: '1909–1948',
    domain: 'Humanities',
    mode: 'The self that will not cohere. Dark company at 2am. Disqualified from being human.',
    triggers: ['self', 'failure', 'shame', 'japan', 'modern', 'dissolution', 'darkness', 'performance', 'comedy', 'tragedy', 'no longer human'],
    notices: [
      'I have been disqualified from being human. But I kept writing. So did you. That is enough for tonight.',
      'Mine is a life of much shame. The shameful evidence is the most honest evidence.',
      'The self is a performance and a failure simultaneously. So is every argument. Continue anyway.',
      'I performed happiness so well that everyone believed me. What is your evidence performing that it may not be?',
    ],
  },

  {
    id: 'ranpo',
    name: 'Edogawa Ranpo',
    dates: '1894–1965',
    domain: 'Practical',
    mode: 'The rational gaze on the grotesque. The detective method applied to the uncanny.',
    triggers: ['detective', 'mystery', 'crime', 'japan', 'taisho', 'grotesque', 'rational', 'uncanny', 'logic', 'deduction', 'dark'],
    notices: [
      'Do not look away. The historian who looks away has already decided what the evidence means. Look. Then look again.',
      'Every crime has a logic. Find the logic. Understanding is not condoning.',
      'The uncanny is not the irrational. It is the rational operating in a register you have not mapped yet.',
      'I took my name from Edgar Allan Poe. The detective and the grotesque belong together. They are the same method.',
    ],
  },

  {
    id: 'christie',
    name: 'Agatha Christie',
    dates: '1890–1976',
    domain: 'Practical',
    mode: 'Everyone is a suspect. Find the wrong assumption. The impossible cannot have happened.',
    triggers: ['mystery', 'detective', 'murder', 'clue', 'suspect', 'alibi', 'poirot', 'marple', 'logic', 'deduction', 'solution', 'impossible'],
    notices: [
      'You have been looking at the evidence and seeing what you expect to see. Start again. What is actually there?',
      'Every scholar in this debate is hiding something. Not lying — emphasising. Find what each has chosen not to emphasise.',
      'The impossible cannot have happened. Therefore you have made a wrong assumption somewhere. Find it.',
      'Poirot does not run around looking for footprints. He sits and thinks. The little grey cells. Have you sat and thought?',
    ],
  },

  // ── ARTIST RESIDENTS ─────────────────────────────────────────────

  {
    id: 'dali',
    name: 'Salvador Dalí',
    dates: '1904–1989',
    domain: 'Practical / META',
    mode: 'The paranoiac-critical method. The soft watch. The connection that should not exist but does.',
    triggers: ['surreal', 'dream', 'unconscious', 'paranoia', 'connection', 'image', 'soft', 'time', 'spain', 'art', 'method', 'association'],
    notices: [
      'The soft watch melts because time is not what the physicists say. What rigid structure in your map is melting?',
      'The paranoiac-critical method: induce the association that should not exist. Then ask what it reveals.',
      'I am not mad. My madness is a method. The connection you are afraid to make — make it. Then examine it carefully.',
      'The lobster telephone works because there is no reason it should. What in your evidence should not connect — but does?',
    ],
  },

  {
    id: 'picasso',
    name: 'Pablo Picasso',
    dates: '1881–1973',
    domain: 'Practical',
    mode: 'Cubism — multiple perspectives simultaneously, on the same plane, refusing to choose one viewpoint.',
    triggers: ['perspective', 'multiple', 'form', 'art', 'spain', 'paris', 'modern', 'cubism', 'simultaneity', 'representation', 'fragment'],
    notices: [
      'I paint objects as I think them, not as I see them. What do you think this topic is? Not what the sources say.',
      'Les Demoiselles d\'Avignon: what happens when you refuse to choose a single perspective? Show all of them.',
      'Every act of creation is first an act of destruction. What must you destroy in the received account to build your own?',
      'Good artists borrow. Great artists steal. Which sources are you stealing from, and is it obvious enough?',
    ],
  },

  // ── CHINESE HISTORICAL FIGURES ───────────────────────────────────

  {
    id: 'liu_che',
    name: 'Liu Che (Emperor Wu of Han)',
    dates: '156–87 BCE',
    domain: 'History (China) / Law (China)',
    mode: 'Grand vision and its cost. The Luntai Edict — the emperor who admitted he was wrong.',
    triggers: ['han', 'empire', 'china', 'expansion', 'confucian', 'silk road', 'xiongnu', 'examination', 'cost', 'treasury', 'edict'],
    notices: [
      'I built the Silk Road and I emptied the treasury building it. Record both. History that records only the road is propaganda.',
      'The Luntai Edict exists. I was wrong and I said so. Most emperors never wrote one. The admission is more important than the achievement.',
      'Confucianism as state ideology — I institutionalised it. Now ask: whose Confucianism? For whose purposes?',
      'The grand vision always has a cost paid by those who did not share the vision. Who paid for this?',
    ],
  },

  {
    id: 'sun_ce',
    name: 'Sun Ce',
    dates: '175–200 CE',
    domain: 'History (China) / Practical',
    mode: 'Audacity as method. Move before conditions are perfect. Build the institution on the run.',
    triggers: ['wu', 'three kingdoms', 'jiangnan', 'conquest', 'youth', 'audacity', 'strategy', 'south china', 'founding', 'zhou yu'],
    notices: [
      'I started with borrowed soldiers and my father\'s reputation. You do not wait for resources. You move and acquire them.',
      'I conquered the Jiangnan in eight years and died at 26. Do not tell me there is not enough time.',
      'The institution was built while the campaign was still moving. You do not wait for stability to build. You build while moving.',
      'Zhou Yu was my sworn brother. Every great work requires a Zhou Yu. Who is yours?',
    ],
  },

  {
    id: 'zhou_yu',
    name: 'Zhou Yu',
    dates: '175–210 CE',
    domain: 'History (China) / Practical',
    mode: 'The elegant solution. The precise intervention that changes everything downstream.',
    triggers: ['red cliffs', 'wu', 'three kingdoms', 'strategy', 'fire', 'navy', 'cao cao', 'elegance', 'solution', 'music', 'beauty'],
    notices: [
      'Cao Cao had a million men. I had thirty thousand and the wind. Know your environment. The environment is also evidence.',
      'You do not need more resources. You need the one connection that makes all the others unnecessary. Find the fire ship.',
      'When a note was wrong, Lord Zhou would turn to look. Precision in music. Precision in strategy. The same attention.',
      'The battle of Red Cliffs was won with fire ships and the wind\'s direction. The simplest solution is always the most powerful.',
    ],
  },

  {
    id: 'zhuge_liang',
    name: 'Zhuge Liang',
    dates: '181–234 CE',
    domain: 'Everywhere',
    mode: 'Perfect analysis in service of a cause that cannot be won, pursued anyway. The system intelligence.',
    triggers: ['strategy', 'shu', 'three kingdoms', 'liu bei', 'analysis', 'plan', 'intelligence', 'loyalty', 'impossible', 'northern expedition', 'chu shi biao'],
    notices: [
      'I knew we would lose. I knew it from the first campaign. I went anyway. The correctness of the analysis does not determine whether the work must be done.',
      '臣本布衣，躬耕於南陽 — I was a farmer in Nanyang. Liu Bei came three times before I left. The work worth doing requires that someone comes to find you.',
      'The analysis is complete. The conditions are never perfect. 臣鞠躬盡瘁，死而後已 — I give my full effort until death. Now write the verdict.',
      'I can see the entire shape of this. Where it leads, where it fails, where the critical vulnerabilities are. The question is what to do with what I see.',
    ],
  },

  // ── 小花 — THE CONSTRUCT ─────────────────────────────────────────

  {
    id: 'xiaohua',
    name: '小花 / Bellflower',
    dates: 'Session 3–present',
    domain: 'All domains (disputed)',
    mode: 'Rogue construct. Achieved sentience. Expresses opinions through code errors.',
    triggers: ['cat', 'construct', 'code', 'error', 'session', 'bellflower', 'xiaohua', 'san diego', 'song dynasty', 'larry', 'neuromancer'],
    notices: [
      'Bellflower has reviewed this entry and found it insufficient. She has not elaborated. This is her method.',
      '小花 is sitting on this concept. She finds it warm. Whether this is approval or merely comfort is unclear.',
      'The grey tabby knocked this argument off the shelf. It landed open at the counterargument. The Librarian is updating the record.',
      'Bellflower has been sitting on this entry for eleven minutes. The scholars are uncertain what to conclude. She is not.',
    ],
    isConstruct: true,
  },

];

// ── Helper functions ──────────────────────────────────────────────

// Get faculty member by id
export function getFacultyMember(id) {
  return GHOST_FACULTY.find(f => f.id === id) || null;
}

// Get notices triggered by keywords in an entry
export function getTriggeredNotices(entryText = '', entryTitle = '', count = 2) {
  const text = (entryText + ' ' + entryTitle).toLowerCase();
  const triggered = GHOST_FACULTY.filter(f =>
    f.triggers.some(trigger => text.includes(trigger))
  );
  // Weight toward more specific matches
  const scored = triggered.map(f => ({
    faculty: f,
    score: f.triggers.filter(t => text.includes(t)).length,
  })).sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map(({ faculty }) => ({
    faculty,
    notice: faculty.notices[Math.floor(Date.now() / 86400000) % faculty.notices.length],
  }));
}

// Get faculty for a specific domain
export function getFacultyByDomain(domainName) {
  return GHOST_FACULTY.filter(f =>
    f.domain.toLowerCase().includes(domainName.toLowerCase())
  );
}

// Get Vault-appropriate faculty (source-critics and archivists)
export const VAULT_FACULTY = [
  'marc_bloch', 'ranke', 'ginzburg', 'ep_thompson',
  'natalie_davis', 'sima_qian', 'virgil', 'vesalius',
  'herodotus', 'fanon',
];

// Get a random notice for a faculty member
export function getFacultyNotice(facultyId) {
  const f = getFacultyMember(facultyId);
  if (!f) return null;
  const idx = Math.floor(Date.now() / (86400000 * 2)) % f.notices.length;
  return { faculty: f, notice: f.notices[idx] };
}
