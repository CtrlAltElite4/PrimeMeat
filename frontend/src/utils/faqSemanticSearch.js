let extractorPromise = null;
let cachedIndex = null;
let indexPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import(
        /* @vite-ignore */
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1"
      );

      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })().catch((error) => {
      extractorPromise = null;
      throw error;
    });
  }

  return extractorPromise;
}

export async function buildFaqIndex(faqs) {
  const signature = faqs.map((faq) => `${faq.id}:${faq.question}`).join("|");

  if (cachedIndex?.signature === signature) {
    return cachedIndex;
  }

  if (indexPromise?.signature === signature) {
    return indexPromise.promise;
  }

  const promise = (async () => {
    const extractor = await getExtractor();
    const entries = [];

    for (const faq of faqs) {
      const output = await extractor(faq.question, {
        pooling: "mean",
        normalize: true,
      });

      entries.push({
        id: faq.id,
        vector: Array.from(output.data),
      });
    }

    const index = { signature, extractor, entries };

    cachedIndex = index;

    return index;
  })();

  indexPromise = { signature, promise };

  try {
    return await promise;
  } finally {
    if (indexPromise?.promise === promise) {
      indexPromise = null;
    }
  }
}

export async function findRelevantFaqIds(question, index) {
  if (!index || index.entries.length === 0) {
    return [];
  }

  const output = await index.extractor(question, {
    pooling: "mean",
    normalize: true,
  });

  const questionVector = output.data;

  const scored = index.entries.map((faq) => {
    let score = 0;

    for (let i = 0; i < questionVector.length; i++) {
      score += questionVector[i] * faq.vector[i];
    }

    return {
      id: faq.id,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 10).map((faq) => faq.id);
}
