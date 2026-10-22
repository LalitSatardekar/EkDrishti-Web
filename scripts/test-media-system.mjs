import { accessDestination, downloadSameOrigin } from '../src/lib/clientAccess.js'
import { arrangementOrder, balanceGridImages, restoreArrangement, shuffleGridImages } from '../src/lib/heroSelector.js'
import assert from 'node:assert/strict'
import { createBlockInstance, duplicateBlockInstance, reorderBlockInstances, updateBlockById } from '../src/lib/caseBlocks.js'
import { carouselGap, carouselPage, imageLayout, justifiedRows, mediaAsset, mediaAssets, parseVideoSource } from '../src/lib/media.js'
import { parseDesignEmbed } from '../src/lib/designEmbed.js'

const youtube = parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
assert.equal(youtube.provider, 'youtube')
assert.equal(youtube.id, 'dQw4w9WgXcQ')

for (const url of [
  'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing',
  'https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUv'
]) {
  const drive = parseVideoSource(url)
  assert.equal(drive.provider, 'google-drive')
  assert.equal(drive.embedUrl, 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/preview')
}
assert.equal(parseVideoSource('https://cdn.example.com/movie.mp4').provider, 'direct')
assert.ok(parseVideoSource('https://drive.google.com/file/d/bad/view').error)

const figmaSource = 'https://www.figma.com/proto/nrPSsILSYjesyc5UHjYYa4/Portfolio?node-id=5-3&starting-point-node-id=5%3A3'
const figma = parseDesignEmbed(figmaSource)
assert.equal(figma.provider, 'figma')
assert.equal(new URL(figma.embedUrl).hostname, 'embed.figma.com')
assert.equal(new URL(figma.embedUrl).searchParams.get('node-id'), '5-3', 'Figma frame information must be preserved')
assert.equal(new URL(figma.embedUrl).searchParams.get('starting-point-node-id'), '5:3', 'Figma prototype information must be preserved')
const canva = parseDesignEmbed('https://www.canva.com/design/DAGExample12/view?utm_content=DAGExample12')
assert.equal(canva.provider, 'canva')
assert.ok(new URL(canva.embedUrl).searchParams.has('embed'))
assert.ok(parseDesignEmbed('https://www.canva.com/design/DAGExample12/edit').error, 'Canva editor links must be rejected')
assert.ok(parseDesignEmbed('https://evil.example/iframe').error, 'arbitrary iframe hosts must be rejected')
assert.ok(parseDesignEmbed('<iframe src="https://www.figma.com/design/example"></iframe>').error, 'iframe HTML must be rejected')

const imageA = createBlockInstance({ type: 'Image Section', order: 1, title: 'A', settings: { imageLayout: { mode: 'fullWidth' } } })
const imageB = createBlockInstance({ type: 'Image Section', order: 2, title: 'B', settings: { imageLayout: { mode: 'grid', columnsDesktop: 4, columnsTablet: 2, columnsMobile: 1, gapX: 12, gapY: 12 } } })
const imageC = createBlockInstance({ type: 'Image Section', order: 3, title: 'C', settings: { imageLayout: { mode: 'carousel' }, carousel: { slidesPerViewDesktop: 2 } } })
let sections = [imageA, imageB, imageC]
sections = updateBlockById(sections, imageB.id, section => ({ ...section, settings: { ...section.settings, imageLayout: { ...section.settings.imageLayout, gapX: 24 } } }))
assert.equal(imageLayout(sections[0]).mode, 'fullWidth')
assert.deepEqual([imageLayout(sections[1]).columnsDesktop, imageLayout(sections[1]).columnsTablet, imageLayout(sections[1]).columnsMobile], [4, 2, 1])
assert.equal(imageLayout(sections[1]).gapX, 24)
assert.equal(imageLayout(sections[2]).mode, 'carousel')
assert.equal(sections[2].settings.carousel.slidesPerViewDesktop, 2)

const hero = createBlockInstance({ type: 'Hero', order: 1, title: 'Hero', content: { images: Array.from({ length: 5 }, (_, index) => ({ id: `slide-${index}`, src: `/slide-${index}.jpg`, alt: `Slide ${index}` })) }, settings: { heroMedia: { mode: 'slideshow', heightDesktop: '720px', heightMobile: '420px', carousel: { transition: 'fade', autoplay: true, interval: 4000, loop: true, arrows: true, dots: false } } } })
const restored = JSON.parse(JSON.stringify({ sections: [...sections, hero] }))
const restoredHero = restored.sections[3]
assert.equal(restoredHero.content.images.length, 5)
assert.deepEqual(restoredHero.settings.heroMedia.carousel, { transition: 'fade', autoplay: true, interval: 4000, loop: true, arrows: true, dots: false })
assert.equal(imageLayout(restored.sections[1]).columnsTablet, 2)

const embeds = [
  createBlockInstance({ type: 'Design Embed', order: 1, title: 'A', content: { url: figmaSource }, settings: { heightDesktop: 900 } }),
  createBlockInstance({ type: 'Design Embed', order: 2, title: 'B', content: { url: canva.sourceUrl }, settings: { heightDesktop: 600 } }),
  createBlockInstance({ type: 'Design Embed', order: 3, title: 'C', content: { url: figmaSource.replace('5-3', '8-4') }, settings: { heightDesktop: 800 } })
]
const movedEmbeds = reorderBlockInstances(embeds, embeds[2].id, 0)
assert.deepEqual(movedEmbeds.map(block => block.title), ['C', 'A', 'B'])
assert.deepEqual(movedEmbeds.map(block => block.settings.heightDesktop), [800, 900, 600], 'reordering embeds must preserve independent settings')
const embedClone = duplicateBlockInstance(embeds[0], 2)
embedClone.content.url = canva.sourceUrl
embedClone.settings.heightDesktop = 500
assert.equal(embeds[0].content.url, figmaSource, 'changing a cloned embed URL must not affect its source')
assert.equal(embeds[0].settings.heightDesktop, 900, 'changing cloned embed layout must not affect its source')
const restoredEmbeds = JSON.parse(JSON.stringify(movedEmbeds))
assert.deepEqual(restoredEmbeds.map(block => block.settings.heightDesktop), [800, 900, 600], 'embed settings must survive save and refresh')

const asset = mediaAsset({ src: '/photo.jpg', objectFit: 'contain', width: 1200, height: 800, originalUrl: '/source.jpg', focalX: 0 })
assert.equal(asset.objectFit, 'contain')
assert.equal(asset.width, 1200)
assert.equal(asset.originalUrl, '/source.jpg')
assert.equal(asset.focalX, 0)
const repeatedIds = mediaAssets([{ id: 'same', src: '/a.jpg' }, { id: 'same', src: '/b.jpg' }])
assert.equal(new Set(repeatedIds.map(item => item.id)).size, 2, 'legacy repeated media IDs must not link per-image controls or React keys')
assert.deepEqual(mediaAssets(repeatedIds).map(item => item.id), repeatedIds.map(item => item.id))
for (const width of [320, 768, 1440]) {
  const photos = [1.5, 0.7, 2, 1, 0.6, 1.8, 1.2].map((ratio, index) => ({ id: index, ratio }))
  const rows = justifiedRows(photos, width, { targetRowHeight: 220, gapX: 16, minRowHeight: 100, maxRowHeight: 400 })
  assert.deepEqual(rows.flatMap(row => row.items.map(item => item.id)), photos.map(item => item.id), 'justified rows must preserve every image and its order')
  for (const row of rows) {
    assert.ok(row.widths.reduce((sum, value) => sum + value, 0) + (row.widths.length - 1) * 16 <= width + 0.01, 'rows must fit without horizontal overflow')
    row.items.forEach((item, index) => assert.ok(Math.abs(row.widths[index] / row.height - item.ratio) < 0.001, 'horizontal masonry must preserve aspect ratios'))
  }
}
assert.equal(carouselPage(99, 0, 1, true), 0)
assert.equal(carouselPage(2, 1, 1, true), 0)
assert.equal(carouselPage(4, 5, 2, false), 3)
assert.equal(carouselPage(4, 5, 2, true), 0)
assert.equal(carouselPage(-1, 5, 2, true), 3)
assert.equal(carouselGap(16, 800, 3), 16)
assert.ok(carouselGap(100, 300, 5) * 4 + 5 <= 300, 'large configured gaps must leave room for every visible slide on a narrow viewport')
assert.equal(carouselGap(100, 0, 5), 0, 'unmeasured containers must not overflow before the first resize observation')
assert.equal(imageLayout({ settings: { layout: { columns: 5, gap: 0 } } }).gapX, 0)
console.log('Case Study media-system regression checks passed (providers, compatibility, responsive justified rows and carousel bounds).')

// Static Hero operations must preserve the exact asset records and all settings.
const richHero = [
  { id:'p1', src:'/portrait.png', width:300, height:600, focalX:12, caption:'Keep me', placement:{height:320,aspectRatio:'3 / 4'}, custom:{value:1} },
  { id:'p2', src:'/portrait-2.png', width:300, height:600 },
  { id:'l1', src:'/wide.png', width:900, height:300 },
  { id:'l2', src:'/wide-2.png', width:900, height:300 },
  { id:'s1', src:'/square.png', width:400, height:400 }
]
const originalHero = structuredClone(richHero)
for (const mode of ['grid','verticalMasonry','horizontalMasonry']) {
  const layout = { mode, columnsDesktop:3, gapX:16, gapY:12, targetRowHeight:200 }
  const before = structuredClone(layout)
  const result = balanceGridImages(richHero, {}, layout)
  assert.deepEqual([...arrangementOrder(result)].sort(), [...arrangementOrder(richHero)].sort())
  assert.ok(result.every(item => richHero.includes(item)), 'balancing must move original references')
  assert.deepEqual(layout,before)
}
assert.notDeepEqual(arrangementOrder(balanceGridImages(richHero,{}, {mode:'grid',columnsDesktop:3})),arrangementOrder(richHero))
for(let n=0;n<30;n++) {
  const result=shuffleGridImages(richHero)
  assert.notDeepEqual(arrangementOrder(result),arrangementOrder(richHero))
  assert.deepEqual(restoreArrangement(result,arrangementOrder(richHero)),richHero)
}
const changed = [{...richHero[1],focalX:88},richHero[0],{id:'new',src:'/new.png'}]
const restoredHeroOrder=restoreArrangement(changed,arrangementOrder(richHero))
assert.deepEqual(arrangementOrder(restoredHeroOrder),['p1','p2','new'])
assert.equal(restoredHeroOrder[1].focalX,88,'reset order must preserve later placement edits')
assert.deepEqual(richHero,originalHero)
assert.deepEqual(balanceGridImages([],{}, {mode:'masonry'}),[])
assert.equal(shuffleGridImages([richHero[0]])[0],richHero[0])
assert.equal(balanceGridImages(['/missing-a','/missing-b'],{}, {mode:'horizontalMasonry'}).length,2)
console.log('Static Hero arrangement regression checks passed (metadata, layouts, shuffle, recovery and missing dimensions).')

for(const value of ['javascript:alert(1)','data:text/html,test','file:///test','vbscript:msgbox(1)','//evil.example','https://user:password@example.com','https://good.example\\evil','java\nscript:alert(1)']) assert.equal(accessDestination({type:'external',value}).href,'')
for(const value of ['//evil.example','/\\evil.example','https://external.example','javascript:alert(1)']) assert.equal(accessDestination({type:'internal',value}).href,'')
assert.equal(accessDestination({type:'internal',value:'/contact?from=case#form'}).href,'/contact?from=case#form')
assert.equal(accessDestination({type:'email',value:'client@example.com'}).href,'mailto:client@example.com')
assert.equal(accessDestination({type:'email',value:'x@example.com?body=bad'}).href,'')
assert.equal(accessDestination({type:'phone',value:'+919876543210'}).href,'tel:+919876543210')
assert.equal(accessDestination({type:'whatsapp',value:'+919876543210'}).href,'https://wa.me/919876543210')
assert.equal(accessDestination({type:'download',value:'/uploads/album.zip'}).download,true)
assert.equal(downloadSameOrigin('/uploads/album.zip','https://studio.example'),true)
assert.equal(downloadSameOrigin('https://drive.google.com/album','https://studio.example'),false)
assert.equal(accessDestination({type:'external',value:'https://photos.google.com/share/example'}).href,'https://photos.google.com/share/example')
assert.equal(accessDestination({type:'unsupported',value:'https://example.com'}).href,'')
console.log('Client Access destination checks passed (all actions, unsafe protocols, internal routes and cross-origin download handling).')
