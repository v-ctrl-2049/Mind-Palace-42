import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import LiveStream from './components/LiveStream';
import TopicList from './components/TopicList';
import TopicPage from './components/TopicPage';
import LibraryView from './components/LibraryView';
import BookEditModal from './components/BookEditModal';
import TimelineView from './components/TimelineView';
import EventEditModal from './components/EventEditModal';
import MindMapView from './components/MindMapView';
import TypeManager from './components/TypeManager';
import { useStorage as useLocalStorage } from './hooks/useStorage';
import PaperlessView from './components/PaperlessView';
import ReadingLog from './components/ReadingLog';
import ArticleEditModal from './components/ArticleEditModal';
import { REGIONS } from './data/timeline';
import ArchiveView from './components/ArchiveView';
import InvestigationView from './components/InvestigationView';
import AnatomyView from './components/AnatomyView';
import VaultView from './components/VaultView';
import { DEFAULT_THOUGHT_TYPES, DEFAULT_EVENT_TYPES, DEFAULT_NODE_TYPES, DEFAULT_EDGE_TYPES, DEFAULT_GENRES, DEFAULT_INV_TYPES, DEFAULT_METHODOLOGIES } from './data/types';
import GenreManager from './components/GenreManager';

const EMPTY_BOOK = { title: '', author: '', year: null, publisher: '', pages: null, genre: '', isbn: '', language: 'English', originalLanguage: '', translator: '', status: 'want-next', progress: 0, progressType: 'page', startedAt: null, finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '', wantToReadPriority: 'next', wantToReadReason: '', coverStyle: 'color', color: '#7a6a52', notes: '', summary: '', groupId: '' };
const EMPTY_EVENT = { title: '', dateRaw: '', region: 'china', type: 'political', bookIds: [], quote: '', note: '', tags: [] };

