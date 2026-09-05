import mongoose from 'mongoose';

const S3_BASE = 'https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/webp';

const encodeAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  let full = url;
  if (full.startsWith('/assets/webp')) {
    full = full.replace('/assets/webp', S3_BASE);
  } else if (full.startsWith('/assets/original')) {
    full = full.replace('/assets/original', 'https://assets-ekdrishti.s3.eu-north-1.amazonaws.com/original');
  }

  // Ensure decoded first, then encodeURI (which preserves &, ?, = but encodes spaces to %20)
  try {
    let clean = full;
    while (clean.includes('%20') || clean.includes('%26') || clean.includes('%25')) {
      const prev = clean;
      clean = decodeURIComponent(clean);
      if (clean === prev) break;
    }
    return encodeURI(clean);
  } catch (_) {
    return encodeURI(full);
  }
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Case = mongoose.model('Case', new mongoose.Schema({}, { strict: false }));
  const cases = await Case.find({});
  console.log(`Auditing ${cases.length} cases from MongoDB...`);

  const allItems = [];

  for (const c of cases) {
    const list = [
      { field: 'image', val: c.get('image') },
      { field: 'thumbnail', val: c.get('thumbnail') },
      { field: 'thumbnail169', val: c.get('thumbnail169') },
      { field: 'thumbnail32', val: c.get('thumbnail32') },
      ...(Array.isArray(c.get('hero')) ? c.get('hero').map((h, i) => ({ field: `hero[${i}]`, val: h })) : []),
      ...(Array.isArray(c.get('album')) ? c.get('album').map((a, i) => ({ field: `album[${i}]`, val: a })) : [])
    ];

    if (Array.isArray(c.get('sections'))) {
      c.get('sections').forEach((s, si) => {
        if (s && s.content && Array.isArray(s.content.images)) {
          s.content.images.forEach((img, ii) => {
            list.push({ field: `sec[${si}].img[${ii}]`, val: img });
          });
        }
      });
    }

    for (const item of list) {
      if (item.val && typeof item.val === 'string' && item.val.trim() && !item.val.endsWith('.mp4')) {
        allItems.push({
          caseTitle: c.get('title'),
          caseId: c.get('id') || c.get('_id'),
          field: item.field,
          rawUrl: item.val,
          encodedUrl: encodeAssetUrl(item.val)
        });
      }
    }
  }

  console.log(`Total URLs to test: ${allItems.length}`);

  const concurrency = 25;
  const broken = [];
  let completed = 0;

  for (let i = 0; i < allItems.length; i += concurrency) {
    const chunk = allItems.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const res = await fetch(item.encodedUrl, { method: 'HEAD' });
          if (res.status !== 200) {
            broken.push({ ...item, status: res.status });
          }
        } catch (err) {
          broken.push({ ...item, error: err.message });
        } finally {
          completed++;
        }
      })
    );
  }

  console.log(`Finished auditing. Tested: ${completed}, Broken: ${broken.length}`);
  if (broken.length > 0) {
    console.log('Broken images:');
    broken.forEach(b => console.log(`[${b.caseTitle}] ${b.field}: ${b.rawUrl} => ${b.status || b.error}`));
  } else {
    console.log('ALL images resolve with 200 OK!');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
