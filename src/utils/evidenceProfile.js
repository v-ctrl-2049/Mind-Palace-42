// ── Evidence profile for an argument node ────────────────────────
export function getEvidenceProfile(node, books) {
  const linkedBooks = (node.bookIds || [])
    .map(id => books.find(b => b.id === id))
    .filter(Boolean);

  if (linkedBooks.length === 0) {
    return {
      grade: 'bare', label: 'Bare assertion',
      description: 'No sources linked — unsupported claim.',
      color: '#8a8680', borderStyle: 'dashed', opacity: 0.55, icon: '◌',
    };
  }

  const hasPrimary   = linkedBooks.some(b => b.sourceType === 'primary');
  const allSecondary = linkedBooks.every(b => b.sourceType === 'secondary');
  const noneTyped    = linkedBooks.every(b => !b.sourceType);
  const methodologies    = linkedBooks.map(b => b.methodology).filter(Boolean);
  const uniqueMethods    = [...new Set(methodologies)];
  const methodNarrow     = linkedBooks.length >= 2 && methodologies.length === linkedBooks.length && uniqueMethods.length === 1;

  if (hasPrimary) return {
    grade: 'primary', label: 'Primary source',
    description: `Backed by primary source${linkedBooks.filter(b=>b.sourceType==='primary').length>1?'s':''}: ${linkedBooks.filter(b=>b.sourceType==='primary').map(b=>b.title).join(', ')}.${methodNarrow ? ` All sources share the ${uniqueMethods[0]} framework.` : ''}`,
    color: '#2e7d5e', borderStyle: 'solid', opacity: 1, icon: '⊕', methodNarrow,
  };

  if (allSecondary) return {
    grade: 'secondary', label: 'Secondary only',
    description: `All sources are interpretations. Seek primary evidence.${methodNarrow ? ` All use ${uniqueMethods[0]}.` : ''}`,
    color: '#2c5f8a', borderStyle: 'solid', opacity: 0.85, icon: '◈', methodNarrow,
  };

  if (noneTyped) return {
    grade: 'untyped', label: 'Source type unset',
    description: 'Books linked but source types not specified in Library.',
    color: '#b07d28', borderStyle: 'solid', opacity: 0.8, icon: '◉',
  };

  return {
    grade: 'mixed', label: 'Mixed sources',
    description: 'Mix of primary and secondary — good epistemic diversity.',
    color: '#2e7d5e', borderStyle: 'solid', opacity: 0.9, icon: '⊕', methodNarrow,
  };
}

// ── Overall map evidence summary ──────────────────────────────────
export function getMapEvidenceSummary(nodes, books) {
  if (!nodes.length) return null;

  const profiles = nodes
    .filter(n => n.type !== 'verdict')
    .map(n => getEvidenceProfile(n, books));

  const total   = profiles.length;
  const counts  = {
    bare:      profiles.filter(p => p.grade === 'bare').length,
    primary:   profiles.filter(p => p.grade === 'primary').length,
    secondary: profiles.filter(p => p.grade === 'secondary').length,
    untyped:   profiles.filter(p => p.grade === 'untyped').length,
    mixed:     profiles.filter(p => p.grade === 'mixed').length,
  };
  const bareRatio        = counts.bare / total;
  const methodNarrowCount = profiles.filter(p => p.methodNarrow).length;

  let grade, label, color, description;
  if      (bareRatio > 0.5)                             { grade='D'; color='#c0392b'; label='Weak';             description=`${counts.bare} of ${total} nodes have no source backing.`; }
  else if (bareRatio > 0.2)                             { grade='C'; color='#b07d28'; label='Partial';          description=`${counts.bare} unsupported node${counts.bare!==1?'s':''} — address these to strengthen the argument.`; }
  else if (counts.primary===0 && counts.untyped===0)    { grade='B'; color='#2c5f8a'; label='Secondary-based';  description='Fully sourced but no primary evidence. Adding primary sources would strengthen the case.'; }
  else if (counts.primary > 0 && counts.bare === 0)     { grade='A'; color='#2e7d5e'; label='Well-evidenced';   description=`${counts.primary} node${counts.primary!==1?'s':''} backed by primary sources. All nodes have sources.`; }
  else                                                  { grade='B'; color='#2c5f8a'; label='Moderate';         description=`Mixed evidence quality. ${counts.bare>0?`${counts.bare} unsupported node${counts.bare!==1?'s':''}.`:'All nodes sourced.'}`; }

  const warnings = [];
  if (methodNarrowCount > 0) warnings.push(`${methodNarrowCount} node${methodNarrowCount!==1?'s':''} draw from a single methodological tradition`);
  if (counts.untyped > 0)    warnings.push(`${counts.untyped} book${counts.untyped!==1?'s':''} have no source type set`);

  return { grade, label, color, description, warnings, counts, total };
}
