import { accessButtons, accessElementId, accessLayout } from '../src/lib/clientAccess.js'
import assert from 'node:assert/strict'
import {
  createBlockInstance,
  ensureBlockIds,
  patchBlockMedia,
  duplicateBlockInstance,
  galleryLayout,
  reorderBlockInstances,
  updateBlockById
} from '../src/lib/caseBlocks.js'
import { patchTypography, resetTypography, resolveCaseTypography } from '../src/lib/caseTypography.js'
import { normalizeCase } from '../src/lib/config.js'
import { heroMode, imageLayout } from '../src/lib/media.js'

const gallery = (title, columns, gap = 16, mode = 'masonry') => {
  const block = createBlockInstance({ type: 'Gallery', order: 1, title, content: { images: [`/${title}.jpg`] } })
  block.settings.layout = { columns, gap, mode }
  return block
}

let blocks = [gallery('Gallery A', 2, 12), gallery('Gallery B', 3, 32, 'grid'), gallery('Gallery C', 5, 20)]
assert.equal(new Set(blocks.map(block => block.id)).size, 3, 'every block must have a unique ID')

blocks = updateBlockById(blocks, blocks[1].id, block => ({ ...block, settings: { ...block.settings, layout: { ...block.settings.layout, columns: 4 } } }))
assert.deepEqual(blocks.map(block => galleryLayout(block).columns), [2, 4, 5], 'updating Gallery B must not change A or C')
assert.deepEqual(blocks.map(block => galleryLayout(block).gap), [12, 32, 20], 'gallery gaps must remain independent')
assert.deepEqual(blocks.map(block => galleryLayout(block).mode), ['masonry', 'grid', 'masonry'], 'gallery modes must remain independent')

const duplicate = duplicateBlockInstance(blocks[0], 4)
assert.notEqual(duplicate.id, blocks[0].id, 'duplicates must receive a new ID')
duplicate.settings.layout.columns = 5
duplicate.content.images.push('/copy-only.jpg')
assert.equal(blocks[0].settings.layout.columns, 2, 'duplicate nested settings must not share references')
assert.equal(blocks[0].content.images.length, 1, 'duplicate nested content must not share references')

const sequence = [
  createBlockInstance({ type: 'Hero', order: 1, title: 'Hero' }),
  createBlockInstance({ type: 'Video', order: 2, title: 'Video' }),
  gallery('Gallery A', 2, 12),
  gallery('Gallery B', 4, 28, 'grid'),
  createBlockInstance({ type: 'CTA', order: 5, title: 'CTA' })
]
const galleryBId = sequence[3].id
const reordered = reorderBlockInstances(sequence, galleryBId, 1)
assert.deepEqual(reordered.map(block => block.title), ['Hero', 'Gallery B', 'Video', 'Gallery A', 'CTA'], 'dragging Gallery B to position 2 must reorder the array')
assert.deepEqual(reordered.map(block => block.order), [1, 2, 3, 4, 5], 'display and persisted order must be recalculated')
assert.equal(reordered[1].id, galleryBId, 'reordering must retain the stable block ID')
assert.deepEqual(galleryLayout(reordered[1]), { columns: 4, gap: 28, mode: 'grid' }, 'reordering must retain block configuration')
const reloadedSequence = JSON.parse(JSON.stringify(reordered)).sort((a, b) => a.order - b.order)
assert.deepEqual(reloadedSequence.map(block => block.id), reordered.map(block => block.id), 'saved and reloaded order must remain identical')

const galleryBClone = duplicateBlockInstance(reordered[1], 3)
const withClone = [...reordered.slice(0, 2), galleryBClone, ...reordered.slice(2)].map((block, index) => ({ ...block, order: index + 1 }))
galleryBClone.settings.layout.columns = 6
const movedClone = reorderBlockInstances(withClone, galleryBClone.id, withClone.length)
assert.equal(galleryLayout(movedClone.find(block => block.id === galleryBId)).columns, 4, 'moving and editing a clone must not affect its source')
assert.equal(galleryLayout(movedClone.find(block => block.id === galleryBClone.id)).columns, 6, 'the clone must retain its independent configuration after moving')

