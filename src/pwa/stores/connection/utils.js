const parse = id => (Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : id);
export const join = (type, id) => `${type}_${id}`;
export const extract = mstId => {
  try {
    const [, type, id] = /(\w+)_(.+)/.exec(mstId);
    return { type, id: parse(id) };
  } catch (e) {
    throw new Error(`Invalid type passed: ${mstId}`);
  }
};
