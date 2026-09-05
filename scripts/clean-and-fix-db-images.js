import mongoose from 'mongoose';

async function fixDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Case = mongoose.model('Case', new mongoose.Schema({}, { strict: false }));
  const cases = await Case.find({});
  console.log(`Found ${cases.length} cases.`);

  for (const c of cases) {
    let updated = false;

    // Helper to sanitize path strings
    const cleanPath = (p) => {
      if (!p || typeof p !== 'string') return p;
      let s = p.trim();
      // Fix specific Ansh decor -> Photos mistake
      if (s.includes('Ansh') && s.includes('Decor/_EDS9275-copy.JPG.webp')) {
        s = s.replace('Decor/_EDS9275-copy.JPG.webp', 'Photos/_EDS9275-copy.JPG.webp');
      }
      // Fix Muskan makeover image if pointing to missing png.webp
      if (s.includes('makeover_muskan_Img1.png.webp')) {
        s = '/assets/webp/Production/Larios/Photos/_EDS0031.JPG.webp';
      }
      return s;
    };

    const cleanImg = cleanPath(c.get('image'));
    if (cleanImg !== c.get('image')) {
      c.set('image', cleanImg);
      updated = true;
    }

    const cleanThumb = cleanPath(c.get('thumbnail'));
    if (cleanThumb !== c.get('thumbnail')) {
      c.set('thumbnail', cleanThumb);
      updated = true;
    }

    if (Array.isArray(c.get('hero'))) {
      const newHero = c.get('hero').map(cleanPath);
      if (JSON.stringify(newHero) !== JSON.stringify(c.get('hero'))) {
        c.set('hero', newHero);
        updated = true;
      }
    }

    if (Array.isArray(c.get('album'))) {
      const newAlbum = c.get('album').map(cleanPath);
      if (JSON.stringify(newAlbum) !== JSON.stringify(c.get('album'))) {
        c.set('album', newAlbum);
        updated = true;
      }
    }

    if (Array.isArray(c.get('sections'))) {
      const newSections = c.get('sections').map(sec => {
        if (sec && sec.type === 'gallery' && sec.content && Array.isArray(sec.content.images)) {
          return {
            ...sec,
            content: {
              ...sec.content,
              images: sec.content.images.map(cleanPath)
            }
          };
        }
        return sec;
      });
      if (JSON.stringify(newSections) !== JSON.stringify(c.get('sections'))) {
        c.set('sections', newSections);
        updated = true;
      }
    }

    if (updated) {
      await c.save();
      console.log(`✓ Updated case: "${c.get('title')}"`);
    }
  }

  console.log('Database sanitization complete!');
  await mongoose.disconnect();
}

fixDatabase().catch(console.error);