const freshGallery = createBlockInstance({ type: 'Gallery', order: 5, title: 'Gallery D' })
assert.equal(galleryLayout(freshGallery).columns, 3, 'new galleries must use defaults instead of the last edited value')

const textA = createBlockInstance({ type: 'Rich Text', order: 6, title: 'Text A', settings: { typographyOverrides: { richText: { textAlign: 'left', fontSizeDesktop: '40' } } } })
const textB = createBlockInstance({ type: 'Rich Text', order: 7, title: 'Text B', settings: { typographyOverrides: { richText: { textAlign: 'center', fontSizeDesktop: '64' } } } })
assert.equal(resolveCaseTypography({}, textA, 'richText').textAlign, 'left')
assert.equal(resolveCaseTypography({}, textB, 'richText').textAlign, 'center')
assert.equal(resolveCaseTypography({}, textA, 'richText').fontSizeDesktop, '40')
assert.equal(resolveCaseTypography({}, textB, 'richText').fontSizeDesktop, '64')

const videoA = createBlockInstance({ type: 'Video', order: 8, title: 'Video A', settings: { autoplay: false } })
const videoB = createBlockInstance({ type: 'Video', order: 9, title: 'Video B', settings: { autoplay: true } })
assert.equal(videoA.settings.autoplay, false)
assert.equal(videoB.settings.autoplay, true)

const restored = JSON.parse(JSON.stringify([...blocks, duplicate, freshGallery, textA, textB, videoA, videoB]))
assert.deepEqual(restored.slice(0, 3).map(block => galleryLayout(block).columns), [2, 4, 5], 'save/reload must retain independent gallery columns')
assert.equal(resolveCaseTypography({}, restored[5], 'richText').textAlign, 'left')
assert.equal(resolveCaseTypography({}, restored[6], 'richText').textAlign, 'center')
assert.equal(restored[7].settings.autoplay, false)
assert.equal(restored[8].settings.autoplay, true)