export default function App() {
  const [books, setBooks]         = useLocalStorage('rm_books', []);
  const [thoughts, setThoughts]   = useLocalStorage('rm_thoughts', []);
  const [topics, setTopics]       = useLocalStorage('rm_topics', []);
  const [groups, setGroups]       = useLocalStorage('rm_groups', []);
  const [articleGroups, setArticleGroups] = useLocalStorage('rm_article_groups', []);
  const [events, setEvents]       = useLocalStorage('rm_events', []);
  const [mmNodes, setMmNodes]     = useLocalStorage('rm_mm_nodes', []);
  const [mmEdges, setMmEdges]     = useLocalStorage('rm_mm_edges', []);
  const [investigations, setInvestigations] = useLocalStorage('rm_investigations', []);
  const [invTypes, setInvTypes]             = useLocalStorage('rm_inv_types', DEFAULT_INV_TYPES);
  const [dismissedTags, setDismissedTags]   = useLocalStorage('rm_dismissed_tags', []);
  const [thoughtTypes,  setThoughtTypes]  = useLocalStorage('rm_thought_types',  DEFAULT_THOUGHT_TYPES);
  const [eventTypes,    setEventTypes]    = useLocalStorage('rm_event_types',    DEFAULT_EVENT_TYPES);
  const [nodeTypes,     setNodeTypes]     = useLocalStorage('rm_node_types',     DEFAULT_NODE_TYPES);
  const [edgeTypes,     setEdgeTypes]     = useLocalStorage('rm_edge_types',     DEFAULT_EDGE_TYPES);
  const [genres,        setGenres]        = useLocalStorage('rm_genres',         DEFAULT_GENRES);
  const [methodologies, setMethodologies] = useLocalStorage('rm_methodologies',  DEFAULT_METHODOLOGIES);
  const [readingLog,    setReadingLog]    = useLocalStorage('rm_reading_log',    []);
  const [domains,       setDomains]       = useLocalStorage('rm_domains',        []);
  const [anatomy,       setAnatomy]       = useLocalStorage('rm_anatomy',        []);
  const [vault,         setVault]         = useLocalStorage('rm_vault',          []);
  const [articles, setArticles] = useLocalStorage('rm_articles', []);

  const [activeView,      setActiveView]      = useState('stream');
  const [previousView,    setPreviousView]    = useState(null);
  const [activeBook,      setActiveBook]      = useState('all');
  const [activeTopicId,   setActiveTopicId]   = useState(null);
  const [archiveItemId,   setArchiveItemId]   = useState(null);
  const [editingBook,     setEditingBook]     = useState(null);
  const [isNewBook,       setIsNewBook]       = useState(false);
  const [editingArticle,  setEditingArticle]  = useState(null);
  const [isNewArticle,    setIsNewArticle]    = useState(false);
  const [editingEvent,    setEditingEvent]    = useState(null);
  const [isNewEvent,      setIsNewEvent]      = useState(false);
  const [managingTypes,   setManagingTypes]   = useState(null);
  const [showGenreManager,       setShowGenreManager]       = useState(false);
  const [showMethodologyManager, setShowMethodologyManager] = useState(false);

  useEffect(() => {
    if (!edgeTypes || edgeTypes.length === 0) setEdgeTypes(DEFAULT_EDGE_TYPES);
  }, []); // eslint-disable-line

  useEffect(() => {
    const handler = (e) => {
      const { bookId, summary } = e.detail;
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, summary } : b));
    };
    window.addEventListener('save-book-summary', handler);
    return () => window.removeEventListener('save-book-summary', handler);
  }, [setBooks]);

  const EMPTY_ARTICLE = { type: 'article', title: '', author: '', year: null, journal: '', volume: '', issue: '', doi: '', url: '', pages: null, genre: '', groupId: '', color: '#2c5f8a', coverStyle: 'color', status: 'want-next', progress: 0, startedAt: null, finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '', wantToReadPriority: 'next', wantToReadReason: '', abstract: '', notes: '', summary: '', connectedBookIds: [] };
  const handleOpenAddArticle  = () => { setEditingArticle({ ...EMPTY_ARTICLE, id: uuidv4() }); setIsNewArticle(true); };
  const handleOpenEditArticle = (a) => { setEditingArticle(a); setIsNewArticle(false); };
  const handleSaveArticle = (updated) => {
    if (isNewArticle) setArticles(prev => [...prev, updated]);
    else setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    setEditingArticle(null);
  };
  const handleDeleteArticle = (id) => { setArticles(prev => prev.filter(a => a.id !== id)); };

  const handleOpenAddBook  = () => { setEditingBook({ ...EMPTY_BOOK, id: uuidv4() }); setIsNewBook(true); };
  const handleOpenEditBook = (book) => { setEditingBook(book); setIsNewBook(false); };
  const handleSaveBook = (updated) => {
    if (isNewBook) setBooks(prev => [...prev, updated]);
    else setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditingBook(null);
  };
  const handleDeleteBook = (id) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    setThoughts(prev => prev.filter(t => t.bookId !== id));
  };

  const handleAddThought    = (data) => setThoughts(prev => [{ id: uuidv4(), createdAt: new Date().toISOString(), topics: [], ...data }, ...prev]);
  const handleDeleteThought = (id) => {
    setThoughts(prev => prev.filter(t => t.id !== id));
    setTopics(prev => prev.map(tp => ({ ...tp, thoughtIds: tp.thoughtIds.filter(tid => tid !== id) })));
  };
  const handleUpdateThought = (updated) => setThoughts(prev => prev.map(t => t.id === updated.id ? updated : t));

  const handleCreateTopic = (initial = {}) => {
    const t = { id: uuidv4(), parentId: null, title: 'Untitled topic', summary: '', essay: '', thoughtIds: [], confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...initial };
    setTopics(prev => [t, ...prev]);
    setActiveTopicId(t.id);
    setActiveView('topics');
  };
  const handleUpdateTopic = (updated) => setTopics(prev => prev.map(t => t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t));
  const handleDeleteTopic = (id) => { setTopics(prev => prev.filter(t => t.id !== id && t.parentId !== id)); setActiveTopicId(null); };

  const handleOpenAddEvent  = () => { setEditingEvent({ ...EMPTY_EVENT, id: uuidv4() }); setIsNewEvent(true); };
  const handleOpenEditEvent = (ev) => { setEditingEvent({ ...ev, bookIds: ev.bookIds || (ev.bookId ? [ev.bookId] : []) }); setIsNewEvent(false); };
  const handleSaveEvent = (updated) => {
    if (isNewEvent) setEvents(prev => [...prev, updated]);
    else setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingEvent(null);
  };
  const handleDeleteEvent = (id) => { setEvents(prev => prev.filter(e => e.id !== id)); setEditingEvent(null); };

  const activeTopic = topics.find(t => t.id === activeTopicId);
  const activeTopicThoughts = activeTopic ? thoughts.filter(t => activeTopic.thoughtIds.includes(t.id)) : [];

  const typeManagerConfig = {
    thought: { title: 'Thought types', types: thoughtTypes, onUpdate: setThoughtTypes, hasColor: true, hasDash: false },
    event:   { title: 'Event types',   types: eventTypes,   onUpdate: setEventTypes,   hasColor: true, hasDash: false },
    node:    { title: 'Node types',    types: nodeTypes,    onUpdate: setNodeTypes,    hasColor: true, hasDash: false },
    edge:    { title: 'Edge types',    types: edgeTypes,    onUpdate: setEdgeTypes,    hasColor: true, hasDash: true  },
  };
  const tmConfig = managingTypes ? typeManagerConfig[managingTypes] : null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        books={books} groups={groups} activeView={activeView} activeBook={activeBook}
        onViewChange={v => { setActiveView(v); if (v !== 'topics') setActiveTopicId(null); }}
        onBookChange={setActiveBook} onAddBook={handleOpenAddBook} onUpdateGroups={setGroups}
        thoughts={thoughts} thoughtTypes={thoughtTypes}
        investigations={investigations} topics={topics} events={events}
        onOpenArchive={(itemId) => { setArchiveItemId(itemId); setActiveView('archive'); }}
        onPinBook={id => setBooks(prev => prev.map(b => b.id === id ? { ...b, pinned: !b.pinned } : b))}
        readingLog={readingLog}
        anatomy={anatomy}
        observatory={JSON.parse(localStorage.getItem('rm_observatory') || '[]')} />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'stream' && (
          <LiveStream thoughts={thoughts} books={books} articles={articles} activeBook={activeBook} thoughtTypes={thoughtTypes}
            onAdd={handleAddThought} onDelete={handleDeleteThought} onUpdate={handleUpdateThought}
            onManageTypes={() => setManagingTypes('thought')}
            onOpenArchive={(itemId) => { setArchiveItemId(itemId); setActiveView('archive'); }} />
        )}
        {activeView === 'topics' && !activeTopic && (
          <TopicList
            topics={topics} thoughts={thoughts} investigations={investigations}
            domains={domains} onUpdateDomains={setDomains}
            selectedTopicId={activeTopicId}
            onSelect={t => setActiveTopicId(t.id || t)}
            onCreateTopic={(opts={}) => handleCreateTopic(opts)} />
        )}
        {activeView === 'topics' && activeTopic && (
          <TopicPage
            topic={activeTopic} thoughts={activeTopicThoughts} allThoughts={thoughts}
            books={books} articles={articles} thoughtTypes={thoughtTypes}
            investigations={investigations} events={events} domains={domains} anatomy={anatomy}
            onUpdate={handleUpdateTopic} onDelete={handleDeleteTopic} onBack={() => setActiveTopicId(null)}
            onCreateSubTopic={(parentId) => handleCreateTopic({ parentId, title: 'New sub-topic' })}
            onViewInvestigation={() => setActiveView('investigation')}
            onAddLog={entry => setReadingLog(prev => [entry, ...prev])}
            onReturnToMeta={previousView === 'mindmap' ? () => { setPreviousView(null); setActiveView('mindmap'); } : null} />
        )}
        {activeView === 'library' && (
          <LibraryView books={books} groups={groups} onEdit={handleOpenEditBook} onAdd={handleOpenAddBook}
            onUpdateGroups={setGroups} thoughtTypes={thoughtTypes}
            onAddThought={handleAddThought}
            onUpdateBook={updated => setBooks(prev => prev.map(b => b.id === updated.id ? updated : b))}
            onOpenArchive={(itemId) => { setArchiveItemId(itemId); setActiveView('archive'); }} />
        )}
        {activeView === 'log' && (
          <ReadingLog
            entries={readingLog} books={books} articles={articles}
            investigations={investigations} topics={topics}
            onAdd={entry => setReadingLog(prev => [entry, ...prev])}
            onDelete={id => setReadingLog(prev => prev.filter(e => e.id !== id))}
            onUpdate={updated => setReadingLog(prev => prev.map(e => e.id === updated.id ? updated : e))}
            onUpdateInvestigations={setInvestigations} />
        )}
        {activeView === 'sources' && (
          <PaperlessView
            articles={articles} articleGroups={articleGroups} books={books} genres={genres}
            onEdit={handleOpenEditArticle} onAdd={handleOpenAddArticle}
            onUpdateGroups={setArticleGroups} />
        )}
        {activeView === 'archive' && (
          <ArchiveView
            books={books} articles={articles} thoughts={thoughts} thoughtTypes={thoughtTypes}
            initialItemId={archiveItemId}
            onAddThought={handleAddThought} onDeleteThought={handleDeleteThought}
            onUpdateThought={handleUpdateThought}
            onClearInitial={() => setArchiveItemId(null)}
            onAddLog={entry => setReadingLog(prev => [entry, ...prev])} />
        )}
        {activeView === 'timeline' && (
          <TimelineView events={events} books={books} eventTypes={eventTypes}
            onAdd={handleOpenAddEvent} onEdit={handleOpenEditEvent}
            onUpdate={updated => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))}
            onManageTypes={() => setManagingTypes('event')}
            onAddLog={entry => setReadingLog(prev => [entry, ...prev])} />
        )}
        {activeView === 'mindmap' && (
          <MindMapView nodes={mmNodes} edges={mmEdges} books={books} topics={topics} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            onUpdateNodes={setMmNodes} onUpdateEdges={setMmEdges}
            onManageNodeTypes={() => setManagingTypes('node')}
            onManageEdgeTypes={() => setManagingTypes('edge')}
            onNavigateToTopic={label => {
              const match = topics.find(t => t.title.toLowerCase() === label.toLowerCase())
                         || topics.find(t => t.title.toLowerCase().includes(label.toLowerCase()))
                         || topics.find(t => label.toLowerCase().includes(t.title.toLowerCase()));
              if (match) { setPreviousView('mindmap'); setActiveTopicId(match.id); setActiveView('topics'); }
            }} />
        )}
        {activeView === 'investigation' && (
          <InvestigationView
            investigations={investigations} books={books} events={events}
            invTypes={invTypes} onUpdateInvTypes={setInvTypes}
            onUpdate={updated => setInvestigations(prev => prev.map(i => i.id === updated.id ? updated : i))}
            onAdd={inv => setInvestigations(prev => [...prev, inv])}
            onDelete={id => setInvestigations(prev => prev.filter(i => i.id !== id))}
            onSwitchToTimeline={() => setActiveView('timeline')}
            onAddLog={entry => setReadingLog(prev => [entry, ...prev])} />
        )}
        {activeView === 'anatomy' && (
          <AnatomyView
            entries={anatomy} onUpdate={setAnatomy}
            books={books} topics={topics} investigations={investigations} />
        )}
        {activeView === 'vault' && (
          <VaultView
            entries={vault} onUpdate={setVault}
            books={books} topics={topics} investigations={investigations} />
        )}
      </main>

      {editingBook && <BookEditModal book={editingBook} groups={groups} genres={genres} methodologies={methodologies} isNew={isNewBook} onSave={handleSaveBook} onDelete={handleDeleteBook} onClose={() => setEditingBook(null)} onManageGenres={() => setShowGenreManager(true)} onManageMethodologies={() => setShowMethodologyManager(true)} />}
      {editingArticle && <ArticleEditModal article={editingArticle} groups={articleGroups} genres={genres} methodologies={methodologies} books={books} isNew={isNewArticle} onSave={handleSaveArticle} onDelete={handleDeleteArticle} onClose={() => setEditingArticle(null)} onManageGenres={() => setShowGenreManager(true)} onManageMethodologies={() => setShowMethodologyManager(true)} />}
      {editingEvent && <EventEditModal event={editingEvent} books={books} eventTypes={eventTypes} regions={REGIONS} isNew={isNewEvent} onSave={handleSaveEvent} onDelete={handleDeleteEvent} onClose={() => setEditingEvent(null)} onManageTypes={() => setManagingTypes('event')} />}
      {tmConfig && <TypeManager title={tmConfig.title} types={tmConfig.types} onUpdate={tmConfig.onUpdate} onClose={() => setManagingTypes(null)} hasColor={tmConfig.hasColor} hasDash={tmConfig.hasDash} />}
      {showGenreManager && <GenreManager genres={genres} onUpdate={setGenres} onClose={() => setShowGenreManager(false)} />}
      {showMethodologyManager && <GenreManager genres={methodologies} onUpdate={setMethodologies} onClose={() => setShowMethodologyManager(false)} />}
    </div>
  );
}
