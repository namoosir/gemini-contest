export const chunkTextDynamically = (text: string): string[] => {
  const CLAUSE_BOUNDARIES = /\.|\?|!|;|, (and|but|or|nor|for|yet|so)/;
  const MAX_CHUNK_LENGTH = 100;

  const clauseBoundaries = [
    ...text.matchAll(new RegExp(CLAUSE_BOUNDARIES, "g")),
  ];
  const boundariesIndices = clauseBoundaries.map((boundary) => boundary.index);

  const chunks: string[] = [];
  let start = 0;

  for (const boundaryIndex of boundariesIndices) {
    const chunk = text.slice(start, boundaryIndex! + 1).trim();
    if (chunk.length <= MAX_CHUNK_LENGTH) {
      chunks.push(chunk);
    } else {
      const subchunks = chunk.split(",");
      let tempChunk = "";
      for (const subchunk of subchunks) {
        if (tempChunk.length + subchunk.length <= MAX_CHUNK_LENGTH) {
          tempChunk += subchunk + ",";
        } else {
          if (tempChunk.split(" ").length >= 3) {
            chunks.push(tempChunk.trim());
          }
          tempChunk = subchunk + ",";
        }
      }
      if (tempChunk) {
        if (tempChunk.split(" ").length >= 3) {
          chunks.push(tempChunk.trim());
        }
      }
    }
    start = boundaryIndex! + 1;
  }

  const remainingText = text.slice(start).trim();
  if (remainingText) {
    const remainingSubchunks = [];
    for (let i = 0; i < remainingText.length; i += MAX_CHUNK_LENGTH) {
      remainingSubchunks.push(remainingText.slice(i, i + MAX_CHUNK_LENGTH));
    }
    chunks.push(...remainingSubchunks);
  }

  return chunks;
};

export const getAudioBuffer = async (response: ReadableStream<Uint8Array>) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return Buffer.from(dataArray.buffer);
};