const sameType = [
  createBlockInstance({ type: 'Image Section', order: 1, title: 'Image A', content: { images: [{ id: 'photo-a', src: '/a.jpg', focalX: 20, appearance: { color: 'red' } }] }, settings: { imageLayout: { columnsDesktop: 2 }, carousel: { interval: 2000 } } }),
  createBlockInstance({ type: 'Image Section', order: 2, title: 'Image B', settings: { imageLayout: { columnsDesktop: 3, mode: 'masonry' }, carousel: { interval: 9000 } } }),
  createBlockInstance({ type: 'Hero', order: 3, title: 'Static Hero', settings: { heroMedia: { mode: 'static', carousel: { interval: 3000 } } } }),
  createBlockInstance({ type: 'Hero', order: 4, title: 'Video Hero', settings: { heroMedia: { mode: 'video', videoUrl: 'https://example.com/video.mp4', carousel: { interval: 8000 } } } })
]
const cloneImage = duplicateBlockInstance(sameType[0], 5)
let independent = [...sameType, cloneImage]
independent = updateBlockById(independent, cloneImage.id, block => {
  block.content.images[0].appearance.color = 'blue'
  block.settings.imageLayout.columnsDesktop = 6
  return patchTypography(block, 'sectionHeading', { fontFamily: 'Playfair Display', fontSizeMobile: '28', color: '#ffaa00' })
})
assert.equal(sameType[0].content.images[0].appearance.color, 'red', 'even a mutating updater must receive an isolated working copy')
assert.equal(imageLayout(independent[0]).columnsDesktop, 2)
assert.equal(imageLayout(independent[1]).columnsDesktop, 3)
assert.equal(heroMode(independent[2]), 'static')
assert.equal(heroMode(independent[3]), 'video')
assert.equal(independent[0].settings.carousel.interval, 2000)
assert.equal(independent[1].settings.carousel.interval, 9000)
independent = patchBlockMedia(independent, cloneImage.id, images => [...images, '/copy-only.jpg'])
assert.equal(independent[0].content.images.length, 1)
assert.equal(independent[4].content.images.length, 2)
independent = patchBlockMedia(independent, cloneImage.id, images => images.slice(1))
assert.equal(independent[0].content.images[0].src, '/a.jpg')
independent = updateBlockById(independent, sameType[0].id, block => patchTypography(block, 'sectionHeading', { fontFamily: 'Inter', fontSizeMobile: '18', fontSizeDesktop: '48' }))
independent = updateBlockById(independent, cloneImage.id, block => patchTypography(block, 'caption', { color: '#ff0000' }, 'caption-one'))
assert.equal(resolveCaseTypography({}, independent[0], 'sectionHeading').fontFamily, 'Inter')
assert.equal(resolveCaseTypography({}, independent[4], 'sectionHeading').fontFamily, 'Playfair Display')
assert.equal(resolveCaseTypography({}, independent[0], 'sectionHeading').fontSizeMobile, '18')
assert.equal(resolveCaseTypography({}, independent[4], 'sectionHeading').fontSizeMobile, '28')
const serialized = JSON.parse(JSON.stringify(reorderBlockInstances(independent, cloneImage.id, 0)))
const reloaded = normalizeCase({ _id: 'qa-case', sections: serialized })
assert.equal(imageLayout(reloaded.sections[0]).columnsDesktop, 6)
assert.equal(resolveCaseTypography({}, reloaded.sections[0], 'caption', 'caption-one').color, '#ff0000')
const reset = updateBlockById(reloaded.sections, cloneImage.id, block => resetTypography(block))
assert.equal(resolveCaseTypography({}, reset[0], 'sectionHeading').fontFamily, undefined)
assert.equal(resolveCaseTypography({}, reset.find(block => block.id === sameType[0].id), 'sectionHeading').fontFamily, 'Inter')
const repaired = ensureBlockIds([{ id: 'duplicate', type: 'Hero' }, { id: 'duplicate', type: 'Hero' }, { type: 'Gallery' }], 'qa')
assert.equal(new Set(repaired.map(block => block.id)).size, 3)
assert.equal(ensureBlockIds(repaired, 'qa')[1].id, repaired[1].id, 'ID repair must be stable after reload')
const legacy = normalizeCase({ _id: 'legacy', hero: ['/hero.jpg'], album: ['/hero.jpg', '/album.jpg'], sections: [{ id: 'hero-a', type: 'Hero' }, { id: 'hero-b', type: 'Hero' }, { id: 'album-a', type: 'Album Gallery' }, { id: 'album-b', type: 'Album Gallery' }] })
legacy.sections[0].content.images.push('/new-hero.jpg')
legacy.sections[2].content.images.push('/new-album.jpg')
assert.deepEqual(legacy.sections[1].content.images, ['/hero.jpg'])
assert.deepEqual(legacy.sections[3].content.images, ['/album.jpg'])
assert.equal(legacy.sections[0].settings.imageLayout, undefined, 'legacy Hero arrangements must not acquire a new layout silently')
assert.deepEqual(normalizeCase({ sections: [{ id: 'empty', type: 'Hero', content: { images: [] } }], hero: ['/old.jpg'] }).sections[0].content.images, [], 'cleared block media must not be repopulated from project fallbacks')
const inheritedProject = { typography: { sectionHeading: { color: '#ffffff', fontFamily: 'Inter', fontSizeDesktop: '48' } } }
let layered = createBlockInstance({ type: 'Image Section', title: 'Layered typography', order: 1, settings: { typography: { color: '#ffaa00', lineHeight: '1.4' }, typographyOverrides: { sectionHeading: { fontWeight: 600 } } } })
layered = patchTypography(layered, 'sectionHeading', { fontSizeMobile: '22', color: '#00ff00' }, 'heading-one')
assert.deepEqual(resolveCaseTypography(inheritedProject, layered, 'sectionHeading', 'heading-one'), { color: '#00ff00', fontFamily: 'Inter', fontSizeDesktop: '48', lineHeight: '1.4', fontWeight: 600, fontSizeMobile: '22' })
const roleReset = resetTypography(layered, 'sectionHeading', 'heading-one')
assert.equal(resolveCaseTypography(inheritedProject, roleReset, 'sectionHeading', 'heading-one').color, '#ffaa00')
assert.equal(resolveCaseTypography(inheritedProject, resetTypography(layered), 'sectionHeading').color, '#ffffff')
const defaultHeroA = createBlockInstance({ type: 'Hero', order: 1 }), defaultHeroB = createBlockInstance({ type: 'Hero', order: 2 })
defaultHeroA.settings.heroMedia.carousel.interval = 1200
assert.equal(defaultHeroB.settings.heroMedia.carousel.interval, 5000, 'new Hero blocks must not share nested carousel defaults')
console.log('Case block isolation regression checks passed (media, Hero modes, deep updates, IDs, typography, reset and normalization).')

