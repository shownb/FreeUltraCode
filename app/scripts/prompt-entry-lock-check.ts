import assert from 'node:assert/strict';
import {
  appendComposerDraftState,
  isPromptEntryDisabled,
  shouldRefocusComposerAfterAppend,
} from '../src/lib/composerEntryPolicy.ts';

assert.equal(isPromptEntryDisabled('running'), true);
assert.equal(isPromptEntryDisabled('design'), false);

assert.equal(shouldRefocusComposerAfterAppend('running'), false);
assert.equal(shouldRefocusComposerAfterAppend('design'), true);

assert.deepEqual(appendComposerDraftState('', '  First prompt  ', false), {
  draft: 'First prompt',
  focusVersionDelta: 1,
});

assert.deepEqual(
  appendComposerDraftState('First prompt', 'Second prompt', false),
  {
    draft: 'First prompt\nSecond prompt',
    focusVersionDelta: 1,
  },
);

assert.deepEqual(
  appendComposerDraftState('First prompt\n', 'Second prompt', false),
  {
    draft: 'First prompt\nSecond prompt',
    focusVersionDelta: 1,
  },
);

assert.deepEqual(
  appendComposerDraftState('First prompt', 'Second prompt', true),
  {
    draft: 'First prompt',
    focusVersionDelta: 0,
  },
);

assert.deepEqual(appendComposerDraftState('   ', 'Second prompt', false), {
  draft: 'Second prompt',
  focusVersionDelta: 1,
});

assert.deepEqual(
  appendComposerDraftState('First prompt', '   ', false),
  {
    draft: 'First prompt',
    focusVersionDelta: 0,
  },
);

console.log('prompt-entry-lock checks passed');