const legacyAccess = normalizeCase({ _id:'access-case', driveLinks:{allFiles:'https://drive.google.com/drive/folders/original'}, sections:[{id:'legacy-access',type:'Client Access',order:1,content:{buttonText:'Original Album'},settings:{}}] })
assert.equal(legacyAccess.sections[0].content.buttons[0].action.value,'https://drive.google.com/drive/folders/original')
assert.equal(legacyAccess.sections[0].content.buttons[0].label,'Original Album')
assert.deepEqual(normalizeCase(legacyAccess).sections,legacyAccess.sections,'normalization must be idempotent')
const emptyAccess=normalizeCase({...legacyAccess,sections:[{...legacyAccess.sections[0],content:{buttons:[],link:'https://old.example/old'}}]})
assert.deepEqual(emptyAccess.sections[0].content.buttons,[],'explicit deletion must not resurrect legacy links')
const originalAccess={...legacyAccess.sections[0],settings:{accessLayout:{mode:'custom',gap:27},textOverrides:{[accessElementId(legacyAccess.sections[0].content.buttons[0].id)]:{fontSizeMobile:'17',color:'#123456'}}}}
const copiedAccess=duplicateBlockInstance(originalAccess,2)
assert.notEqual(copiedAccess.content.buttons[0].id,originalAccess.content.buttons[0].id)
assert.deepEqual(copiedAccess.settings.textOverrides[accessElementId(copiedAccess.content.buttons[0].id)],{fontSizeMobile:'17',color:'#123456'})
let accessSections=[originalAccess,copiedAccess]
accessSections=updateBlockById(accessSections,copiedAccess.id,section=>({...section,content:{...section.content,buttons:section.content.buttons.map(button=>({...button,label:'Independent',position:{x:80,y:12}}))},settings:{...section.settings,accessLayout:{...section.settings.accessLayout,gap:44}}}))
assert.equal(accessSections[0].content.buttons[0].label,'Original Album')
assert.equal(accessLayout(accessSections[0]).gap,27)
assert.equal(accessSections[1].content.buttons[0].position.x,80)
assert.equal(accessSections[1].settings.textOverrides[accessElementId(copiedAccess.content.buttons[0].id)].fontSizeMobile,'17')
const repairedAccess=accessButtons({id:'repair',content:{buttons:[{id:'same',label:'A'},{id:'same',label:'B'},{}]}})
assert.equal(new Set(repairedAccess.map(button=>button.id)).size,3)
assert.equal(accessButtons({id:'many',content:{buttons:Array.from({length:120},(_,index)=>({label:'Button '+index}))}}).length,120)
console.log('Client Access isolation checks passed (legacy links, independent buttons, ID repair, deep duplication and typography remapping).')
